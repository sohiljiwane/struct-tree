import fs from 'fs';
import path from 'path';
import chokidar from 'chokidar';
import { AppConfig } from './cli';
import { FilterEngine } from './utils/filter';
import { TreeBuilder } from './utils/builder';
import { MarkdownFormatter } from './utils/formatter';
import { Debouncer } from './utils/debouncer';
import { ZipTreeBuilder } from './utils/zip-builder';
import { Annotator } from './utils/annotator';

export class Orchestrator {
  public static run(config: AppConfig) {
    try {
      console.log(`\n🔍 Analyzing directory: ${path.resolve(config.targetPath)}...`);

      const filterEngine = new FilterEngine(config.targetPath, config.ignorePatterns);
      const annotator = new Annotator(config.targetPath, config.useAnnotations);
      const builder = new TreeBuilder(config.targetPath, filterEngine, config.maxDepth, annotator);
      const formatter = new MarkdownFormatter();
      const resolvedOutputPath = path.resolve(config.outputPath);

      // Helper function to build and write the tree
      const generateAndWriteTree = () => {
        let rawTree;
        if (config.isZip) {
          console.log(`📦 ZIP mode detected. Extracting in memory...`);
          const zipBuilder = new ZipTreeBuilder(config.targetPath, filterEngine, config.maxDepth, annotator);
          rawTree = zipBuilder.build();
        } else {
          const builder = new TreeBuilder(config.targetPath, filterEngine, config.maxDepth, annotator);
          rawTree = builder.build();
        }

        if (!rawTree) {
          console.warn(`⚠️  Warning: The target path is completely ignored or empty. No tree to generate.`);
          return;
        }
        
        const markdownOutput = formatter.format(rawTree);
        const outputDir = path.dirname(resolvedOutputPath);
        
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }

        fs.writeFileSync(resolvedOutputPath, markdownOutput, 'utf-8');
      };

      // 1. Initial Generation
      generateAndWriteTree();
      console.log(`✅ Success! Project structure saved to: ${resolvedOutputPath}`);

      // 2. Watch Mode Implementation
      if (config.isWatchMode) {
        console.log(`👀 Watch mode enabled. Listening for changes... (Press Ctrl+C to exit)\n`);

        const debouncer = new Debouncer(500); // Wait 500ms after the last file change

        // Initialize Chokidar
        const watcher = chokidar.watch(config.targetPath, {
          // Leverage our existing filter engine to ignore irrelevant directories
          ignored: (testPath: string) => {
             const relativePath = path.relative(config.targetPath, testPath);
             return filterEngine.isIgnored(relativePath);
          },
          ignoreInitial: true, // Don't trigger events for files that already exist
          persistent: true,
        });

        // The action to take when a file changes
        const onChangeDetected = (event: string, changedPath: string) => {
          debouncer.execute(() => {
            const time = new Date().toLocaleTimeString();
            console.log(`🔄 [${time}] Changes detected. Regenerating tree...`);
            generateAndWriteTree();
          });
        };

        // Bind all relevant file system events to our debounced generator
        watcher
          .on('add', (p) => onChangeDetected('add', p))
          .on('unlink', (p) => onChangeDetected('delete', p))
          .on('change', (p) => onChangeDetected('modify', p))
          .on('addDir', (p) => onChangeDetected('addDir', p))
          .on('unlinkDir', (p) => onChangeDetected('deleteDir', p));
      }

    } catch (error: any) {
      console.error(`❌ Error generating tree: ${error.message}`);
      process.exit(1);
    }
  }
}
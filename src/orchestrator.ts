import fs from 'fs';
import path from 'path';
import { AppConfig } from './cli';
import { FilterEngine } from './utils/filter';
import { TreeBuilder } from './utils/builder';
import { MarkdownFormatter } from './utils/formatter';

export class Orchestrator {
  /**
   * The main execution flow of the application.
   */
  public static run(config: AppConfig) {
    try {
      console.log(`\n🔍 Analyzing directory: ${path.resolve(config.targetPath)}...`);

      // 1. Initialize the worker engines
      const filterEngine = new FilterEngine(config.targetPath, config.ignorePatterns);
      const builder = new TreeBuilder(config.targetPath, filterEngine, config.maxDepth);
      const formatter = new MarkdownFormatter();

      // 2. Build the raw data structure
      const rawTree = builder.build();

      if (!rawTree) {
        console.warn('⚠️  Warning: The target path is completely ignored or empty.');
      }

      // 3. Format the data into Markdown
      const markdownOutput = formatter.format(rawTree);

      // 4. Write to disk
      const resolvedOutputPath = path.resolve(config.outputPath);
      
      // Ensure the output directory exists before writing
      const outputDir = path.dirname(resolvedOutputPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      fs.writeFileSync(resolvedOutputPath, markdownOutput, 'utf-8');

      console.log(`✅ Success! Project structure saved to: ${resolvedOutputPath}`);

      // 5. Handle Watch Mode (Stubbed for our next step!)
      if (config.isWatchMode) {
        console.log(`👀 Watch mode enabled. Listening for changes... (Press Ctrl+C to exit)`);
        // TODO: Implement chokidar watcher here
      }

    } catch (error: any) {
      console.error(`❌ Error generating tree: ${error.message}`);
      process.exit(1);
    }
  }
}
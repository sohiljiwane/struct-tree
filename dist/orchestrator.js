"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Orchestrator = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const chokidar_1 = __importDefault(require("chokidar"));
const filter_1 = require("./utils/filter");
const builder_1 = require("./utils/builder");
const formatter_1 = require("./utils/formatter");
const debouncer_1 = require("./utils/debouncer");
const zip_builder_1 = require("./utils/zip-builder");
const annotator_1 = require("./utils/annotator");
class Orchestrator {
    static run(config) {
        try {
            console.log(`\n🔍 Analyzing directory: ${path_1.default.resolve(config.targetPath)}...`);
            const filterEngine = new filter_1.FilterEngine(config.targetPath, config.ignorePatterns);
            const annotator = new annotator_1.Annotator(config.targetPath, config.useAnnotations);
            const builder = new builder_1.TreeBuilder(config.targetPath, filterEngine, config.maxDepth, annotator);
            const formatter = new formatter_1.MarkdownFormatter();
            const resolvedOutputPath = path_1.default.resolve(config.outputPath);
            // Helper function to build and write the tree
            const generateAndWriteTree = () => {
                let rawTree;
                if (config.isZip) {
                    console.log(`📦 ZIP mode detected. Extracting in memory...`);
                    const zipBuilder = new zip_builder_1.ZipTreeBuilder(config.targetPath, filterEngine, config.maxDepth, annotator);
                    rawTree = zipBuilder.build();
                }
                else {
                    const builder = new builder_1.TreeBuilder(config.targetPath, filterEngine, config.maxDepth, annotator);
                    rawTree = builder.build();
                }
                if (!rawTree) {
                    console.warn(`⚠️  Warning: The target path is completely ignored or empty. No tree to generate.`);
                    return;
                }
                const markdownOutput = formatter.format(rawTree);
                const outputDir = path_1.default.dirname(resolvedOutputPath);
                if (!fs_1.default.existsSync(outputDir)) {
                    fs_1.default.mkdirSync(outputDir, { recursive: true });
                }
                fs_1.default.writeFileSync(resolvedOutputPath, markdownOutput, 'utf-8');
            };
            // 1. Initial Generation
            generateAndWriteTree();
            console.log(`✅ Success! Project structure saved to: ${resolvedOutputPath}`);
            // 2. Watch Mode Implementation
            if (config.isWatchMode) {
                console.log(`👀 Watch mode enabled. Listening for changes... (Press Ctrl+C to exit)\n`);
                const debouncer = new debouncer_1.Debouncer(500); // Wait 500ms after the last file change
                // Initialize Chokidar
                const watcher = chokidar_1.default.watch(config.targetPath, {
                    // Leverage our existing filter engine to ignore irrelevant directories
                    ignored: (testPath) => {
                        const relativePath = path_1.default.relative(config.targetPath, testPath);
                        return filterEngine.isIgnored(relativePath);
                    },
                    ignoreInitial: true, // Don't trigger events for files that already exist
                    persistent: true,
                });
                // The action to take when a file changes
                const onChangeDetected = (event, changedPath) => {
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
        }
        catch (error) {
            console.error(`❌ Error generating tree: ${error.message}`);
            process.exit(1);
        }
    }
}
exports.Orchestrator = Orchestrator;

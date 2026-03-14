#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const orchestrator_1 = require("./orchestrator");
const program = new commander_1.Command();
program
    .name('md-tree')
    .description('Dynamically generate Markdown project structures for content sharing')
    .version('1.0.0')
    .argument('[targetPath]', 'Path to the directory or .zip file', '.')
    .option('-o, --output <filepath>', 'Where to save the generated Markdown file', './structure.md')
    .option('-d, --depth <number>', 'Stop parsing after a certain number of levels')
    .option('-w, --watch', 'Watch the directory for changes and auto-regenerate', false)
    .option('-i, --ignore <patterns...>', 'Additional ignore patterns (e.g., -i dist coverage)')
    .option('-a, --annotate', 'Look for .structurerc to append smart descriptions', false)
    .option('--zip', 'Force Zip parsing mode', false)
    .action((targetPath, options) => {
    // 2. Map the dynamic CLI inputs to our strict AppConfig interface
    const config = {
        targetPath,
        outputPath: options.output,
        maxDepth: options.depth ? parseInt(options.depth, 10) : Infinity,
        isWatchMode: options.watch,
        ignorePatterns: options.ignore || [],
        useAnnotations: options.annotate,
        // Auto-detect ZIP is the flag isn't explicitly passed but the extension is .zip
        isZip: options.zip || targetPath.toLowerCase().endsWith('.zip'),
    };
    // 3. Hand off to the Orchestration Layer
    // TO DO
    console.log('Booting up md-tree with the following config:');
    console.table(config);
    orchestrator_1.Orchestrator.run(config);
});
program.parse(process.argv);

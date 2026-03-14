```text
struct-tree/ # Root of the md-tree CLI tool
├── src/ # TypeScript source code
│   ├── utils/ # Core worker classes
│   │   ├── annotator.ts
│   │   ├── builder.ts
│   │   ├── debouncer.ts # Prevents CPU spikes during watch mode
│   │   ├── filter.ts
│   │   ├── formatter.ts
│   │   ├── testfile.ts
│   │   └── zip-builder.ts
│   ├── cli.ts # Entry point for Commander.js terminal arguments
│   └── orchestrator.ts
├── .structurerc
├── LICENSE
├── package.json
└── README.md
```
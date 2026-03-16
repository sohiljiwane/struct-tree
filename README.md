# 🌳 struct-tree

> A dynamic, LLM-friendly CLI tool that generates auto-syncing Markdown representations of your project structure.

[![npm version](https://img.shields.io/npm/v/struct-tree.svg)](https://www.npmjs.com/package/struct-tree)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

Providing an accurate project directory map is one of the most effective ways to give context to Large Language Models (like ChatGPT, Claude, or Gemini) when asking for architecture or coding help. 

`struct-tree` solves the headaches of traditional tools like Unix `tree` by automatically respecting `.gitignore`, offering a debounced Watch Mode for real-time syncing, and outputting perfect monospace Markdown blocks.

---

## ✨ Features

* **🧠 `.gitignore` Native:** Automatically parses your local `.gitignore` files. No more massive trees polluted by `node_modules`, `dist`, or `.venv`.
* **👀 Dynamic Watch Mode:** Run it in the background. As you add, rename, or delete files, your Markdown tree instantly auto-updates.
* **🏷️ Smart Annotations:** Use a `.structurerc` file to append custom, human-readable context directly to your folders (the ultimate LLM cheat code).
* **📦 In-Memory ZIP Parsing:** Map out compressed archives without ever extracting them to your hard drive.
* **⚡ Debounced Execution:** Built to handle massive file system events (like `npm install`) without spiking your CPU or crashing.
* **📏 Depth Limiting:** Cap the recursive depth for massive monorepos to keep context windows small.

---

## 🚀 Installation

Install `struct-tree` globally to use it anywhere on your machine. We provide two commands out of the box: `struct-tree` and the lightning-fast `st` alias.

```bash
npm install -g struct-tree
```
Or, run it instantly without installing via `npx`:

```bash
npx struct-tree . -o docs/structure.md
```
🛠️ Usage
Basic Signature: `st` `[targetPath]` `[options]`

| Flag / Option |	Alias |	Description |	Default |
| :---          | :---  | :---        | :---    |
`--output <path>` |	`-o` |	Destination path for the generated Markdown file. |	`./structure.md`
`--depth <num>` |	`-d` |	Maximum directory recursion depth. | Infinity
`--watch` |	`-w` |	Enable auto-syncing watch mode. |	false
`--ignore <...>` |	`-i` |	Add extra ignore patterns (e.g., -i dist coverage). |	[]
`--annotate` |	`-a` |	Parse .structurerc for custom folder descriptions. |	false
`--zip` |	|	Force in-memory ZIP parsing mode. |	false
`--help` | `-h` | Display the help menu and all available commands. | N/A

📖 Common Workflows
1. The Quick LLM Context Grab
Generate a 2-level deep map of the current directory to copy/paste into an AI prompt.

```bash
st . --depth 2
```
2. Active Development (Auto-Sync)
Keep a living documentation file updated while you build out a new feature.

```bash
st ./src -o ./docs/architecture.md --watch
```
3. Inspecting a Deliverable
Map out a client's zipped project before you even unpack it.

```bash
st ./client-code.zip -o zip-tree.md
```
🧠 Smart Annotations (The Killer Feature)
LLMs perform drastically better when they understand why a folder exists. By adding a .structurerc JSON file to your project root, struct-tree will automatically append your descriptions to the output.

Example `.structurerc`:

```json
{
  "src/core": "Contains the main physics engine calculations",
  "src/api": "Express.js REST controllers"
}
```
Run with the `-a` flag (`st . -a`), and your tree magically gains context:

```text
├── src/
│   ├── api/ # Express.js REST controllers
│   └── core/ # Contains the main physics engine calculations
```
📄 Example Output
Running `st` on its own source code produces exactly this inside your target Markdown file, wrapped in a ````text` block so formatting is perfectly preserved when pasted into LLMs or GitHub PRs:

```text
struct-tree/
├── src/
│   ├── utils/
│   │   ├── annotator.ts
│   │   ├── builder.ts
│   │   ├── debouncer.ts
│   │   ├── filter.ts
│   │   ├── formatter.ts
│   │   └── zip-builder.ts
│   ├── cli.ts
│   └── orchestrator.ts
├── package.json
└── tsconfig.json
```
🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

📝 License
Distributed under the Apache License, Version 2.0. See `LICENSE` for more information.

***
# 🌳 struct-tree

> A dynamic, LLM-friendly CLI tool that generates auto-syncing Markdown representations of your project structure.

[![npm version](https://img.shields.io/npm/v/struct-tree.svg)](https://www.npmjs.com/package/struct-tree)

Providing an accurate project directory map is one of the most effective ways to give context to Large Language Models (like ChatGPT, Claude, or Gemini) when asking for architecture or coding help. 

`struct-tree` solves the headaches of traditional tools like Unix `tree` by automatically respecting `.gitignore`, offering a debounced Watch Mode for real-time syncing, and outputting perfect monospace Markdown blocks.

---

## ✨ Features

* **🧠 `.gitignore` Native:** Automatically parses your local `.gitignore` files. No more massive trees polluted by `node_modules`, `dist`, or `.venv`.
* **👀 Dynamic Watch Mode:** Run it in the background. As you add, rename, or delete files, your Markdown tree instantly auto-updates.
* **⚡ Debounced Execution:** Built to handle massive file system events (like `npm install`) without spiking your CPU or crashing.
* **📏 Depth Limiting:** Cap the recursive depth for massive monorepos to keep context windows small.
* **🗂️ Zero-Config Output:** Wraps the output in a ` ```text ` block so formatting is perfectly preserved when pasted into LLMs, GitHub PRs, or internal wikis.

---

## 🚀 Installation

You can install `struct-tree` globally to use it anywhere on your machine:

```bash
npm install -g struct-tree
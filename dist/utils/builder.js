"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TreeBuilder = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// 2. The Builder Class
class TreeBuilder {
    filter;
    rootPath;
    maxDepth;
    annotator;
    constructor(rootPath, filter, maxDepth = Infinity, annotator) {
        this.rootPath = path_1.default.resolve(rootPath);
        this.filter = filter;
        this.maxDepth = maxDepth;
        this.annotator = annotator;
    }
    /**
     * Kicks off the tree building process.
     */
    build() {
        // If the root directory doesn't exist, we can't build a tree
        if (!fs_1.default.existsSync(this.rootPath)) {
            throw new Error(`Path does not exist: ${this.rootPath}`);
        }
        return this.traverse(this.rootPath, 0);
    }
    /**
     * The core recursive engine.
     */
    traverse(currentPath, currentDepth) {
        // Calculate the path relative to the user's starting point
        const relativePath = path_1.default.relative(this.rootPath, currentPath) || '.';
        // 1. Consult the Filter Engine (Respect .gitignore)
        if (this.filter.isIgnored(relativePath)) {
            return null;
        }
        const stats = fs_1.default.statSync(currentPath);
        const name = relativePath === '.' ? path_1.default.basename(this.rootPath) : path_1.default.basename(currentPath);
        const isDirectory = stats.isDirectory();
        // 2. Create the base Node
        const node = {
            name,
            type: isDirectory ? 'directory' : 'file',
            relativePath,
            annotation: this.annotator.getAnnotation(relativePath), // Fetch annotation if it exists
        };
        // 3. Handle File specific properties
        if (!isDirectory) {
            node.extension = path_1.default.extname(currentPath);
            node.sizeInBytes = stats.size;
            return node; // End of this branch
        }
        // 4. Handle Directory specific properties (Recursion limit check)
        if (currentDepth >= this.maxDepth) {
            return node; // We stop digging deeper, but still return the folder node
        }
        // 5. Dig deeper into the directory
        node.children = [];
        const childrenNames = fs_1.default.readdirSync(currentPath);
        for (const childName of childrenNames) {
            const childPath = path_1.default.join(currentPath, childName);
            const childNode = this.traverse(childPath, currentDepth + 1);
            // If the child wasn't ignored, add it to the parent's children array
            if (childNode) {
                node.children.push(childNode);
            }
        }
        // Sort children alphabetically (Folders first, then files)
        node.children.sort((a, b) => {
            if (a.type === b.type)
                return a.name.localeCompare(b.name);
            return a.type === 'directory' ? -1 : 1;
        });
        return node;
    }
}
exports.TreeBuilder = TreeBuilder;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarkdownFormatter = void 0;
class MarkdownFormatter {
    /**
     * Takes the root TreeNode and returns a fully formatted Markdown string.
     */
    format(tree) {
        if (!tree) {
            return '```text\n(Empty or ignored directory)\n```';
        }
        const lines = [];
        // 1. Start the Markdown code block for monospace alignment
        lines.push('```text');
        // 2. Format the Root Node (usually just the folder name)
        let rootLine = `${tree.name}/`;
        if (tree.annotation) {
            rootLine += ` # ${tree.annotation}`;
        }
        lines.push(rootLine);
        // 3. Format all children recursively
        if (tree.children) {
            for (let i = 0; i < tree.children.length; i++) {
                const child = tree.children[i];
                const isLastChild = i === tree.children.length - 1;
                // Pass an empty string as the initial prefix for the first level
                lines.push(...this.formatNode(child, '', isLastChild));
            }
        }
        // 4. Close the Markdown code block
        lines.push('```');
        return lines.join('\n');
    }
    /**
     * The recursive formatter that handles drawing the correct tree branches.
     */
    formatNode(node, prefix, isLast) {
        const lines = [];
        // 1. Determine the branch character for this specific node
        // └── represents the end of a list, ├── represents an item with siblings below it
        const branch = isLast ? '└── ' : '├── ';
        // 2. Draw the node
        let nodeSuffix = node.type === 'directory' ? '/' : '';
        let line = `${prefix}${branch}${node.name}${nodeSuffix}`;
        // Append the smart annotation if it exists
        if (node.annotation) {
            line += ` # ${node.annotation}`;
        }
        lines.push(line);
        // 3. Prepare the prefix for any children this node might have
        // If this node is the last in its list, its children just get blank spaces.
        // If it has siblings below it, its children need a vertical line (│) to connect past it.
        const childPrefix = prefix + (isLast ? '    ' : '│   ');
        // 4. Recursively format children
        if (node.children) {
            for (let i = 0; i < node.children.length; i++) {
                const child = node.children[i];
                const isChildLast = i === node.children.length - 1;
                lines.push(...this.formatNode(child, childPrefix, isChildLast));
            }
        }
        return lines;
    }
}
exports.MarkdownFormatter = MarkdownFormatter;

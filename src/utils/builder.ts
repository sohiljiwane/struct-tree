import fs from 'fs';
import path from 'path';
import { FilterEngine } from './filter';
import { Annotator } from './annotator';

// 1. The Strict Data Contract
export type NodeType = 'file' | 'directory';

export interface TreeNode {
  name: string;
  type: NodeType;
  relativePath: string;
  extension?: string;
  sizeInBytes?: number;
  children?: TreeNode[];
  annotation?: string;
}

// 2. The Builder Class
export class TreeBuilder {
  private filter: FilterEngine;
  private rootPath: string;
  private maxDepth: number;
  private annotator: Annotator;

  constructor(rootPath: string, filter: FilterEngine, maxDepth: number = Infinity, annotator: Annotator) {
    this.rootPath = path.resolve(rootPath);
    this.filter = filter;
    this.maxDepth = maxDepth;
    this.annotator = annotator;
  }

  /**
   * Kicks off the tree building process.
   */
  public build(): TreeNode | null {
    // If the root directory doesn't exist, we can't build a tree
    if (!fs.existsSync(this.rootPath)) {
      throw new Error(`Path does not exist: ${this.rootPath}`);
    }
    return this.traverse(this.rootPath, 0);
  }

  /**
   * The core recursive engine.
   */
  private traverse(currentPath: string, currentDepth: number): TreeNode | null {
    // Calculate the path relative to the user's starting point
    const relativePath = path.relative(this.rootPath, currentPath) || '.';
    
    // 1. Consult the Filter Engine (Respect .gitignore)
    if (this.filter.isIgnored(relativePath)) {
      return null; 
    }

    const stats = fs.statSync(currentPath);
    const name = relativePath === '.' ? path.basename(this.rootPath) : path.basename(currentPath);
    const isDirectory = stats.isDirectory();

    // 2. Create the base Node
    const node: TreeNode = {
      name,
      type: isDirectory ? 'directory' : 'file',
      relativePath,
      annotation: this.annotator.getAnnotation(relativePath), // Fetch annotation if it exists
    };

    // 3. Handle File specific properties
    if (!isDirectory) {
      node.extension = path.extname(currentPath);
      node.sizeInBytes = stats.size;
      return node; // End of this branch
    }

    // 4. Handle Directory specific properties (Recursion limit check)
    if (currentDepth >= this.maxDepth) {
      return node; // We stop digging deeper, but still return the folder node
    }

    // 5. Dig deeper into the directory
    node.children = [];
    const childrenNames = fs.readdirSync(currentPath);

    for (const childName of childrenNames) {
      const childPath = path.join(currentPath, childName);
      const childNode = this.traverse(childPath, currentDepth + 1);
      
      // If the child wasn't ignored, add it to the parent's children array
      if (childNode) {
        node.children.push(childNode);
      }
    }

    // Sort children alphabetically (Folders first, then files)
    node.children.sort((a, b) => {
      if (a.type === b.type) return a.name.localeCompare(b.name);
      return a.type === 'directory' ? -1 : 1;
    });

    return node;
  }
}
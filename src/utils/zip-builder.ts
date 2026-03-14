import path from 'path';
import AdmZip from 'adm-zip';
import { FilterEngine } from './filter';
import { TreeNode } from './builder';

export class ZipTreeBuilder {
  private filter: FilterEngine;
  private zipPath: string;
  private maxDepth: number;

  constructor(zipPath: string, filter: FilterEngine, maxDepth: number = Infinity) {
    this.zipPath = path.resolve(zipPath);
    this.filter = filter;
    this.maxDepth = maxDepth;
  }

  public build(): TreeNode | null {
    // 1. Load the ZIP in memory
    const zip = new AdmZip(this.zipPath);
    const zipEntries = zip.getEntries();

    // 2. Create the root node representing the ZIP file itself
    const rootNode: TreeNode = {
      name: path.basename(this.zipPath),
      type: 'directory',
      relativePath: '.',
      children: [],
    };

    // A map to quickly find created directories to nest files inside them
    const pathMap = new Map<string, TreeNode>();
    pathMap.set('.', rootNode);

    // 3. Process each item inside the ZIP
    for (const entry of zipEntries) {
      // adm-zip uses forward slashes. Remove trailing slashes for directories.
      const entryName = entry.entryName.replace(/\/$/, '');
      
      // Consult the Filter Engine (respect ignores)
      if (this.filter.isIgnored(entryName)) {
        continue;
      }

      // Check depth (split the path by '/' to count how deep it is)
      const depth = entryName.split('/').length;
      if (depth > this.maxDepth) {
        continue;
      }

      // Create the node
      const isDirectory = entry.isDirectory;
      const node: TreeNode = {
        name: path.basename(entryName),
        type: isDirectory ? 'directory' : 'file',
        relativePath: entryName,
      };

      if (!isDirectory) {
        node.extension = path.extname(entryName);
        node.sizeInBytes = entry.header.size;
      } else {
        node.children = [];
      }

      pathMap.set(entryName, node);

      // 4. Attach to Parent Node
      const parentPath = path.dirname(entryName);
      // If path.dirname returns '.', or if it's a top-level file, parent is root
      const parentKey = parentPath === '.' ? '.' : parentPath;
      
      const parentNode = pathMap.get(parentKey);
      
      if (parentNode && parentNode.children) {
        parentNode.children.push(node);
      } else if (!parentNode && parentKey !== '.') {
        // Edge case: Sometimes ZIPs list files without explicitly listing the parent directory.
        // We attach them to the root as a fallback to prevent dropping files.
        rootNode.children!.push(node);
      }
    }

    // 5. Sort the tree recursively so folders appear first, then alphabetically
    this.sortTree(rootNode);

    return rootNode;
  }

  /**
   * Recursively sorts the children to match standard tree output.
   */
  private sortTree(node: TreeNode) {
    if (node.children) {
      node.children.sort((a, b) => {
        if (a.type === b.type) return a.name.localeCompare(b.name);
        return a.type === 'directory' ? -1 : 1;
      });
      for (const child of node.children) {
        this.sortTree(child);
      }
    }
  }
}
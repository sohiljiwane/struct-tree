import fs from 'fs';
import path from 'path';
import ignore, { Ignore } from 'ignore';

export class FilterEngine {
    private ig: Ignore;

    constructor(targetPath: string, customIgnores: string[] = []) {
        this.ig = ignore();

        // 1. Add absolute baseline ignores (we never want to map these)
        this.ig.add(['.git', '.DS_Store', 'node_modules']);

        // 2. Add any custom patterns the user passed via the CLI (-i flag)
        if (customIgnores.length > 0) {
            this.ig.add(customIgnores);
        }

        // 3. Attempt to find and parse a local .gitignore file
        // We look in the targetPath that the user specified.
        const gitIgnorePath = path.join(targetPath, '.gitignore');
        if (fs.existsSync(gitIgnorePath)) {
            const gitIgnoreContent = fs.readFileSync(gitIgnorePath, 'utf-8');
            this.ig.add(gitIgnoreContent);
        }
    }

    /**
     * Evaluates if a given relative path should be ignored.
     * @param relativePath The path relative to the root target directory
     * @returns boolean True if the file should be ignored, False otherwise
     * 
     */
    public isIgnored(relativePath: string): boolean {
        // The ignore library throws an error if passed an empty string,
        // which represents the root directory itself.
        if (!relativePath || relativePath === '.') {
            return false;
        }
        return this.ig.ignores(relativePath);
    }
}
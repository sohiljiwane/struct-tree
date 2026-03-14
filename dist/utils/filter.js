"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilterEngine = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const ignore_1 = __importDefault(require("ignore"));
class FilterEngine {
    ig;
    constructor(targetPath, customIgnores = []) {
        this.ig = (0, ignore_1.default)();
        // 1. Add absolute baseline ignores (we never want to map these)
        this.ig.add(['.git', '.DS_Store', 'node_modules']);
        // 2. Add any custom patterns the user passed via the CLI (-i flag)
        if (customIgnores.length > 0) {
            this.ig.add(customIgnores);
        }
        // 3. Attempt to find and parse a local .gitignore file
        // We look in the targetPath that the user specified.
        const gitIgnorePath = path_1.default.join(targetPath, '.gitignore');
        if (fs_1.default.existsSync(gitIgnorePath)) {
            const gitIgnoreContent = fs_1.default.readFileSync(gitIgnorePath, 'utf-8');
            this.ig.add(gitIgnoreContent);
        }
    }
    /**
     * Evaluates if a given relative path should be ignored.
     * @param relativePath The path relative to the root target directory
     * @returns boolean True if the file should be ignored, False otherwise
     *
     */
    isIgnored(relativePath) {
        // The ignore library throws an error if passed an empty string,
        // which represents the root directory itself.
        if (!relativePath || relativePath === '.') {
            return false;
        }
        return this.ig.ignores(relativePath);
    }
}
exports.FilterEngine = FilterEngine;

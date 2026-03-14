"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Annotator = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class Annotator {
    annotations = new Map();
    constructor(targetPath, useAnnotations) {
        if (!useAnnotations)
            return;
        // Look for a .structurerc file in the target directory
        const rcPath = path_1.default.join(targetPath, '.structurerc');
        if (fs_1.default.existsSync(rcPath)) {
            try {
                const fileContent = fs_1.default.readFileSync(rcPath, 'utf-8');
                const parsed = JSON.parse(fileContent);
                // Load the JSON keys/values into our Map
                for (const [key, value] of Object.entries(parsed)) {
                    // Normalize paths so "src/utils" matches "src/utils" on all OS types
                    const normalizedKey = path_1.default.normalize(key);
                    if (typeof value === 'string') {
                        this.annotations.set(normalizedKey, value);
                    }
                }
                console.log(`🧠 Loaded ${this.annotations.size} smart annotations from .structurerc`);
            }
            catch (error) {
                console.warn(`⚠️  Warning: Could not parse .structurerc file. Ensure it is valid JSON.`);
            }
        }
    }
    /**
     * Retrieves an annotation for a specific relative path.
     */
    getAnnotation(relativePath) {
        // Normalize the requested path to match our Map keys
        return this.annotations.get(path_1.default.normalize(relativePath));
    }
}
exports.Annotator = Annotator;

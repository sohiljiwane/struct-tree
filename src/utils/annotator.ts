import fs from 'fs';
import path from 'path';

export class Annotator {
  private annotations: Map<string, string> = new Map();

  constructor(targetPath: string, useAnnotations: boolean) {
    if (!useAnnotations) return;

    // Look for a .structurerc file in the target directory
    const rcPath = path.join(targetPath, '.structurerc');
    
    if (fs.existsSync(rcPath)) {
      try {
        const fileContent = fs.readFileSync(rcPath, 'utf-8');
        const parsed = JSON.parse(fileContent);

        // Load the JSON keys/values into our Map
        for (const [key, value] of Object.entries(parsed)) {
          // Normalize paths so "src/utils" matches "src/utils" on all OS types
          const normalizedKey = path.normalize(key);
          if (typeof value === 'string') {
            this.annotations.set(normalizedKey, value);
          }
        }
        console.log(`🧠 Loaded ${this.annotations.size} smart annotations from .structurerc`);
      } catch (error) {
        console.warn(`⚠️  Warning: Could not parse .structurerc file. Ensure it is valid JSON.`);
      }
    }
  }

  /**
   * Retrieves an annotation for a specific relative path.
   */
  public getAnnotation(relativePath: string): string | undefined {
    // Normalize the requested path to match our Map keys
    return this.annotations.get(path.normalize(relativePath));
  }
}
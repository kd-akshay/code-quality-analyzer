import fs from 'fs/promises'; 
import path from 'path';     
import { glob } from 'glob';// Using glob for pattern matching

const FILE_PATTERNS = {
  react: ["**/*.jsx", "**/*.tsx"],
  vue: ["**/*.vue"],
  angular: ["**/*.ts", "**/*.html"], // Simple .ts for Angular components/services
};

export const findProjectFiles=async(projectPath)=> {
  const allFiles = [];
  for (const type in FILE_PATTERNS) {
    for (const pattern of FILE_PATTERNS[type]) {
      // const files = await new Promise((resolve, reject) => {
      //     glob(pattern, { cwd: projectPath, nodir: true, ignore: ['**/node_modules/**', '**/*.spec.ts', '**/*.test.ts'] }, (err, matches) => {
      //         if (err) return reject(err);
      //         resolve(matches);
      //     });
      // });
      const files = await glob(pattern, {
       
        cwd: projectPath,
        nodir: true,
        ignore: [
          "**/node_modules/**",
          "**/*.spec.ts",
          "**/*.test.ts",
          "**/*.d.ts",
        ], // Added .d.ts here
      });

      files.forEach((relativePath) => {
        // Filter out .d.ts files for Angular (and React if using TSX)
        if (relativePath.endsWith(".d.ts")) return;

        // For Angular, ensure .ts files are not just standalone utility files but likely components/services
        // This is a heuristic and could be improved.
        if (type === "angular" && relativePath.endsWith(".ts")) {
          // A common pattern is component.ts, service.ts, module.ts
          if (
            !relativePath.match(
              /\.(component|service|module|pipe|directive)\.ts$/i
            ) &&
            !relativePath.match(/main\.ts$/i) &&
            !relativePath.match(/app\.routes\.ts$/i)
          ) {
            // console.debug(`Skipping Angular TS file (heuristic): ${relativePath}`);
            // return;
          }
        }
        // For Angular HTML, ensure it's not a generic HTML file
        if (type === "angular" && relativePath.endsWith(".html")) {
          if (!relativePath.match(/\.component\.html$/i)) {
            // console.debug(`Skipping Angular HTML file (heuristic): ${relativePath}`);
            // return;
          }
        }

        allFiles.push({
          type: type,
          relativePath: relativePath,
          fullPath: path.join(projectPath, relativePath),
        });
      });
    }
  }
  return allFiles;
}



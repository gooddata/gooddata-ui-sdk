// (C) 2022-2025 GoodData Corporation
import fs from 'fs';
import path from 'path';

// Create the directory structure if it doesn't exist
const ensureDirectoryExists = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

// Copy TypeScript declaration files from temp directory to esm directory
const copyDeclarationFiles = () => {
    const srcDir = path.resolve('./temp');
    const destDir = path.resolve('./esm');

    const filesToCopy = ['index.d.ts', 'tigerBackend.d.ts'];

    // Ensure the destination directory exists
    ensureDirectoryExists(destDir);

    filesToCopy.forEach((file) => {
        if (fs.existsSync(path.join(srcDir, file))) {
            fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file));
            // eslint-disable-next-line no-console
            console.log(`Copied ${file} to esm directory`);
        } else {
            // eslint-disable-next-line no-console
            console.error(`${file} not found in temp directory`);
        }
    });
};

// Execute the copy operation
copyDeclarationFiles();

// (C) 2007-2024 GoodData Corporation
import fs from 'fs';
import path from 'path';

// Get the directory from command line arguments
const bundleDir = process.argv[2];

if (!bundleDir) {
    console.error('Please provide a bundle directory');
    process.exit(1);
}

console.log(`Processing bundle directory: ${bundleDir}`);

// Verify the directory exists
if (!fs.existsSync(bundleDir)) {
    console.error(`Error: Directory does not exist: ${bundleDir}`);
    process.exit(1);
}

// Process all JSON files in the directory
try {
    const files = fs.readdirSync(bundleDir);
    const jsonFiles = files.filter(file => file.endsWith('.json'));

    console.log(`Found ${jsonFiles.length} JSON files to process`);

    if (jsonFiles.length === 0) {
        console.warn('No JSON files found in the specified directory');
    }

    jsonFiles.forEach(file => {
        try {
            const filePath = path.join(bundleDir, file);
            const outputPath = filePath.replace('.json', '.localization-bundle.ts');
            const bundleName = file.replace('.json', '').replace(/-/g, '_');

            // Read the JSON file
            const jsonData = fs.readFileSync(filePath, 'utf8');
            const bundle = JSON.parse(jsonData);

            // Create TypeScript output
            const tsContent = [
                '// (C) 2021 GoodData Corporation',
                '// DO NOT CHANGE THIS FILE, IT IS RE-GENERATED ON EVERY BUILD',
                `export const ${bundleName} = ${JSON.stringify(bundle, null, 4)};`
            ].join('\n');

            // Write the TypeScript file
            fs.writeFileSync(outputPath, tsContent);
        } catch (fileError) {
            console.error(`Error processing file ${file}: ${fileError.message}`);
        }
    });
} catch (dirError) {
    console.error(`Error reading directory ${bundleDir}: ${dirError.message}`);
    process.exit(1);
}

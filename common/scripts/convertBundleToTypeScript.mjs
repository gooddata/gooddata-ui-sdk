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

function hasComplexStructure(jsonObj) {
    const keys = Object.keys(jsonObj);
    if (keys.length === 0) return false;
    
    // Just check the first key - if it's complex, assume the whole file follows the same pattern
    const firstKey = keys[0];
    const firstValue = jsonObj[firstKey];
    
    return typeof firstValue === 'object' && firstValue !== null && 'value' in firstValue;
}

function flattenComplexObject(jsonObj) {
    const flattened = {};
    
    Object.keys(jsonObj).forEach(key => {
        const value = jsonObj[key];
        
        if (typeof value === 'object' && value !== null && 'value' in value) {
            flattened[key] = value.value;
        } else {
            flattened[key] = value;
        }
    });
    
    return flattened;
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
            const originalBundle = JSON.parse(jsonData);
            
            // Determine if the bundle has a complex structure and flatten if needed
            let bundle = originalBundle;
            if (hasComplexStructure(originalBundle)) {
                console.log(`Detected complex structure in ${file}, flattening to key-value pairs`);
                bundle = flattenComplexObject(originalBundle);
            }

            // Create TypeScript output
            const tsContent = [
                '// (C) 2021-2024 GoodData Corporation',
                '// DO NOT CHANGE THIS FILE, IT IS RE-GENERATED ON EVERY BUILD',
                `export const ${bundleName} = ${JSON.stringify(bundle, null, 4)};`
            ].join('\n');

            // Write the TypeScript file
            fs.writeFileSync(outputPath, tsContent);
            console.log(`Successfully processed ${file}`);
        } catch (fileError) {
            console.error(`Error processing file ${file}: ${fileError.message}`);
        }
    });
} catch (dirError) {
    console.error(`Error reading directory ${bundleDir}: ${dirError.message}`);
    process.exit(1);
}

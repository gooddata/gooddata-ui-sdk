#!/usr/bin/env node

// (C) 2025 GoodData Corporation

const fs = require('fs');
const { execSync } = require('child_process');

// Define the path to the package.json file
const pkgPath = "./libs/sdk-ui-all/package.json";

// Define the path for local packages
const localPackagesPath = './localPackages';

let pkg;
try {
  pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
} catch (error) {
  console.error(`Error reading package.json at ${pkgPath}:`, error);
  process.exit(1);
}

// Extract the version attribute
const version = pkg.version;
if (!version) {
  console.error('Version attribute not found in package.json.');
  process.exit(1);
}

// Get the current commit's shortened hash
let hash;
try {
  hash = execSync('git log -n 1 --pretty=format:%h').toString().trim();
} catch (error) {
  console.error('Error retrieving git commit hash:', error);
  process.exit(1);
}

// Combine version and hash into the new version string
const newVersion = `${version}-${hash}`;
console.log(`New version: ${newVersion}`);

// Build and run the Rush version command
const rushVersionCommand = `rush version --ensure-version-policy --override-version ${newVersion} --version-policy sdk`;
console.log(`Running command: ${rushVersionCommand}`);

try {
  execSync(rushVersionCommand, { stdio: 'inherit' });
} catch (error) {
  console.error('Error executing rush version command:', error);
  process.exit(1);
}

// Check if localPackagesPath exists, and if so, delete its content
if (fs.existsSync(localPackagesPath)) {
  console.log(`Directory ${localPackagesPath} exists. Removing its content...`);
  // Remove the directory recursively
  fs.rmSync(localPackagesPath, { recursive: true, force: true });
}

// Recreate the localPackagesPath directory
fs.mkdirSync(localPackagesPath);
console.log(`Directory ${localPackagesPath} is now clean.`);

// Build and run the Rush publish command
const rushPublishCommand = `rush publish --publish --include-all --version-policy sdk --pack --release-folder ${localPackagesPath}`;
console.log(`Running command: ${rushPublishCommand}`);

try {
  execSync(rushPublishCommand, { stdio: 'inherit' });
} catch (error) {
  console.error('Error executing rush publish command:', error);
  process.exit(1);
}

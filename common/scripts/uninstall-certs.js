// (C) 2024 GoodData Corporation

// Import required modules
const { exec } = require('child_process');
const { promisify } = require('util');
const { access, rm, constants } = require('fs/promises');
const path = require('path');

// Promisify exec
const execCommand = promisify(exec);

async function exists(path, permissions = constants.R_OK) {
    try {
        await access(path, permissions);
        return true;
    } catch {
        return false;
    }
}

async function main() {
    // Define the directory to store certificates
    const certDir = path.join(process.env.HOME || process.env.USERPROFILE, '.gooddata', 'certs');

    // Set the CAROOT environment variable to ensure rootCA is saved in the correct directory
    const env = { ...process.env, CAROOT: certDir };

    // Check if the certificate directory already exists
    if (!await exists(certDir)) {
        console.log(`Certificate directory does not exist, exiting.`);
        return;
    }

    // Check if mkcert is installed
    try {
        await execCommand(process.platform === 'win32' ? 'where mkcert' : 'command -v mkcert');
        console.log('mkcert is installed.');
    } catch (error) {
        throw new Error('Error: mkcert is not installed. Please install mkcert before running this script. See https://github.com/FiloSottile/mkcert for installation instructions.');
    }

    if (await exists(path.join(certDir, 'rootCA.pem'))) {
        try {
            console.log("Uninstalling root CA");
            await execCommand('mkcert -uninstall', { env });
        } catch (error) {
            throw new Error(`Error: Failed to uninstall root CA. ${error}`);
        }
    }
    try {
        console.log("Removing certificate directory");
        await rm(certDir, { recursive: true, force: true });
    } catch (error) {
        throw new Error(`Error: Failed to delete certificate directory at ${certDir}. ${error}`);
    }
}

main()
    .catch(error => {
        console.error(`An unexpected error occurred: ${error}`);
        process.exit(1);
    });

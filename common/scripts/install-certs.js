// (C) 2024 GoodData Corporation

// Import required modules
const { exec } = require('child_process');
const { promisify } = require('util');
const { access, rm, mkdir, constants } = require('fs/promises');
const path = require('path');

// Promisify exec
const execCommand = promisify(exec);

// Set the umask to ensure certs have secure permissions
process.umask(0o077);

async function exists(path, permissions = constants.R_OK) {
    try {
        await access(path, permissions);
        return true;
    } catch {
        return false;
    }
}

async function main() {
    console.log('Starting certificate generation process...');

    // Define the directory to store certificates
    const certDir = path.join(process.env.HOME || process.env.USERPROFILE, '.gooddata', 'certs');

    // Set the CAROOT environment variable to ensure rootCA is saved in the correct directory
    const env = { ...process.env, CAROOT: certDir };

    // Check if mkcert is installed
    try {
        await execCommand(process.platform === 'win32' ? 'where mkcert' : 'command -v mkcert');
    } catch (error) {
        throw new Error('Error: mkcert is not installed. Please install mkcert before running this script. See https://github.com/FiloSottile/mkcert for installation instructions.');
    }

    // Check if the certificate directory already exists
    if (await exists(certDir)) {
        console.log(`Certificate directory already exists at ${certDir}. Uninstalling root CA and deleting the directory to recreate certificates.`);
        if (await exists(path.join(certDir, 'rootCA.pem'))) {
            try {
                await execCommand('mkcert -uninstall', { env });
            } catch (error) {
                throw new Error(`Error: Failed to uninstall root CA. ${error}`);
            }
        }
        try {
            await rm(certDir, { recursive: true, force: true });
        } catch (error) {
            throw new Error(`Error: Failed to delete certificate directory at ${certDir}. ${error}`);
        }
    }

    // Create the directory
    try {
        await mkdir(certDir, { recursive: true });
        console.log(`Created certificate directory at ${certDir}`);
    } catch (mkdirError) {
        throw new Error(`Error: Failed to create certificate directory at ${certDir}. Ensure you have write permissions to the parent directory.`);
    }

    // Generate and install the root CA
    try {
        await execCommand('mkcert -install', { env });
        console.log('Root CA installed successfully.');
    } catch (error) {
        throw new Error('Error: Failed to install root CA.');
    }

    // Check if rootCA file is saved in the directory
    try {
        await access(path.join(certDir, 'rootCA.pem'));
        console.log(`rootCA.pem successfully stored in ${certDir}`);
    } catch {
        throw new Error(`Error: rootCA.pem was not saved in ${certDir}`);
    }

    // Generate localhost certificate
    try {
        await execCommand('mkcert -cert-file localhost-cert.pem localhost', { env, cwd: certDir });
        console.log('Localhost certificate generated successfully.');
    } catch (error) {
        throw new Error('Error: Failed to create localhost certificate.');
    }

    // Notify the user
    try {
        await access(path.join(certDir, 'localhost-cert.pem'));
        await access(path.join(certDir, 'localhost-key.pem'));
        console.log(`Certificates successfully stored in ${certDir}`);
    } catch {
        throw new Error('Error: Failed to create certificates.');
    }
}

main()
    .catch(error => {
        console.error(`An unexpected error occurred: ${error}`);
        process.exit(1);
    });

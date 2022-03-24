#!/usr/bin/env node
const { mkdir, readdir, readFile, rm, unlink, writeFile } = require("fs/promises");
const path = require("path");
const util = require("util");
const child_process = require("child_process");

const exec = util.promisify(child_process.exec);

const libsToBeRemoved = [
    "api-client-bear",
    "api-client-tiger",
    "api-model-bear",
    "sdk-backend-base",
    "sdk-backend-bear",
    "sdk-backend-mockingbird",
    "sdk-embedding",
    "sdk-ui-all",
    "sdk-ui-ext",
    "sdk-ui-kit",
    "sdk-ui-tests",
    "sdk-ui-tests-e2e",
];

function main() {
    // parse arguments
    let version = "";
    let help = false;
    let dev = false;
    let updateSymlink = false;
    let index = 2;
    while (index < process.argv.length) {
        if (process.argv[index] === "-v" || process.argv[index] === "--version") {
            version = process.argv[index + 1];
            index += 2;
        }
        if (process.argv[index] === "-h" || process.argv[index] === "--help") {
            help = true;
            index += 1;
        }
        if (process.argv[index] === "-d" || process.argv[index] === "--dev") {
            dev = true;
            index += 1;
        }
        if (process.argv[index] === "--update-symlink") {
            updateSymlink = true;
            index += 1;
        }
    }

    if (help) {
        printUsage();
        process.exit(0);
    }

    // always use the Next version for dev
    // also never update symlinks in dev
    if (dev) {
        version = "Next";
        updateSymlink = false;
    }

    if (!version) {
        printUsage();
        process.exit(1);
    }

    buildVersion(version, dev, updateSymlink, () => process.exit(0));
}

main();

function printUsage() {
    console.log("Usage: node build-docs.js -v VERSION [-h|--help] [-d|--dev] [--update-symlink]");
}

function writeJson(where, obj) {
    return writeFile(where, JSON.stringify(obj));
}

async function readJson(where) {
    const content = await readFile(where, { encoding: "utf8" });
    return JSON.parse(content);
}

function getFrontMatter(fileNameWithoutExtension, title) {
    return `---
id: ${fileNameWithoutExtension}
title: ${title}
sidebar_label: ${title}
---
`;
}

// run a shell command piping stdout and stderr to console
function runCommand(command, argv, cwd) {
    return new Promise((resolve, reject) => {
        const proc = child_process.spawn(command, argv, { cwd });
        proc.stdout.pipe(process.stdout);
        proc.stderr.pipe(process.stderr);
        proc.on("close", (code) => resolve(code));
        proc.on("error", (err) => reject(err));
    });
}

async function buildVersion(versionName, dev, shouldUpdateSymlink, onSuccess) {
    const dir = __dirname;
    const rootDir = path.resolve(dir, "../..");

    // Root of the ApiDocs repo
    const apiDocDir = path.resolve(rootDir, "../gooddata-ui-apidocs");

    // Root of the affected version
    const apiDocDirVersioned = path.resolve(apiDocDir, `v${versionName}`);

    // Paths to some important paths inside the affected version directory
    const apiDocDirDocs = path.resolve(apiDocDirVersioned, "docs");
    const apiDocInputDir = path.resolve(apiDocDirVersioned, "input");
    const apiDocDirVersionedWebsite = path.resolve(apiDocDirVersioned, "website");

    const sidebar = path.resolve(apiDocDirVersionedWebsite, "sidebars.json");
    const versionFile = path.resolve(apiDocDirVersionedWebsite, "version.json");

    // make sure to discard all the changes in the apidocs repo version subdirectory in dev mode on Control-C
    if (dev) {
        process.on("SIGINT", async function () {
            console.log(`Reverting apidocs v${versionName} to original state`);
            // first restore the git state in the v${versionName} dir
            child_process.execSync(`git restore -s@ -SW -- ./v${versionName}`, { cwd: apiDocDir });
            // then delete all the untracked files there
            child_process.execSync(`git clean -f -- ./v${versionName}`, { cwd: apiDocDir });
            process.exit();
        });
    }

    // clean the version folder and init it with a template
    await rm(apiDocDirVersioned, { recursive: true, force: true });
    // native node does not have recursive copy...
    await exec(`cp -rf '${path.resolve(apiDocDir, "_template")}' '${apiDocDirVersioned}'`);

    await rm(apiDocDirDocs, { recursive: true, force: true });
    await mkdir(apiDocInputDir, { recursive: true });

    await writeJson(versionFile, { version: versionName });

    // add the new version to versions.json if needed
    // Next is available by default in docusaurus, no need to add it
    if (versionName !== "Next") {
        const apiDocsVersionsList = path.resolve(apiDocDir, "versions.json");
        const versionList = await readJson(apiDocsVersionsList);
        if (!versionList.includes(versionName)) {
            versionList.unshift(versionName);
            await writeJson(apiDocsVersionsList, versionList);
        }
    }

    // Copy all the api-extractor outputs to an input folder
    // native node does not have globs...
    await exec(`cp ${rootDir}/libs/*/temp/*.api.json "${apiDocInputDir}"`);

    // Remove packages that are not "ready" for the apidocs yet
    console.log("Starting docs input sanitization");
    const inputFiles = await readdir(apiDocInputDir);
    await Promise.all(
        inputFiles.map((fileName) => {
            const withoutExtension = fileName.split(".")[0];
            if (libsToBeRemoved.includes(withoutExtension)) {
                return unlink(path.resolve(apiDocInputDir, fileName));
            }
        }),
    );

    console.log("Starting api-documenter. Generated files will be stored in apidocs/docs.");
    const apiDocumenterBin = path.resolve(
        rootDir,
        "common/temp/node_modules/@microsoft/api-documenter/bin/api-documenter",
    );
    await exec(
        `"${apiDocumenterBin}" markdown --input-folder "${apiDocInputDir}" --output-folder "${apiDocDirDocs}"`,
    );

    // Make the api-documenter output compatible with docusaurus
    // - add frontmatter
    // - fix escaping of some characters
    // - generate sidebars.json
    console.log("Starting to add front matter to markdown files and data to sidebars.json");
    const filesToProcess = await readdir(apiDocDirDocs);
    const sidebarEntries = await Promise.all(
        filesToProcess.map(async (file) => {
            const fullFilePath = path.resolve(apiDocDirDocs, file);
            const fileNameWithoutExtension = path.basename(file, ".md");
            const splitFileName = fileNameWithoutExtension.split(".");
            const packageName = splitFileName[0];
            const fileContents = await readFile(fullFilePath, { encoding: "utf8" });

            // get title for the left menu - the first ## heading value
            const title = /##\s+(.*)/.exec(fileContents)[1];

            // then strip any thing up to the last dot and after the first following space
            // for example from
            // IAnalyticalBackend.authenticate() method
            // make
            // authenticate()
            const dotIndex = title.indexOf(".");
            const memberTitle = dotIndex >= 0 ? title.substr(dotIndex + 1) : title;

            const spaceIndex = memberTitle.indexOf(" ");
            let finalTitle = spaceIndex >= 0 ? memberTitle.substr(0, spaceIndex) : memberTitle;

            // zero level deep: these are the overview files - change their title
            if (splitFileName.length === 1) {
                finalTitle = `Overview of ${finalTitle}`;
            }

            // update the md file with front matter and sanitize it for docusaurus
            const newFileContent = getFrontMatter(fileNameWithoutExtension, finalTitle) + fileContents;
            const sanitizedNewFileContent = newFileContent
                // replace "\|" by a html entity for pipe, this is necessary for union types in tables (otherwise the pipe would break the table)
                .replace(/\\\|/g, "&#124;")
                // replace escaped [ and ], we do not want them escaped as that would make the resulting HTML look wrong
                .replace(/\\\[/g, "[")
                .replace(/\\\]/g, "]");

            await writeFile(fullFilePath, sanitizedNewFileContent, { encoding: "utf8" });

            // return data for the sidebar
            // only items that are one level deep are eligible for sidebar entry
            return splitFileName.length === 2 ? [packageName, fileNameWithoutExtension] : undefined;
        }),
    );

    const sidebarData = sidebarEntries.filter(Boolean).reduce((acc, [package, entry]) => {
        if (!acc[package]) {
            // initialize the sidebar entry for a package with an item for the package overview
            acc[package] = [package];
        }
        acc[package].push(entry);
        return acc;
    }, {});

    await writeJson(sidebar, { Data: sidebarData }, { encoding: "utf8" });

    // Perform the build of the docusaurus site and prepare the results for gh-pages publication
    console.log("Running yarn install");
    await runCommand("yarn", ["install"], apiDocDirVersionedWebsite);

    if (dev) {
        console.log("Running yarn start");
        await runCommand("yarn", ["start"], apiDocDirVersionedWebsite);
    } else {
        console.log("Running yarn build");
        await runCommand("yarn", ["build"], apiDocDirVersionedWebsite);

        console.log("Moving the build outputs to appropriate place for gh-pages");
        await runCommand(
            "bash",
            [
                "-c",
                `
mv website/build/gooddata-ui-apidocs gooddata-ui-apidocs
shopt -s extglob
rm -rf !(gooddata-ui-apidocs)
mv gooddata-ui-apidocs/* .
rm -rf gooddata-ui-apidocs
`,
            ],
            apiDocDirVersioned,
        );

        if (shouldUpdateSymlink) {
            // make sure the docs root symlink will now link to the current version if requested by the CI params
            await runCommand("ln", ["-sfn", `./v${versionName}/docs`, "docs"], apiDocDir);
        }

        onSuccess();
    }
}

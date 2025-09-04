// (C) 2024 GoodData Corporation

const fs = require("fs");
const toml = require("toml");
const core = require("@actions/core");

// Get input from action
const filePath = core.getInput("path-to-version-config");
const newVersion = core.getInput("version");
const shortVersion = core.getInput("short-version");

const data = fs.readFileSync(filePath, "utf-8");

// Get the first lines that start with "#"
const lines = data.split("\n");
// Get the comment
const comment = lines.filter((line) => line.trim().startsWith("#")).join("\n");

// Parse TOML data
const parsedData = toml.parse(data);
const versionArray = parsedData.versions;

// Update version array
const [first, ...rest] = versionArray;
const [last, toRemove, ...rest2] = rest.reverse();

const lastLatestVersion = first.version;

first.version = lastLatestVersion;
first.dirpath = lastLatestVersion;
first.url = `/${lastLatestVersion}/`;

const versions = [
    { version: shortVersion, dirpath: "latest", url: `/latest/` },
    first,
    ...rest2.reverse(),
    last,
];

// Preserve apiReference section if it exists
let apiReferenceSection = "";
if (parsedData.apiReference) {
    apiReferenceSection = "\n[apiReference]\n" +
        Object.entries(parsedData.apiReference)
            .map(([key, value]) => `    ${key} = "${value}"`)
            .join("\n") + "\n";
}

// Convert to TOML
const result =
    comment +
    "\n" +
    apiReferenceSection +
    "\n" +
    versions
        .map((v) => {
            return (
                "[[versions]]\n" +
                Object.entries(v)
                    .map(([key, value]) => `    ${key} = "${value}"`)
                    .join("\n")
            );
        })
        .join("\n") +
    "\n";

console.log(`Updating ${filePath}:`);
console.log(result);
fs.writeFileSync(filePath, result);

// transform index.redir file

const redirFilePath = core.getInput("path-to-redir-config");
const redir = fs.readFileSync(redirFilePath, "utf-8");
const split = redir.split("\n");
const redirLines = split.filter((line) => !line.trim().startsWith("#"));
const redirComment = split.filter((line) => line.trim().startsWith("#"));
const [base, docs, actualSort, actualLong, ...remainingVersions] = redirLines;

// extract version between slashes /x.y.z/...
const parsedActualVersion = actualLong.match(/^\/(.*?)\//)[1];
const parsedActualVersionShort = parsedActualVersion.substring(0, parsedActualVersion.lastIndexOf("."));
const redirResult = [
    ...redirComment,
    base,
    docs,
    `/${shortVersion}/ {{ .Site.BaseURL }}/latest/ 301!`,
    `/${newVersion}/ {{ .Site.BaseURL }}/latest/ 301!`,
    `/${parsedActualVersion}/ {{ .Site.BaseURL }}/${parsedActualVersionShort}/ 301!`,
    ...remainingVersions,
];

const redirResultJoined = redirResult.join("\n");

console.log(`Updating ${redirFilePath}:`);
console.log(redirResultJoined);
fs.writeFileSync(redirFilePath, redirResultJoined);

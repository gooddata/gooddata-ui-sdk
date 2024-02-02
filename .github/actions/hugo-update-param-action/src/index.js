// (C) 2024 GoodData Corporation

const fs = require("fs");
const toml = require("toml");
const core = require("@actions/core");

// Get input from action
const filePath = core.getInput("path-to-version-config");
const newVersion = core.getInput("version");

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
    { version: newVersion, dirpath: "latest", url: `/latest/` },
    first,
    ...rest2.reverse(),
    last,
];

// Convert to TOML
const result =
    comment +
    "\n" +
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
        .join("\n");

console.log(result);

// Write to file
fs.writeFileSync(filePath, result);

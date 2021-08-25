#!/usr/bin/env node
// (C) 2020 GoodData Corporation
require("dotenv").config();
const { program } = require("commander");
const axios = require("axios").default;
const fs = require("fs").promises;
const path = require("path");
const mkdirp = require("mkdirp");
const util = require("util");
const exec = util.promisify(require("child_process").exec);

const DEFAULT_OUTPUT_DIR = "src/generated/";
const DEFAULT_OUTPUT_FILE = "openapi-spec.json";

program
    .option("--base-url <url>", "Base url where the OpenAPI specs can be downloaded.")
    .option("--username <username>", "Username to use to authenticate.")
    .option("--password <password>", "Password to use to authenticate.")
    .option("--output-dir <path>", `Path to the resulting directory. Defaults to ${DEFAULT_OUTPUT_DIR}`)
    .option("--output-file <name>", `Name of the openapi schema file. Defaults to ${DEFAULT_OUTPUT_FILE}`)
    .parse(process.argv);

const specs = [
    { path: "/api/schemas/metadata", name: "metadata-json-api" },
    { path: "/api/schemas/afm", name: "afm-rest-api" },
];

const downloadSpec = async (specMeta, outputDir, outputFile) => {
    const { data } = await axios.get(specMeta.path);
    const resultPath = path.resolve(outputDir, specMeta.name, outputFile);

    await mkdirp(path.dirname(resultPath));

    return fs.writeFile(resultPath, JSON.stringify(data, null, 4));
};

const generate = async (specMeta, outputDir, outputFile) => {
    const inputPath = path.resolve(outputDir, specMeta.name, outputFile);
    const outputPath = path.dirname(inputPath);

    /**
     * openapi-generator escapes language keywords by default, eg. property `in` converts to `_in`
     * we can disable mapping for individual items only.
     *
     * you can add other reserved words into reserved-words-mappings
     * --reserved-words-mappings in=in,for=for
     */
    await exec(
        `openapi-generator generate -i ${inputPath} -g typescript-axios -o ${outputPath} -t openapi-generator -p withInterfaces=true --reserved-words-mappings in=in,function=function`,
    );
};

const downloadAndGenerate = async (specMeta, outputDir, outputFile) => {
    await downloadSpec(specMeta, outputDir, outputFile);
    await generate(specMeta, outputDir, outputFile);
};

const main = async () => {
    const {
        baseUrl = process.env.BASE_URL,
        username = process.env.GD_USER,
        password = process.env.GD_PASSWORD,
        outputDir = process.env.OUTPUT_DIR || DEFAULT_OUTPUT_DIR,
        outputFile = process.env.OUTPUT_FILE || DEFAULT_OUTPUT_FILE,
    } = program.opts();

    if (!baseUrl) {
        console.error("You must provide a baseUrl.");
        process.exit(1);
    }

    try {
        console.error(`Getting specs from ${baseUrl}`);

        axios.defaults.auth = {
            username,
            password,
        };
        axios.defaults.baseURL = baseUrl;

        await Promise.all(specs.map((spec) => downloadAndGenerate(spec, outputDir, outputFile)));

        console.error("DONE");
    } catch (e) {
        console.error("Error", e.message);
    }
};

main();

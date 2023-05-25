#!/usr/bin/env node
// (C) 2020-2022 GoodData Corporation
import dotenv from "dotenv";
import { program } from "commander";
import axios from "axios";
import fs from "fs/promises";
import path from "path";
import mkdirp from "mkdirp";
import util from "util";
import { exec } from "child_process";
const execPromise = util.promisify(exec);

dotenv.config();

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
    { path: "/api/v1/schemas/metadata", name: "metadata-json-api" },
    {
        path: "/api/v1/schemas/afm",
        name: "afm-rest-api",
        // Remove schemaOverrides once null values are in the OpenApi spec
        // https://gooddata.atlassian.net/browse/NAS-4848
        schemaOverrides: (schema) => {
            schema.components.schemas.Element.properties.primaryTitle.nullable = true;
            schema.components.schemas.Element.properties.title.nullable = true;
            return schema;
        },
        // Remove when openapi-generator correctly generates null values in arrays
        apiOverrides: (api) => {
            // Replace AttributeFilterElements values
            return api.replace("'values': Array<string>", "'values': Array<string | null>");
        }
    },
    { path: "/api/v1/schemas/scan", name: "scan-json-api" },
    { path: "/api/v1/schemas/auth", name: "auth-json-api" },
    { path: "/api/v1/schemas/export", name: "export-json-api" },
];

const downloadSpec = async (specMeta, outputDir, outputFile) => {
    let { data } = await axios.get(specMeta.path);

    if (specMeta.schemaOverrides) {
        data = specMeta.schemaOverrides(data);
    }

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
     *
     * force sets to be mapped to arrays, it is much easier to work with arrays for us (we do find, map, and filter) on them
     * --type-mappings=set=Array
     *
     * force UPPERCASE enum naming to keep backwards compatibility with most of the existing values, and make the casing consistent
     * --additional-properties=enumPropertyNaming=UPPERCASE
     *
     * force use of a single request parameter for everything instead of using separate parameters (that would make the functions hard to use, they have many params).
     * useSingleRequestParameter=true
     */
    await execPromise(
        `openapi-generator-cli generate -i ${inputPath} -g typescript-axios -o ${outputPath} -t openapi-generator -p withInterfaces=true --reserved-words-mappings in=in,function=function --type-mappings=set=Array --additional-properties=enumPropertyNaming=UPPERCASE,useSingleRequestParameter=true`,
    );

    if (specMeta.apiOverrides) {
        const apiPath = `${outputPath}/api.ts`;
        const buffer = await fs.readFile(apiPath);
        let apiFileContent = buffer.toString();
        const updatedApiFileContent = specMeta.apiOverrides(apiFileContent);
        await fs.writeFile(apiPath, updatedApiFileContent);
    }
};

const downloadAndGenerate = async (specMeta, outputDir, outputFile) => {
    await downloadSpec(specMeta, outputDir, outputFile);
    await generate(specMeta, outputDir, outputFile);
};

const main = async () => {
    const {
        baseUrl = process.env.BASE_URL,
        token = process.env.TOKEN,
        outputDir = process.env.OUTPUT_DIR || DEFAULT_OUTPUT_DIR,
        outputFile = process.env.OUTPUT_FILE || DEFAULT_OUTPUT_FILE,
    } = program.opts();

    if (!baseUrl) {
        console.error("You must provide a baseUrl.");
        process.exit(1);
    }

    try {
        console.error(`Getting specs from ${baseUrl}`);

        axios.defaults.baseURL = baseUrl;
        if (token) {
            axios.defaults.headers["Authorization"] = `Bearer ${token}`;
        }

        await Promise.all(specs.map((spec) => downloadAndGenerate(spec, outputDir, outputFile)));

        console.error("DONE");
    } catch (e) {
        console.error("Error", e.message);
    }
};

main();

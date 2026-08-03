#!/usr/bin/env node
// (C) 2020-2026 GoodData Corporation

import { exec } from "child_process";
import fs from "fs/promises";
import path from "path";
import util from "util";

import axios from "axios";
import { program } from "commander";
import dotenv from "dotenv";
import mkdirp from "mkdirp";

const execPromise = util.promisify(exec);

dotenv.config();

const DEFAULT_OUTPUT_DIR = "src/generated/";
const DEFAULT_OUTPUT_FILE = "openapi-spec.json";
const DEFAULT_BASE_URL = "https://automation.staging-ui.stg11.panther.intgdc.com";

program
    .option("--base-url <url>", "Base url where the OpenAPI specs can be downloaded.")
    .option("--username <username>", "Username to use to authenticate.")
    .option("--password <password>", "Password to use to authenticate.")
    .option("--output-dir <path>", `Path to the resulting directory. Defaults to ${DEFAULT_OUTPUT_DIR}`)
    .option("--output-file <name>", `Name of the openapi schema file. Defaults to ${DEFAULT_OUTPUT_FILE}`)
    .option("--force", `Allow generating from a host other than ${DEFAULT_BASE_URL}.`)
    .parse(process.argv);

const specs = [
    {
        path: "/api/v1/schemas/metadata",
        name: "metadata-json-api",
        // modelNamePrefix: "Md", // we should consider prefixing in next major, due to lot of name clashes
        // Remove Aac* schemas and endpoints that cause openapi-generator 7.15.0 NPE due to 'not: { required: [...] }' pattern
        // Remove once openapi-generator handles this pattern or backend fixes the schema
        schemaOverrides: (schema) => {
            const schemasToRemove = Object.keys(schema.components.schemas).filter((name) =>
                name.startsWith("Aac"),
            );
            schemasToRemove.forEach((name) => {
                delete schema.components.schemas[name];
            });
            // Also remove the /api/v1/aac/ endpoints and any endpoints ending with Aac that reference these schemas
            const pathsToRemove = Object.keys(schema.paths).filter(
                (path) => path.startsWith("/api/v1/aac/") || path.endsWith("Aac"),
            );
            pathsToRemove.forEach((path) => {
                delete schema.paths[path];
            });
            return schema;
        },
        // Remove when openapi-generator correctly generates null values in arrays
        apiOverrides: (api) => {
            // Replace AttributeFilterElements and DependsOn values;
            return api.replaceAll("'values': Array<string>", "'values': Array<string | null>");
        },
    },
    {
        path: "/api/v1/schemas/afm",
        name: "afm-rest-api",
        // modelNamePrefix: "Afm", // we should consider prefixing in next major, due to lot of name clashes
        // Remove schemaOverrides once null values are in the OpenApi spec
        // https://gooddata.atlassian.net/browse/NAS-4848
        schemaOverrides: (schema) => {
            schema.components.schemas.Element.properties.primaryTitle.nullable = true;
            schema.components.schemas.Element.properties.title.nullable = true;
            return schema;
        },
        // Remove when openapi-generator correctly generates null values in arrays
        apiOverrides: (api) => {
            // Replace AttributeFilterElements and DependsOn values
            return api.replaceAll("'values': Array<string>", "'values': Array<string | null>");
        },
    },
    {
        path: "/api/v1/schemas/scan",
        name: "scan-json-api",
        // modelNamePrefix: "Scan" // we should consider prefixing in next major, due to lot of name clashes
    },
    {
        path: "/api/v1/schemas/auth",
        name: "auth-json-api",
        // modelNamePrefix: "Auth" // we should consider prefixing in next major, due to lot of name clashes
    },
    {
        path: "/api/v1/schemas/export",
        name: "export-json-api",
        modelNamePrefix: "Export",
        apiNameSuffix: "Export",
    },
    {
        path: "/api/v1/schemas/result",
        name: "result-json-api",
        // modelNamePrefix: "Result" // we should consider prefixing in next major, due to lot of name clashes
    },
    {
        path: "/api/v1/schemas/automation",
        name: "automation-json-api",
        modelNamePrefix: "Automation",
        apiNameSuffix: "Automation",
    },
    {
        path: "/api/v1/schemas/gen-ai",
        name: "ai-json-api",
        modelNamePrefix: "Ai",
        apiNameSuffix: "Ai",
    },
];

const sortKeys = (obj) =>
    Object.fromEntries(
        Object.keys(obj)
            .sort()
            .map((key) => [key, obj[key]]),
    );

/**
 * The backend serves `components.schemas` and the `properties` maps inside schemas in an unstable
 * order that varies between deployments. This makes the generated code non-deterministic twice
 * over: openapi-generator names deduplicated inline schemas (the JSON:API In/Out/Patch
 * `attributes`/`relationships` objects) after the first structurally identical parent it
 * encounters in schema order, and generated interface members follow the spec's property order.
 * Sorting both makes the generated output deterministic.
 *
 * `paths` must NOT be sorted: alphabetical order changes the order in which openapi-generator's
 * normalizer first visits schemas and triggers an order-sensitivity bug in openapi-generator
 * 7.15.0 — `anyOf: [X, null]` stops being simplified to a nullable X, which drops const/enum
 * types and adds spurious `[key: string]: any` index signatures (worst in the gen-ai spec).
 * Backend paths order is not stable either (deployments reshuffle it), so `pinPathsOrder`
 * below keeps the order of the previously committed spec instead.
 *
 * @param schema the downloaded OpenAPI spec
 * @returns the spec with schema and property keys sorted alphabetically, paths untouched
 */
const stabilizeSpecOrder = (schema) => {
    if (schema.components?.schemas) {
        schema.components.schemas = sortKeys(schema.components.schemas);
    }
    const sortPropertiesDeep = (value) => {
        if (Array.isArray(value)) {
            value.forEach(sortPropertiesDeep);
            return value;
        }
        if (value !== null && typeof value === "object") {
            for (const key of Object.keys(value)) {
                sortPropertiesDeep(value[key]);
            }
            if (
                value.properties &&
                typeof value.properties === "object" &&
                !Array.isArray(value.properties)
            ) {
                value.properties = sortKeys(value.properties);
            }
        }
        return value;
    };
    return sortPropertiesDeep(schema);
};

/**
 * The backend serves `paths` in an order that reshuffles between deployments, which produces
 * thousands-of-lines cosmetic diffs in the committed spec. Since paths cannot be sorted (see
 * stabilizeSpecOrder), reorder them to match the previously committed spec instead: existing
 * paths keep their committed order, new paths are appended in the order the backend sent them,
 * removed paths drop out. The committed order is one that provably produced good generator
 * output, so pinning to it also minimizes generator input churn.
 *
 * @param schema the downloaded OpenAPI spec
 * @param previousSpec the previously committed spec, or undefined on first generation
 * @returns the spec with paths reordered to follow the previous spec's order
 */
const pinPathsOrder = (schema, previousSpec) => {
    if (!schema.paths || !previousSpec?.paths) {
        return schema;
    }
    const previousOrder = Object.keys(previousSpec.paths).filter((key) => key in schema.paths);
    const newKeys = Object.keys(schema.paths).filter((key) => !(key in previousSpec.paths));
    schema.paths = Object.fromEntries([...previousOrder, ...newKeys].map((key) => [key, schema.paths[key]]));
    return schema;
};

const downloadSpec = async (specMeta, outputDir, outputFile) => {
    let data = (await axios.get(specMeta.path)).data;

    if (specMeta.schemaOverrides) {
        data = specMeta.schemaOverrides(data);
    }

    data = stabilizeSpecOrder(data);

    const resultPath = path.resolve(outputDir, specMeta.name, outputFile);

    const previousSpec = await fs
        .readFile(resultPath, "utf8")
        .then(JSON.parse)
        .catch(() => undefined);
    data = pinPathsOrder(data, previousSpec);

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
     *
     * do not reuse a structurally identical inline schema of another parent (the JSON:API In/Out/Patch
     * attributes/relationships objects are often identical) — every parent gets its own model named
     * after itself. Without this, the shared model is named after whichever parent the generator
     * processes first, so names flip (JsonApiXInAttributes <-> JsonApiXOutAttributes) whenever schema
     * order or structural identity between the variants changes.
     * --inline-schema-options SKIP_SCHEMA_REUSE=true
     */
    let command = `openapi-generator-cli generate -i ${inputPath} -g typescript-axios -o ${outputPath} -t openapi-generator -p withInterfaces=true --reserved-words-mappings in=in,function=function --type-mappings=set=Array --additional-properties=enumPropertyNaming=UPPERCASE,useSingleRequestParameter=true --inline-schema-options SKIP_SCHEMA_REUSE=true --global-property=apiDocs=false --global-property=modelDocs=false`;

    if (specMeta.modelNamePrefix) {
        command += ` --model-name-prefix=${specMeta.modelNamePrefix}`;
    }

    if (specMeta.apiNameSuffix) {
        command += ` --api-name-suffix=${specMeta.apiNameSuffix}`;
    }

    await execPromise(command, { maxBuffer: 2 * 1024 * 1024 }); // 2MB buffer (default 1MB is slightly insufficient)

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

/**
 * The specs generate in parallel, each in its own `openapi-generator-cli` process. On a fresh
 * install they race to download the generator jar to the same path and can spawn `java -jar` on a
 * half-swapped file ("Unable to access jarfile"); fetching it once up front avoids that.
 */
const ensureGeneratorDownloaded = async () => {
    await execPromise("openapi-generator-cli version");
};

/**
 * Protocol and hostname of a url, or undefined when it cannot be parsed. The port is deliberately
 * left out (unlike `URL.origin`) so that an explicit port does not count as a different deployment.
 *
 * @param url the url to take the origin of
 */
const originOf = (url) => {
    try {
        const { protocol, hostname } = new URL(url);
        return `${protocol}//${hostname}`;
    } catch {
        return undefined;
    }
};

const isForced = (forceFlag) => {
    if (forceFlag) {
        return true;
    }
    const force = (process.env.FORCE ?? "").trim().toLowerCase();
    return force !== "" && force !== "0" && force !== "false";
};

/**
 * Generating from anything other than DEFAULT_BASE_URL is a hard error: other deployments serve
 * specs for APIs that are not production-ready yet, and the resulting client silently ships them.
 * The comparison is against DEFAULT_BASE_URL as written, minus the port — so an explicit port or a
 * trailing slash does not trip the check, but any other protocol or host does.
 *
 * @param baseUrl the base url the specs would be downloaded from
 * @param forceFlag value of the --force CLI option
 */
const assertBaseUrlAllowed = (baseUrl, forceFlag) => {
    if (originOf(baseUrl) === originOf(DEFAULT_BASE_URL)) {
        return;
    }

    if (isForced(forceFlag)) {
        console.warn(`WARN: FORCE is set, generating from ${baseUrl} instead of ${DEFAULT_BASE_URL}.`);
        console.warn(`WARN: The generated client may contain APIs that are not production-ready.`);
        return;
    }

    console.error(`ERROR: Refusing to generate from ${baseUrl}.`);
    console.error(`ERROR: Use ${DEFAULT_BASE_URL} to make sure we use production-ready apis.`);
    console.error(`ERROR: To override, re-run with FORCE=true:`);
    console.error(`ERROR:   FORCE=true BASE_URL=${baseUrl} rushx generate-client`);
    process.exit(1);
};

const main = async () => {
    const {
        baseUrl = process.env.BASE_URL,
        token = process.env.TOKEN,
        outputDir = process.env.OUTPUT_DIR || DEFAULT_OUTPUT_DIR,
        outputFile = process.env.OUTPUT_FILE || DEFAULT_OUTPUT_FILE,
        force,
    } = program.opts();

    if (!baseUrl) {
        console.error("You must provide a baseUrl.");
        process.exit(1);
    }

    assertBaseUrlAllowed(baseUrl, force);

    try {
        console.error(`Getting specs from ${baseUrl}`);

        axios.defaults.baseURL = baseUrl;
        if (token) {
            axios.defaults.headers["Authorization"] = `Bearer ${token}`;
        }

        await ensureGeneratorDownloaded();

        await Promise.all(specs.map((spec) => downloadAndGenerate(spec, outputDir, outputFile)));

        console.error("DONE");
    } catch (e) {
        console.error("Error", e.message);
    }
};

void main();

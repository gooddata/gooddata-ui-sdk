// (C) 2026 GoodData Corporation

/* eslint-disable no-console -- CLI script with intentional progress logging */

//
// Generates TypeScript types and compiled JSON schema from the AAC JSON Schema source files.
// Inlines the $ref resolution logic that was previously in @gooddata/code-ast's mergeSchemas.

import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

import { compile } from "json-schema-to-typescript";
import { cloneDeep, mergeWith } from "lodash-es";
import { format as oxfmt } from "oxfmt";
import { readdirp } from "readdirp";

const mergable = ["required"];
// Match sdk/.oxfmtrc.json settings so generated files pass format-check.
const OXFMT_OPTIONS = { printWidth: 110, tabWidth: 4, trailingComma: "all" };
const GOODDATA_COPYRIGHT = `// (C) ${new Date().getFullYear()} GoodData Corporation\n\n`;

const checkMode = process.argv.includes("--check");

/**
 * Sanitize generated TSDoc comments for api-extractor compatibility.
 * Escapes curly braces (misinterpreted as inline tags), strips invalid
 * tags like @minItems/@maxItems, and removes resulting empty comment lines.
 * @param {string} source - Generated TypeScript source code.
 * @returns {string} Sanitized source code.
 */
function sanitizeTsDoc(source) {
    return source.replace(/\/\*\*[\s\S]*?\*\//g, (comment) => {
        const sanitized = comment
            .replace(/(?<!\\)\{/g, "\\{")
            .replace(/(?<!\\)\}/g, "\\}")
            .replace(/^\s*\*\s*@(?:minItems|maxItems).*$/gm, "");
        // Remove empty comment lines left after stripping tags.
        return sanitized.replace(/(\n\s*\*\s*\n)+/g, "\n");
    });
}

async function main() {
    const basedir = resolve("./schemas/v1/src");
    const saveDir = resolve("./src/v1");

    await processSchema(basedir, saveDir, "index.json", "metadata");
}

async function processSchema(basedir, saveDir, rootSchema, name) {
    let start = Date.now();

    const files = [];
    for await (const entry of readdirp(basedir, {
        fileFilter: (f) => f.fullPath.endsWith(".json"),
        depth: 5,
    })) {
        files.push(entry.fullPath);
    }

    console.log(`Found ${files.length} schema files in ${Date.now() - start}ms`);

    start = Date.now();
    const contents = files.map((file) => ({
        file,
        content: JSON.parse(readFileSync(file, "utf-8")),
    }));
    console.log(`Read ${files.length} schema files in ${Date.now() - start}ms`);

    start = Date.now();
    const root = contents.find((item) => item.file.includes(rootSchema));
    const items = contents.filter((item) => !item.file.includes(rootSchema));

    const schema = mergeSchemas(
        root.content,
        items.map((item) => item.content),
    );
    console.log(`Created schema in ${Date.now() - start}ms`);

    start = Date.now();
    const narrowedSchema = narrowSchema(schema);
    console.log(`Narrowed schema in ${Date.now() - start}ms`);

    start = Date.now();
    const def = await compile(narrowedSchema, name, { cwd: basedir });
    console.log(`Compiled schema in ${Date.now() - start}ms`);

    const typeFilename = join(saveDir, `${name}.ts`);
    const schemaFilename = join(saveDir, `${name}.json`);

    const typeContent = (await oxfmt(typeFilename, GOODDATA_COPYRIGHT + sanitizeTsDoc(def), OXFMT_OPTIONS))
        .code;
    const schemaContent = (await oxfmt(schemaFilename, JSON.stringify(schema, null, 4) + "\n", OXFMT_OPTIONS))
        .code;

    if (checkMode) {
        const existingType = readFileSync(typeFilename, "utf-8");
        const existingSchema = readFileSync(schemaFilename, "utf-8");

        const stale = [];
        if (existingType !== typeContent) stale.push(typeFilename);
        if (existingSchema !== schemaContent) stale.push(schemaFilename);
        if (stale.length) {
            console.error(`Schema check failed — these files are stale:\n  ${stale.join("\n  ")}`);
            console.error(`Run 'rushx schema-write' to regenerate.`);
            process.exit(1);
        }
        console.log(`Schema check passed — compiled metadata is up to date.`);
    } else {
        writeFileSync(typeFilename, typeContent);
        writeFileSync(schemaFilename, schemaContent);
        console.log(`Generated ${typeFilename} and ${schemaFilename} from ${files.length} schema files.`);
    }
}

// --- Inlined $ref resolution (from @gooddata/code-ast mergeSchemas + unifyReferences) ---

function mergeSchemas(root, items) {
    const jsons = [root, ...items];
    const data = { ids: {} };
    const schemas = jsons.map((item) => collectReferences(item, data));
    return unifyReferences(schemas, data);
}

function collectReferences(json, data) {
    const result = { refs: [], schema: {} };
    const schema = walkSchema(json, json, data, result);
    return { ...result, schema };
}

function walkSchema(full, obj, data, result) {
    if (obj === null || obj === undefined || typeof obj !== "object") {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map((item) => walkSchema(full, item, data, result));
    }

    const cloned = Object.keys(obj).reduce(
        (prev, key) => ({ ...prev, [key]: walkSchema(full, obj[key], data, result) }),
        {},
    );

    if (cloned.$ref) {
        result.refs.push(cloned);
    }
    if (cloned.$id) {
        data.ids[cloned.$id] = cloned;
    }

    return cloned;
}

function unifyReferences(schemas, data) {
    const root = schemas[0];

    schemas.forEach((schema) => {
        const cache = {};
        const links = schema.refs.map((ref) => ref.$ref);

        schema.refs.forEach((ref) => {
            const loaded = loadRef(schema.schema, data, cache, ref.$ref);

            const local = isLocalRef(ref.$ref);
            if (ref.$ref && local) {
                local.reduce((prev, key, i) => {
                    if (i === local.length - 1) {
                        const cloned = { ...loaded };
                        delete cloned.$id;
                        prev[key] = cloned;
                    } else {
                        prev[key] = prev[key] || {};
                    }
                    return prev[key];
                }, root.schema);
            }

            const relative = isGlobalRelativeRef(ref.$ref);
            if (ref.$ref && relative) {
                const full = ["$global", ...relative.filter(Boolean)];
                ref.$ref = `#/${full.join("/")}`;
                full.reduce((prev, key, i) => {
                    if (i === relative.length - 1) {
                        const cloned = { ...loaded };
                        delete cloned.$id;
                        prev[key] = cloned;
                    } else {
                        prev[key] = prev[key] || {};
                    }
                    return prev[key];
                }, root.schema);
            }
        });

        cleanReferences(schema, links);
    });

    return root.schema;
}

function loadRef(full, data, cache, ref) {
    if (!ref) return {};
    if (cache[ref]) return cache[ref];

    const local = isLocalRef(ref);
    if (local) {
        const schema = findInSchema(full, local);
        if (schema) {
            cache[ref] = schema;
            return schema;
        }
        return {};
    }

    const relative = isGlobalRelativeRef(ref);
    if (relative) {
        const schema = data.ids[ref];
        if (schema) {
            cache[ref] = schema;
            return schema;
        }
        return {};
    }

    return {};
}

function findInSchema(full, pathArr) {
    let find = full;
    for (let i = 0; i < pathArr.length; i++) {
        find = find ? find[pathArr[i]] : undefined;
    }
    return find;
}

function cleanReferences(schema, links) {
    links.forEach((link) => {
        const local = isLocalRef(link);
        if (local) {
            deleteProperty(schema.schema, local);
        }
    });
}

function deleteProperty(where, pathArr) {
    let obj = where;
    for (let i = 0; i < pathArr.length - 1; i++) {
        obj = obj[pathArr[i]];
        if (typeof obj === "undefined") return;
    }
    delete obj[pathArr[pathArr.length - 1]];
}

function isLocalRef(ref = "") {
    const refPath = ref.split("/");
    return ref && refPath[0] === "#" ? refPath.slice(1) : null;
}

function isGlobalRelativeRef(ref = "") {
    const refPath = ref.split("/");
    return ref && refPath[0] === "" ? refPath : null;
}

// --- Schema narrowing (conditional schemas → oneOf for json-schema-to-typescript) ---

function narrowSchema(schema) {
    Object.keys(schema).forEach((key) => {
        const prop = schema[key];

        if (Array.isArray(prop)) {
            prop.forEach((item) => {
                narrowSchema(item);
            });
        }
        if (typeof prop === "object" && prop !== null) {
            narrowSchema(prop);
        }

        if (key === "allOf") {
            narrowAllOf(schema);
        }
    });

    narrowOneOf(schema);
    narrowThen(schema);

    return schema;
}

function narrowAllOf(schema) {
    const allOf = schema.allOf || [];
    const oneOf = allOf.reduce(
        (prev, item) => [...prev, item.then || item, ...(item.else ? [item.else] : [])],
        [],
    );
    delete schema.allOf;
    schema.oneOf = cloneDeep(oneOf);
}

function narrowOneOf(schema) {
    if (!schema.oneOf) {
        return;
    }

    let originalOneOf = schema.oneOf;
    delete schema.oneOf;

    schema.oneOf = originalOneOf.map((a) => {
        return mergeWith(cloneDeep(schema), cloneDeep(a), function customizer(objValue, srcValue, key) {
            if (Array.isArray(objValue) && mergable.includes(key)) {
                return [...new Set([...objValue, ...srcValue])];
            }
            return srcValue;
        });
    });
}

function narrowThen(schema) {
    if (schema.then) {
        schema.oneOf = cloneDeep([schema.then, ...(schema.else ? [schema.else] : [])]);
        delete schema.else;
        delete schema.then;
    }
}

main().then(
    () => {
        console.log("Definitions generated");
    },
    (err) => {
        console.error(err);
        process.exit(1);
    },
);

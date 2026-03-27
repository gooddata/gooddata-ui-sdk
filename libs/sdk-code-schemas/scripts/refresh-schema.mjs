// (C) 2026 GoodData Corporation

/* eslint-disable no-console -- CLI script with intentional progress logging */

//
// Generates TypeScript types and compiled JSON schema from the AAC JSON Schema source files.
// Inlines the $ref resolution logic that was previously in @gooddata/code-ast's mergeSchemas.

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { compile } from "json-schema-to-typescript";
import lodash from "lodash-es";
import { format, resolveConfig } from "prettier";
import { readdirp } from "readdirp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const mergable = ["required"];
const GOODDATA_COPYRIGHT = `// (C) ${new Date().getFullYear()} GoodData Corporation\n\n`;

async function main() {
    const basedir = path.resolve(__dirname, "../schemas/v1/src");
    const saveDir = path.resolve(__dirname, "../src/v1");

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
    const tasks = files.map(async (file) => {
        const content = JSON.parse((await fs.readFile(file)).toString());
        return { file, content };
    });
    const contents = await Promise.all(tasks);
    console.log(`Read ${files.length} schema files in ${Date.now() - start}ms`);

    start = Date.now();
    const root = contents.find((item) => item.file.includes(rootSchema));
    const items = contents.filter((item) => !item.file.includes(rootSchema));

    const schema = mergeSchemas(
        root.content,
        items.map((item) => item.content),
    );
    const json = JSON.stringify(schema);
    console.log(`Created schema in ${Date.now() - start}ms`);

    start = Date.now();
    const narrowedSchema = narrowSchema(schema);
    console.log(`Narrowed schema in ${Date.now() - start}ms`);

    start = Date.now();
    const def = await compile(narrowedSchema, name, { cwd: basedir });
    console.log(`Compiled schema in ${Date.now() - start}ms`);

    const config = await resolveConfig(root.file);

    const typeFilename = path.join(saveDir, `${name}.ts`);
    const typeData = await format(def, { ...config, filepath: typeFilename });
    await fs.writeFile(typeFilename, GOODDATA_COPYRIGHT + typeData);

    const schemaFilename = path.join(saveDir, `${name}.json`);
    const schemaData = await format(json, { ...config, filepath: schemaFilename });
    await fs.writeFile(schemaFilename, schemaData);

    console.log(`Generated type file "${typeFilename}" from ${files.length} schema files.`);
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
    schema.oneOf = lodash.cloneDeep(oneOf);
}

function narrowOneOf(schema) {
    if (!schema.oneOf) {
        return;
    }

    let originalOneOf = schema.oneOf;
    delete schema.oneOf;

    schema.oneOf = originalOneOf.map((a) => {
        return lodash.mergeWith(
            lodash.cloneDeep(schema),
            lodash.cloneDeep(a),
            function customizer(objValue, srcValue, key) {
                if (lodash.isArray(objValue) && mergable.includes(key)) {
                    return [...new Set([...objValue, ...srcValue])];
                }
                return srcValue;
            },
        );
    });
}

function narrowThen(schema) {
    if (schema.then) {
        schema.oneOf = lodash.cloneDeep([schema.then, ...(schema.else ? [schema.else] : [])]);
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

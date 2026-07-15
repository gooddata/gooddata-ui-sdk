// (C) 2026 GoodData Corporation

/**
 * Verifies that the generated Python types (_types.py TypedDicts, pydantic_models.py
 * Pydantic models) are in sync with the source JSON schema (metadata.json) by comparing
 * SHA-256 hashes embedded in each generated file.
 *
 * This check runs in Node.js so it works in CI without Python/uv installed.
 * If a hash mismatches, the script exits non-zero and tells the developer to
 * regenerate using the Python script.
 */

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const SCHEMA_PATH = resolve(import.meta.dirname, "../../sdk-code-schemas/src/v1/metadata.json");
const GENERATED_FILES = ["_types.py", "pydantic_models.py"].map((name) =>
    resolve(import.meta.dirname, `../python/src/gooddata_code_convertors/${name}`),
);
const HASH_PREFIX = "# schema-hash: ";
const REGENERATE_HINT =
    "Regenerate with: cd python && uv run --no-project --with datamodel-code-generator python scripts/generate_types.py";

const schemaHash = createHash("sha256").update(readFileSync(SCHEMA_PATH)).digest("hex");

let failed = false;

for (const path of GENERATED_FILES) {
    let content;
    try {
        content = readFileSync(path, "utf-8");
    } catch {
        console.error(`ERROR: ${path} does not exist.`);
        console.error(REGENERATE_HINT);
        failed = true;
        continue;
    }
    const hashLine = content.split("\n").find((line) => line.startsWith(HASH_PREFIX));

    if (!hashLine) {
        console.error(`ERROR: ${path} is missing a "${HASH_PREFIX}" line.`);
        console.error(REGENERATE_HINT);
        failed = true;
        continue;
    }

    const storedHash = hashLine.slice(HASH_PREFIX.length).trim();
    if (storedHash !== schemaHash) {
        console.error(`ERROR: ${path} is stale — schema hash mismatch.`);
        console.error(`  metadata.json: ${schemaHash}`);
        console.error(`  ${path.split("/").pop()}: ${storedHash}`);
        console.error(REGENERATE_HINT);
        failed = true;
    }
}

if (failed) {
    process.exit(1);
}

const fileNames = GENERATED_FILES.map((path) => path.split("/").pop()).join(" and ");
// eslint-disable-next-line no-console -- CLI script with intentional progress logging
console.log(`Python types check passed — ${fileNames} are in sync with metadata.json.`);

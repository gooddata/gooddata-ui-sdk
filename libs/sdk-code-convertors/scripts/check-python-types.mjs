// (C) 2026 GoodData Corporation

/**
 * Verifies that the generated Python TypedDict types (_types.py) are in sync
 * with the source JSON schema (metadata.json) by comparing SHA-256 hashes.
 *
 * This check runs in Node.js so it works in CI without Python/uv installed.
 * If the hashes mismatch, the script exits non-zero and tells the developer
 * to regenerate using the Python script.
 */

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const SCHEMA_PATH = resolve(import.meta.dirname, "../../sdk-code-schemas/src/v1/metadata.json");
const TYPES_PATH = resolve(import.meta.dirname, "../python/src/gooddata_code_convertors/_types.py");
const HASH_PREFIX = "# schema-hash: ";

const schemaHash = createHash("sha256").update(readFileSync(SCHEMA_PATH)).digest("hex");

const typesContent = readFileSync(TYPES_PATH, "utf-8");
const hashLine = typesContent.split("\n").find((line) => line.startsWith(HASH_PREFIX));

if (!hashLine) {
    console.error(`ERROR: ${TYPES_PATH} is missing a "${HASH_PREFIX}" line.`);
    console.error(
        `Regenerate with: cd python && uv run --no-project --with datamodel-code-generator python scripts/generate_types.py`,
    );
    process.exit(1);
}

const storedHash = hashLine.slice(HASH_PREFIX.length).trim();

if (storedHash !== schemaHash) {
    console.error(`ERROR: Python types are stale — schema hash mismatch.`);
    console.error(`  metadata.json: ${schemaHash}`);
    console.error(`  _types.py:     ${storedHash}`);
    console.error(
        `Regenerate with: cd python && uv run --no-project --with datamodel-code-generator python scripts/generate_types.py`,
    );
    process.exit(1);
}

// eslint-disable-next-line no-console -- CLI script with intentional progress logging
console.log("Python types check passed — _types.py is in sync with metadata.json.");

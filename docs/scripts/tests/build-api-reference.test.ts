import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const SCRIPT = resolve(here, "..", "..", "..", "scripts", "build-api-reference.sh");

test("build-api-reference fails loudly when there is no api model under SDK_LIBS_DIR", () => {
    const emptyLibs = mkdtempSync(join(tmpdir(), "sdk-libs-"));
    const content = mkdtempSync(join(tmpdir(), "content-"));

    assert.throws(
        () => execFileSync("bash", [SCRIPT, content], { env: { ...process.env, SDK_LIBS_DIR: emptyLibs }, stdio: "pipe" }),
        (err: { stderr: Buffer }) => /no api model under/.test(err.stderr.toString()),
    );
});

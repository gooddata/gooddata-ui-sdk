import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const SCRIPT = resolve(here, "..", "..", "..", "scripts", "relink-api-reference.sh");

function write(path: string, content: string) {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, content, "utf8");
}

test("relink-api-reference points a dropped version's reference links at the newest version", () => {
    const content = mkdtempSync(join(tmpdir(), "content-"));
    write(join(content, "latest", "api-reference", "_index.md"), "---\ntitle: API Reference\n---\n");
    write(join(content, "latest", "api-reference", "sdk-ui", "_index.md"), "---\ntitle: sdk-ui\n---\n");
    write(join(content, "latest", "api-reference", "sdk-ui", "sdk-ui.kept.md"), "---\ntitle: kept\n---\n");
    write(
        join(content, "11.50", "guides", "page.md"),
        [
            "---\ntitle: Guide\n---",
            '[kept]({{< relref "/11.50/api-reference/sdk-ui/sdk-ui.kept.md#props" >}})',
            '[gone]({{< relref "/11.50/api-reference/sdk-ui/sdk-ui.gone.md" >}})',
            '[nopkg]({{< relref "/11.50/api-reference/sdk-gone/sdk-gone.x.md" >}})',
            '[pkg]({{< ref "/11.50/api-reference/sdk-ui" >}})',
            '[other]({{< relref "/11.50/filters/intro.md" >}})',
            "",
        ].join("\n"),
    );

    const out = execFileSync("bash", [SCRIPT, content, "11.50", "latest"], { encoding: "utf8" });

    const page = readFileSync(join(content, "11.50", "guides", "page.md"), "utf8");
    // A page the newest version still has keeps its path and anchor.
    assert.match(page, /relref "\/latest\/api-reference\/sdk-ui\/sdk-ui.kept.md#props"/);
    // A removed symbol links its package page; a removed package the reference home.
    assert.match(page, /\[gone\]\(\{\{< relref "\/latest\/api-reference\/sdk-ui\/" >\}\}\)/);
    assert.match(page, /\[nopkg\]\(\{\{< relref "\/latest\/api-reference\/" >\}\}\)/);
    assert.match(page, /ref "\/latest\/api-reference\/sdk-ui"/);
    // Links outside the reference are untouched.
    assert.match(page, /relref "\/11.50\/filters\/intro.md"/);
    assert.doesNotMatch(page, /\/11.50\/api-reference\//);
    assert.match(out, /11.50: 4 reference links now point at latest/);
});

test("relink-api-reference fails when the target version has no reference", () => {
    const content = mkdtempSync(join(tmpdir(), "content-"));
    write(join(content, "11.50", "page.md"), "---\ntitle: x\n---\n");
    write(join(content, "latest", "page.md"), "---\ntitle: x\n---\n");
    assert.throws(
        () => execFileSync("bash", [SCRIPT, content, "11.50", "latest"], { stdio: "pipe" }),
        (err: { stderr: Buffer }) => /latest\/api-reference not found/.test(err.stderr.toString()),
    );
});

// (C) 2026 GoodData Corporation

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const SCRIPT = resolve(here, "..", "..", "..", "scripts", "place-api-reference.sh");

function write(path: string, content: string) {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, content, "utf8");
}

/** Build a fake generator output directory (the artifact-dir / OUT_DIR). */
function fakeArtifactDir(baseDir: string) {
    const dir = mkdtempSync(join(baseDir, "art-"));
    write(
        join(dir, "api-reference", "_index.md"),
        '---\ntitle: Reference\n---\n\n## Packages\n\n- [x]({{< relref "__API_REF_BASE__/sdk-ui" >}})\n',
    );
    write(
        join(dir, "api-reference", "sdk-ui", "_index.md"),
        '---\ntitle: "@gooddata/sdk-ui"\n---\n\nsee [y]({{< relref "__API_REF_BASE__/sdk-ui/sdk-ui.y.md" >}})\n',
    );
    write(
        join(dir, "api-reference", "sdk-ui", "sdk-ui.y.md"),
        "---\ntitle: y\nusage_pages:\n  - title: Guide\n    path: __DOCS_BASE__/visualisations/bar\n---\n\nbody\n",
    );
    write(
        join(dir, "api_refs.json"),
        JSON.stringify({ "sdk-ui.y": { title: "y", path: `__API_REF_BASE__/sdk-ui/sdk-ui.y` } }),
    );
    write(
        join(dir, "api_props.json"),
        JSON.stringify({ "@gooddata/sdk-ui:Y": "| [`a`](apiref:__API_REF_BASE__/sdk-ui/sdk-ui.y.a) |" }),
    );
    return dir;
}

test("place-api-reference fills every marked folder from the same artifact dir and rewrites placeholders", () => {
    const store = mkdtempSync(join(tmpdir(), "store-"));
    const artifact = fakeArtifactDir(store);
    const content = mkdtempSync(join(tmpdir(), "content-"));
    const data = mkdtempSync(join(tmpdir(), "data-"));
    write(
        join(content, "latest", "api-reference", "_index.md"),
        "---\ntitle: API Reference\nweight: 80\nlegacy_path: references/api_references\n---\n\nplaceholder body\n",
    );
    write(
        join(content, "11.55", "api-reference", "_index.md"),
        "---\ntitle: API Reference\nweight: 80\n---\n",
    );
    write(join(content, "11.54", "guide.md"), "---\ntitle: no marker here\n---\n");

    execFileSync("bash", [SCRIPT, artifact, content, data], { stdio: "pipe" });

    const index = readFileSync(join(content, "latest", "api-reference", "_index.md"), "utf8");
    assert.match(
        index,
        /^---\ntitle: API Reference\nweight: 80\nlegacy_path: references\/api_references\n---\n/,
    );
    assert.match(index, /relref "\/latest\/api-reference\/sdk-ui"/);
    assert.doesNotMatch(index, /placeholder body/);

    const page = readFileSync(join(content, "latest", "api-reference", "sdk-ui", "sdk-ui.y.md"), "utf8");
    assert.match(page, /path: \/latest\/visualisations\/bar/);

    const versioned = readFileSync(join(content, "11.55", "api-reference", "sdk-ui", "_index.md"), "utf8");
    assert.match(versioned, /relref "\/11.55\/api-reference\/sdk-ui\/sdk-ui.y.md"/);

    const refs = JSON.parse(readFileSync(join(data, "api_refs.json"), "utf8"));
    assert.equal(refs["sdk-ui.y"].path, "/latest/api-reference/sdk-ui/sdk-ui.y");
    const props = JSON.parse(readFileSync(join(data, "api_props.json"), "utf8"));
    assert.equal(props["@gooddata/sdk-ui:Y"], "| [`a`](apiref:/latest/api-reference/sdk-ui/sdk-ui.y.a) |");
    assert.equal(existsSync(join(content, "11.54", "api-reference")), false);
    // Every placed version also keeps its own copy, for api-data.html.
    const versionRefs = JSON.parse(
        readFileSync(join(data, "api_versions", "11_55", "api_refs.json"), "utf8"),
    );
    assert.equal(versionRefs["sdk-ui.y"].path, "/11.55/api-reference/sdk-ui/sdk-ui.y");
});

test("place-api-reference keeps hand-written top-level pages in api-reference/ across the swap", () => {
    const store = mkdtempSync(join(tmpdir(), "store-"));
    const artifact = fakeArtifactDir(store);
    const content = mkdtempSync(join(tmpdir(), "content-"));
    const data = mkdtempSync(join(tmpdir(), "data-"));
    write(
        join(content, "latest", "api-reference", "_index.md"),
        "---\ntitle: API Reference\n---\n\nplaceholder body\n",
    );
    write(
        join(content, "latest", "api-reference", "versions.md"),
        "---\ntitle: All versions\nversions_archive: true\n---\n\n{{< versions-archive >}}\n",
    );
    // A stale generated file from a previous build must not be mistaken for authored content.
    write(join(content, "latest", "api-reference", "sdk-ui", "sdk-ui.old.md"), "---\ntitle: gone\n---\n");

    execFileSync("bash", [SCRIPT, artifact, content, data], { stdio: "pipe" });

    const kept = readFileSync(join(content, "latest", "api-reference", "versions.md"), "utf8");
    assert.match(kept, /versions_archive: true/);
    assert.equal(existsSync(join(content, "latest", "api-reference", "sdk-ui", "sdk-ui.old.md")), false);
    assert.equal(existsSync(join(content, "latest", "api-reference", "sdk-ui", "sdk-ui.y.md")), true);
});

test("place-api-reference fails when the artifact dir has no api-reference/", () => {
    const artifact = mkdtempSync(join(tmpdir(), "art-empty-"));
    const content = mkdtempSync(join(tmpdir(), "content-"));
    write(
        join(content, "latest", "api-reference", "_index.md"),
        "---\ntitle: API Reference\n---\n\nplaceholder body\n",
    );

    assert.throws(
        () => execFileSync("bash", [SCRIPT, artifact, content], { stdio: "pipe" }),
        (err: { stderr: Buffer }) =>
            /malformed artifact dir/.test(err.stderr.toString()) &&
            /api-reference/.test(err.stderr.toString()),
    );

    const marker = readFileSync(join(content, "latest", "api-reference", "_index.md"), "utf8");
    assert.match(marker, /placeholder body/);
});

test("place-api-reference fails when the content dir does not exist", () => {
    const artifact = fakeArtifactDir(mkdtempSync(join(tmpdir(), "store-")));
    const missingContent = join(mkdtempSync(join(tmpdir(), "content-")), "does-not-exist");
    assert.throws(
        () => execFileSync("bash", [SCRIPT, artifact, missingContent], { stdio: "pipe" }),
        (err: { stderr: Buffer }) => /content dir not found/.test(err.stderr.toString()),
    );
});

test("place-api-reference fails on a malformed artifact dir (no api_refs.json) and leaves the marker untouched", () => {
    const src = mkdtempSync(join(tmpdir(), "art-malformed-"));
    write(join(src, "api-reference", "_index.md"), "---\ntitle: Reference\n---\n\nbody\n");

    const content = mkdtempSync(join(tmpdir(), "content-"));
    write(
        join(content, "latest", "api-reference", "_index.md"),
        "---\ntitle: API Reference\n---\n\nplaceholder body\n",
    );

    assert.throws(
        () => execFileSync("bash", [SCRIPT, src, content], { stdio: "pipe" }),
        (err: { stderr: Buffer }) =>
            /malformed artifact dir/.test(err.stderr.toString()) &&
            /api_refs\.json/.test(err.stderr.toString()),
    );

    const marker = readFileSync(join(content, "latest", "api-reference", "_index.md"), "utf8");
    assert.match(marker, /placeholder body/);
});

test("place-api-reference fails when content/en has no markers at all", () => {
    const artifact = fakeArtifactDir(mkdtempSync(join(tmpdir(), "store-")));
    const contentEn = join(mkdtempSync(join(tmpdir(), "content-")), "content", "en");
    write(join(contentEn, "latest", "guide.md"), "---\ntitle: no marker here\n---\n");

    assert.throws(
        () => execFileSync("bash", [SCRIPT, artifact, contentEn], { stdio: "pipe" }),
        (err: { stderr: Buffer }) => /no api-reference\/_index.md marker/.test(err.stderr.toString()),
    );
});

test("place-api-reference is a no-op when versioned_docs has no markers", () => {
    const artifact = fakeArtifactDir(mkdtempSync(join(tmpdir(), "store-")));
    const versionedDocs = join(mkdtempSync(join(tmpdir(), "content-")), "versioned_docs");
    write(join(versionedDocs, "11.20", "guide.md"), "---\ntitle: no marker here\n---\n");

    assert.doesNotThrow(() => execFileSync("bash", [SCRIPT, artifact, versionedDocs], { stdio: "pipe" }));
});

test("place-api-reference fails when the artifact has no api_props.json and leaves the marker untouched", () => {
    const store = mkdtempSync(join(tmpdir(), "store-"));
    const artifact = fakeArtifactDir(store);
    rmSync(join(artifact, "api_props.json"));
    const content = mkdtempSync(join(tmpdir(), "content-"));
    write(
        join(content, "latest", "api-reference", "_index.md"),
        "---\ntitle: API Reference\n---\n\nplaceholder body\n",
    );

    assert.throws(
        () => execFileSync("bash", [SCRIPT, artifact, content], { stdio: "pipe" }),
        (err: { stderr: Buffer }) =>
            /malformed artifact dir/.test(err.stderr.toString()) &&
            /api_props\.json/.test(err.stderr.toString()),
    );
    assert.match(
        readFileSync(join(content, "latest", "api-reference", "_index.md"), "utf8"),
        /placeholder body/,
    );
});

test("place-api-reference with PLACE_ONLY fills one version and writes only that version's data copy", () => {
    const artifact = fakeArtifactDir(mkdtempSync(join(tmpdir(), "store-")));
    const content = mkdtempSync(join(tmpdir(), "content-"));
    const data = mkdtempSync(join(tmpdir(), "data-"));
    write(
        join(content, "latest", "api-reference", "_index.md"),
        "---\ntitle: API Reference\n---\n\nplaceholder body\n",
    );
    write(
        join(content, "11.58", "api-reference", "_index.md"),
        "---\ntitle: API Reference\n---\n\nplaceholder body\n",
    );

    execFileSync("bash", [SCRIPT, artifact, content, data], {
        stdio: "pipe",
        env: { ...process.env, PLACE_ONLY: "11.58" },
    });

    assert.equal(existsSync(join(content, "11.58", "api-reference", "sdk-ui", "sdk-ui.y.md")), true);
    assert.match(
        readFileSync(join(content, "latest", "api-reference", "_index.md"), "utf8"),
        /placeholder body/,
    );
    const refs = JSON.parse(readFileSync(join(data, "api_versions", "11_58", "api_refs.json"), "utf8"));
    assert.equal(refs["sdk-ui.y"].path, "/11.58/api-reference/sdk-ui/sdk-ui.y");
    assert.equal(existsSync(join(data, "api_versions", "11_58", "api_props.json")), true);
    // The site-wide copy is the caller's choice (build-api-reference-versions.sh picks the newest).
    assert.equal(existsSync(join(data, "api_refs.json")), false);
});

test("place-api-reference with PLACE_ONLY fails for a version without a marker", () => {
    const artifact = fakeArtifactDir(mkdtempSync(join(tmpdir(), "store-")));
    const content = mkdtempSync(join(tmpdir(), "content-"));
    write(join(content, "latest", "api-reference", "_index.md"), "---\ntitle: API Reference\n---\n");

    assert.throws(
        () =>
            execFileSync("bash", [SCRIPT, artifact, content], {
                stdio: "pipe",
                env: { ...process.env, PLACE_ONLY: "11.57" },
            }),
        (err: { stderr: Buffer }) => /PLACE_ONLY=11.57/.test(err.stderr.toString()),
    );
});

// (C) 2026 GoodData Corporation

import assert from "node:assert/strict";
import { resolve } from "node:path";
import test from "node:test";

import { resolveConfig } from "../lib/config.js";

const scriptsDir = "/repo/sdk/docs/scripts";

test("resolveConfig uses gdc-ui defaults relative to sdk/docs/scripts", () => {
    const cfg = resolveConfig({ OUT_DIR: "/tmp/out" }, scriptsDir);
    assert.equal(cfg.sdkLibsDir, resolve("/repo/sdk/libs"));
    assert.equal(cfg.sdkSrcLibsDir, resolve("/repo/sdk/libs"));
    assert.equal(cfg.guideContentDir, resolve("/repo/sdk/docs/content/en/latest"));
    assert.equal(cfg.outDir, resolve("/tmp/out"));
    assert.equal(cfg.refBase, "__API_REF_BASE__");
    assert.equal(cfg.docsBase, "__DOCS_BASE__");
    assert.equal(cfg.referenceDirName, "api-reference");
    assert.equal(cfg.artifactVersion, "Next");
    assert.equal(cfg.gitCommit, "unknown");
});

test("resolveConfig honours every override", () => {
    const cfg = resolveConfig(
        {
            OUT_DIR: "/o",
            SDK_LIBS_DIR: "/l",
            SDK_SRC_LIBS_DIR: "/s",
            GUIDE_CONTENT_DIR: "/g",
            REF_BASE: "/latest/api-reference",
            DOCS_BASE: "/latest",
            ARTIFACT_VERSION: "11.55.0",
            GITHUB_SHA: "abc123",
        },
        scriptsDir,
    );
    assert.equal(cfg.sdkLibsDir, "/l");
    assert.equal(cfg.sdkSrcLibsDir, "/s");
    assert.equal(cfg.guideContentDir, "/g");
    assert.equal(cfg.refBase, "/latest/api-reference");
    assert.equal(cfg.docsBase, "/latest");
    assert.equal(cfg.artifactVersion, "11.55.0");
    assert.equal(cfg.gitCommit, "abc123");
});

test("resolveConfig requires OUT_DIR", () => {
    assert.throws(() => resolveConfig({}, scriptsDir), /OUT_DIR/);
});

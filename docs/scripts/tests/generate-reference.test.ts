// (C) 2026 GoodData Corporation

import assert from "node:assert/strict";
import test from "node:test";

import {
    parseSymbolHeading,
    DEPRECATION_MARKER,
    BETA_MARKER,
    rewriteAlphaNotice,
    rewriteBetaNotice,
    stripSymbolChrome,
    labelBareCodeFences,
    overviewToIndexBody,
    pruneApiJson,
    collectSourcePaths,
    esmPathToSrcCandidates,
    packageIndexFrontmatter,
    mergeSectionFrontmatter,
    symbolParent,
} from "../generate-reference.js";

test("parseSymbolHeading drops api-documenter's Markdown escapes from the title", () => {
    assert.deepEqual(parseSymbolHeading("IDashboardPluginContract\\_V1 type"), {
        titleNoKind: "IDashboardPluginContract_V1",
        kind: "type-alias",
    });
    assert.deepEqual(parseSymbolHeading("Permissions\\_2.canManage property"), {
        titleNoKind: "Permissions_2.canManage",
        kind: "property",
    });
});

test("parseSymbolHeading strips and normalizes the kind suffix", () => {
    assert.deepEqual(parseSymbolHeading("BarChart() function"), {
        titleNoKind: "BarChart()",
        kind: "function",
    });
    assert.deepEqual(parseSymbolHeading("IBarChartProps interface"), {
        titleNoKind: "IBarChartProps",
        kind: "interface",
    });
    assert.deepEqual(parseSymbolHeading("DashboardEventType type"), {
        titleNoKind: "DashboardEventType",
        kind: "type-alias",
    });
    assert.deepEqual(parseSymbolHeading("OverTimeComparisonTypes enum member"), {
        titleNoKind: "OverTimeComparisonTypes",
        kind: "enum-member",
    });
    // double kind-word title: only the $-anchored suffix strips
    assert.deepEqual(parseSymbolHeading("ITotal.type property"), {
        titleNoKind: "ITotal.type",
        kind: "property",
    });
});

test("parseSymbolHeading leaves non-suffixed titles alone (package overviews)", () => {
    assert.deepEqual(parseSymbolHeading("sdk-ui-charts package"), {
        titleNoKind: "sdk-ui-charts package",
        kind: undefined,
    });
    assert.deepEqual(parseSymbolHeading("API Reference"), {
        titleNoKind: "API Reference",
        kind: undefined,
    });
});

test("DEPRECATION_MARKER matches api-documenter output verbatim", () => {
    assert.equal(DEPRECATION_MARKER, "> Warning: This API is now obsolete");
});

test("pruneApiJson: package with only Internal/Alpha declarations keeps zero", () => {
    const apiJson = {
        kind: "Package",
        name: "@gooddata/util",
        members: [
            {
                kind: "EntryPoint",
                members: [
                    { kind: "Function", name: "internalFn", releaseTag: "Internal" },
                    {
                        kind: "Class",
                        name: "AlphaClass",
                        releaseTag: "Alpha",
                        members: [{ kind: "Method", name: "m", releaseTag: "Alpha" }],
                    },
                ],
            },
        ],
    };
    const { kept, keptStable, droppedReleaseTag } = pruneApiJson(apiJson);
    // @alpha is published, but a package with nothing else is skipped (keptStable === 0)
    assert.equal(kept, 2);
    assert.equal(keptStable, 0);
    assert.equal(droppedReleaseTag, 1);
});

test("pruneApiJson: mixed package keeps Public and None, drops the rest", () => {
    const apiJson = {
        kind: "Package",
        name: "@gooddata/sdk-ui-catalog",
        members: [
            {
                kind: "EntryPoint",
                members: [
                    { kind: "Function", name: "AnalyticsCatalog", releaseTag: "Public" },
                    { kind: "Variable", name: "untagged", releaseTag: "None" },
                    { kind: "Function", name: "hidden", releaseTag: "Internal" },
                ],
            },
        ],
    };
    const { pruned, kept, droppedReleaseTag } = pruneApiJson(apiJson);
    assert.equal(kept, 2);
    assert.equal(droppedReleaseTag, 1);
    const entryMembers = (pruned as { members: Array<{ members: Array<{ name: string }> }> }).members[0]
        .members;
    assert.deepEqual(
        entryMembers.map((m) => m.name),
        ["AnalyticsCatalog", "untagged"],
    );
});

test("collectSourcePaths: slugs mirror api-documenter filenames; children inherit fileUrlPath; overloads suffixed", () => {
    const apiJson = {
        kind: "Package",
        name: "@gooddata/sdk-ui-charts",
        members: [
            {
                kind: "EntryPoint",
                name: "",
                members: [
                    {
                        kind: "Function",
                        name: "BarChart",
                        overloadIndex: 1,
                        releaseTag: "Public",
                        fileUrlPath: "esm/charts/barChart/BarChart.d.ts",
                    },
                    {
                        kind: "Function",
                        name: "BarChart",
                        overloadIndex: 2,
                        releaseTag: "Public",
                        fileUrlPath: "esm/charts/barChart/BarChartOverload.d.ts",
                    },
                    {
                        kind: "Interface",
                        name: "IBarChartProps",
                        releaseTag: "Public",
                        fileUrlPath: "esm/charts/barChart/types.d.ts",
                        members: [
                            // no fileUrlPath -> inherits the interface's
                            { kind: "PropertySignature", name: "config", releaseTag: "Public" },
                        ],
                    },
                ],
            },
        ],
    };
    const map = collectSourcePaths(apiJson);
    assert.equal(map.get("sdk-ui-charts.barchart"), "esm/charts/barChart/BarChart.d.ts");
    assert.equal(map.get("sdk-ui-charts.barchart_1"), "esm/charts/barChart/BarChartOverload.d.ts");
    assert.equal(map.get("sdk-ui-charts.ibarchartprops"), "esm/charts/barChart/types.d.ts");
    assert.equal(map.get("sdk-ui-charts.ibarchartprops.config"), "esm/charts/barChart/types.d.ts");
    // package overview has no declaration -> no entry
    assert.equal(map.has("sdk-ui-charts"), false);
});

test("esmPathToSrcCandidates: maps esm d.ts to src ts/tsx candidates", () => {
    assert.deepEqual(esmPathToSrcCandidates("esm/charts/barChart/BarChart.d.ts"), [
        "src/charts/barChart/BarChart.ts",
        "src/charts/barChart/BarChart.tsx",
    ]);
});

test("esmPathToSrcCandidates: passes a source path through (declaration maps resolved it)", () => {
    assert.deepEqual(esmPathToSrcCandidates("src/charts/barChart/BarChart.tsx"), [
        "src/charts/barChart/BarChart.tsx",
    ]);
    assert.deepEqual(esmPathToSrcCandidates("src/base/index.ts"), ["src/base/index.ts"]);
});

test("esmPathToSrcCandidates: rejects anything else", () => {
    assert.deepEqual(esmPathToSrcCandidates("src/types.d.ts"), []);
    assert.deepEqual(esmPathToSrcCandidates("dist/index.d.ts"), []);
    assert.deepEqual(esmPathToSrcCandidates("../other/src/x.ts"), []);
});

test("packageIndexFrontmatter: nav_leaf + alphabetical weight so sidebars stop at the package", () => {
    const fm = packageIndexFrontmatter("sdk-ui-charts", 9);
    assert.equal(fm.title, "@gooddata/sdk-ui-charts");
    assert.equal(fm.slug, "sdk-ui-charts");
    assert.equal(fm.nav_leaf, true);
    assert.equal(fm.weight, 9);
    assert.equal(fm.type, "reference");
    // the index is the overview page now — pagefind facets on `package`
    assert.equal(fm.package, "sdk-ui-charts");
});

test("mergeSectionFrontmatter: site-owned nav keys survive regen, generated keys win", () => {
    const merged = mergeSectionFrontmatter({
        title: "API Reference",
        linkTitle: "API Reference",
        weight: 80,
        legacy_path: "references/api_references",
        description: "stale description from a previous run",
        type: "docs",
    });
    assert.equal(merged.title, "API Reference");
    assert.equal(merged.linkTitle, "API Reference");
    assert.equal(merged.weight, 80);
    assert.equal(merged.legacy_path, "references/api_references");
    // generated keys are authoritative
    assert.equal(merged.type, "reference");
    assert.equal(merged.diataxis_type, "reference");
    assert.match(String(merged.description), /api-extractor/);
});

test("mergeSectionFrontmatter: no existing file -> generated defaults only", () => {
    const merged = mergeSectionFrontmatter(undefined);
    assert.equal(merged.title, "Reference");
    assert.equal(merged.type, "reference");
    assert.equal(merged.weight, undefined);
    assert.equal(merged.legacy_path, undefined);
});

test("labelBareCodeFences: labels an opening bare fence, never the closer", () => {
    const out = labelBareCodeFences(["**Signature:**", "", "```", "const a = 1;", "```", ""].join("\n"));
    assert.equal(out, ["**Signature:**", "", "```tsx", "const a = 1;", "```", ""].join("\n"));
});

test("labelBareCodeFences: leaves an already-labelled fence alone", () => {
    const src = ["```typescript", "const a: number = 1;", "```"].join("\n");
    assert.equal(labelBareCodeFences(src), src);
});

test("labelBareCodeFences: a bare line inside a fence is content, not a new fence", () => {
    // the ``` on its own line closes the block; the following bare fence opens
    // the next one and is the only other line that may be labelled
    const out = labelBareCodeFences(
        ["```typescript", "const a = 1;", "```", "prose", "```", "const b = 2;", "```"].join("\n"),
    );
    assert.equal(
        out,
        ["```typescript", "const a = 1;", "```", "prose", "```tsx", "const b = 2;", "```"].join("\n"),
    );
});

test("labelBareCodeFences: works on api-documenter's CRLF and keeps the endings", () => {
    // the only line endings this ever sees in production; a `.*$` info capture
    // matches none of these lines, which silently labelled nothing
    const out = labelBareCodeFences(
        "```typescript\r\nconst a = 1;\r\n```\r\n\r\n```\r\n<Chart />\r\n```\r\n",
    );
    assert.equal(out, "```typescript\r\nconst a = 1;\r\n```\r\n\r\n```tsx\r\n<Chart />\r\n```\r\n");
});

test("labelBareCodeFences: a longer fence run nests without being relabelled", () => {
    const out = labelBareCodeFences(["````", "```", "inner", "```", "````"].join("\n"));
    // only the outer 4-backtick fence opens a block, so only it gets the label,
    // and the inner 3-backtick lines stay verbatim content
    assert.equal(out, ["````tsx", "```", "inner", "```", "````"].join("\n"));
});

test("stripSymbolChrome: drops the breadcrumb line and the duplicate title heading", () => {
    const stripped = stripSymbolChrome(
        [
            "<!-- Do not edit this file. It is automatically generated by API Documenter. -->",
            "",
            "[Home](./index.md) &gt; [@gooddata/sdk-ui-charts](./sdk-ui-charts.md) &gt; [BarChart](./sdk-ui-charts.barchart.md)",
            "",
            "## BarChart() function",
            "",
            "Bar chart shows data in horizontal bars.",
            "",
            "## Parameters",
        ].join("\n"),
    );
    assert.match(stripped, /^<!-- Do not edit/);
    assert.doesNotMatch(stripped, /\[Home\]/);
    assert.doesNotMatch(stripped, /## BarChart\(\) function/);
    // real content and later section headings survive
    assert.match(stripped, /Bar chart shows data in horizontal bars\./);
    assert.match(stripped, /## Parameters/);
});

test("stripSymbolChrome: leaves H3+ headings and prose brackets alone", () => {
    const stripped = stripSymbolChrome(
        "### Sub\n\nSee [Home](./index.md) mid-prose? No: only the line-start breadcrumb goes.\n",
    );
    assert.match(stripped, /### Sub/);
    assert.match(stripped, /mid-prose/);
});

test("overviewToIndexBody: drops api-documenter's breadcrumb and duplicate package heading", () => {
    const body = overviewToIndexBody(
        [
            "<!-- Do not edit this file. -->",
            "",
            '[Home]({{< relref "/reference" >}}) &gt; [@gooddata/sdk-ui-charts]({{< relref "/reference/sdk-ui-charts" >}})',
            "",
            "## sdk-ui-charts package",
            "",
            "Charts for GoodData.UI.",
            "",
            "## Classes",
        ].join("\n"),
        "sdk-ui-charts",
    );
    assert.match(body, /^<!-- Do not edit this file\. -->/);
    assert.doesNotMatch(body, /\[Home\]/);
    assert.doesNotMatch(body, /## sdk-ui-charts package/);
    // everything the overview is actually for survives
    assert.match(body, /Charts for GoodData\.UI\./);
    assert.match(body, /## Classes/);
});

test("overviewToIndexBody: leaves a package heading for a different package alone", () => {
    const body = overviewToIndexBody("## sdk-ui-charts package\n\nText.\n", "sdk-ui-filters");
    assert.match(body, /## sdk-ui-charts package/);
});

import { buildManifest } from "../generate-reference.js";

test("buildManifest records counts and provenance", () => {
    const manifest = buildManifest(
        { artifactVersion: "11.55.0", gitCommit: "abc" },
        { pages: 10, symbols: 4, packages: ["sdk-ui", "sdk-model"] },
        new Date("2026-09-02T00:00:00Z"),
    );
    assert.deepEqual(manifest, {
        version: "11.55.0",
        commit: "abc",
        generatedAt: "2026-09-02T00:00:00.000Z",
        pages: 10,
        symbols: 4,
        packages: ["sdk-model", "sdk-ui"],
    });
});

test("rewriteBetaNotice swaps api-documenter's beta notice for ours, linking API maturity", () => {
    const body =
        "> This API is provided as a beta preview for developers and may change based on feedback that we receive. Do not use this API in a production environment.\n> \n\nSignature:\n";
    assert.ok(body.includes(BETA_MARKER));
    const out = rewriteBetaNotice(body, "/latest/integrations/platform/api-maturity.md");
    assert.equal(
        out,
        '> **Beta API.** Mostly stable, but details may change in a minor release, outside SemVer. See [API maturity]({{< relref "/latest/integrations/platform/api-maturity.md" >}}).\n\nSignature:\n',
    );
    assert.doesNotMatch(out, /production environment/);
});

test("rewriteBetaNotice without the guide page leaves the link out", () => {
    const out = rewriteBetaNotice(
        "> This API is provided as a beta preview for developers. Do not use this API in a production environment.\n",
        undefined,
    );
    assert.equal(
        out,
        "> **Beta API.** Mostly stable, but details may change in a minor release, outside SemVer.\n",
    );
});

test("rewriteAlphaNotice swaps api-documenter's alpha notice for ours, so the page has one", () => {
    const body =
        "> This API is provided as an alpha preview for developers and may change based on feedback that we receive. Do not use this API in a production environment.\n> \n\nConvenience hook.\n";
    const out = rewriteAlphaNotice(body, "/latest/integrations/platform/api-maturity.md");
    assert.equal(
        out,
        '> **Alpha API.** Initial API, highly likely to change outside SemVer. Don\'t build on it in production. See [API maturity]({{< relref "/latest/integrations/platform/api-maturity.md" >}}).\n\nConvenience hook.\n',
    );
    assert.doesNotMatch(out, /alpha preview/);
});

test("rewriteAlphaNotice adds our notice when api-documenter wrote none", () => {
    assert.equal(
        rewriteAlphaNotice("Convenience hook.\n", undefined),
        "> **Alpha API.** Initial API, highly likely to change outside SemVer. Don't build on it in production.\n\nConvenience hook.\n",
    );
});

test("symbolParent: a member belongs to the slug minus its last segment, and folds into it", () => {
    const kinds = new Map<string, string | undefined>([
        ["sdk-ui.ifoo", "interface"],
        ["sdk-ui.ifoo.bar", "property"],
        ["sdk-ui.cls", "class"],
        ["sdk-ui.cls.run_1", "method"],
    ]);
    assert.deepEqual(symbolParent("sdk-ui.ifoo.bar", kinds), { parentSlug: "sdk-ui.ifoo", folded: true });
    // overloads carry an `_N` suffix on the member, not the parent
    assert.deepEqual(symbolParent("sdk-ui.cls.run_1", kinds), { parentSlug: "sdk-ui.cls", folded: true });
});

test("symbolParent: a namespace's members are symbols of their own; their members fold into them", () => {
    const kinds = new Map<string, string | undefined>([
        ["sdk-code-schemas.v1", "namespace"],
        ["sdk-code-schemas.v1.aggregatedfact", "interface"],
        ["sdk-code-schemas.v1.aggregatedfact.data_type", "property"],
    ]);
    assert.deepEqual(symbolParent("sdk-code-schemas.v1.aggregatedfact", kinds), {
        parentSlug: "sdk-code-schemas.v1",
        folded: false,
    });
    // was `sdk-code-schemas.v1` (always the first two segments), which left 3,660 properties
    // pointing at the namespace instead of their interface
    assert.deepEqual(symbolParent("sdk-code-schemas.v1.aggregatedfact.data_type", kinds), {
        parentSlug: "sdk-code-schemas.v1.aggregatedfact",
        folded: true,
    });
});

test("symbolParent: a missing parent page falls back to the nearest ancestor; top-level symbols have none", () => {
    const kinds = new Map<string, string | undefined>([["sdk-ui.ifoo", "interface"]]);
    assert.deepEqual(symbolParent("sdk-ui.ifoo.gone.bar", kinds), {
        parentSlug: "sdk-ui.ifoo",
        folded: true,
    });
    assert.deepEqual(symbolParent("sdk-ui.ifoo", kinds), { folded: false });
    assert.deepEqual(symbolParent("sdk-ui.orphan.bar", kinds), { folded: false });
});

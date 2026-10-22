import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { collectGuideSymbols, collectGuideUsage, symbolToRefSlug } from "../lib/reference-usage.js";

function write(dir: string, rel: string, content: string) {
    const full = join(dir, rel);
    mkdirSync(join(full, ".."), { recursive: true });
    writeFileSync(full, content, "utf8");
}

test("symbolToRefSlug lowercases the symbol and keeps the package", () => {
    assert.equal(symbolToRefSlug("@gooddata/sdk-ui-charts:BarChart"), "sdk-ui-charts.barchart");
    assert.equal(symbolToRefSlug("not a symbol"), undefined);
});

test("collectGuideUsage prefixes guide paths with docsBase and skips the reference dir", () => {
    const root = mkdtempSync(join(tmpdir(), "usage-"));
    write(root, "visualisations/bar-chart.md", "---\ntitle: Bar chart\napi_symbols:\n  - \"@gooddata/sdk-ui-charts:BarChart\"\n---\n");
    write(root, "api-reference/sdk-ui-charts/x.md", "---\ntitle: X\napi_symbols:\n  - \"@gooddata/sdk-ui-charts:BarChart\"\n---\n");
    const usage = collectGuideUsage(root, "__DOCS_BASE__", "api-reference");
    assert.deepEqual(usage.get("sdk-ui-charts.barchart"), [
        { title: "Bar chart", path: "__DOCS_BASE__/visualisations/bar-chart" },
    ]);
});

test("collectGuideSymbols tells a {{% props %}} page from one with a hand-written table", () => {
    const dir = mkdtempSync(join(tmpdir(), "guides-"));
    const fm = '---\ntitle: T\napi_symbols:\n  - "@gooddata/sdk-ui-charts:BarChart"\n---\n';
    write(dir, "bar.md", `${fm}\n## Props\n\n{{% props %}}\n\n## Related\n`);
    write(dir, "old.md", `${fm}\n## Props\n\n| Prop | Type |\n|---|---|\n| a | b |\n`);
    write(dir, "iface.md", "---\ntitle: I\nprops_interfaces:\n  - IFoo\n---\n\nno table\n");
    write(dir, "plain.md", "---\ntitle: P\n---\n\nnothing\n");
    write(dir, "api-reference/sdk-ui/x.md", fm);

    const pages = collectGuideSymbols(dir, "api-reference");
    assert.deepEqual(
        pages.map((p) => [p.path, p.usesShortcode, p.hasPropsTable]),
        [
            ["bar", true, false],
            ["iface", false, false],
            ["old", false, true],
        ],
    );
    assert.deepEqual(pages.find((p) => p.path === "iface")?.propsInterfaces, ["IFoo"]);
});

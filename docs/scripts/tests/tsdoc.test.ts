import assert from "node:assert/strict";
import test from "node:test";

import { isDeprecated, resolveInlineTags, summaryFromDocComment } from "../lib/tsdoc.js";

test("summary stops at the first block tag", () => {
    const doc = "/**\n * Specify filters.\n *\n * @remarks\n *\n * More detail here.\n *\n * @public\n */\n";
    assert.equal(summaryFromDocComment(doc), "Specify filters.");
});

test("summary joins multi-line paragraphs and collapses whitespace", () => {
    const doc =
        "/**\n * Analytical backend, from which the chart\n * will obtain data.\n *\n * If omitted you MUST have BackendProvider.\n */\n";
    assert.equal(
        summaryFromDocComment(doc),
        "Analytical backend, from which the chart will obtain data. If omitted you MUST have BackendProvider.",
    );
});

test("summary is empty for undefined or tag-only comments", () => {
    assert.equal(summaryFromDocComment(undefined), "");
    assert.equal(summaryFromDocComment("/**\n * @public\n */\n"), "");
});

test("inline link tags resolve to their label or symbol", () => {
    assert.equal(resolveInlineTags("See {@link IBarChartProps | props} now"), "See props now");
    assert.equal(resolveInlineTags("See {@link IBarChartProps}"), "See IBarChartProps");
    assert.equal(
        resolveInlineTags("See {@link @gooddata/sdk-ui!IExecuteProps.onError}"),
        "See IExecuteProps.onError",
    );
    assert.equal(resolveInlineTags("Read {@link https://x.y/z | the guide}"), "Read the guide");
    assert.equal(resolveInlineTags("{@inheritDoc Foo.bar} Rest"), "Rest");
});

test("deprecated is detected from the block tag only", () => {
    assert.equal(isDeprecated("/**\n * Old.\n *\n * @deprecated use X\n */\n"), true);
    assert.equal(isDeprecated("/**\n * Mentions the word deprecated in prose.\n */\n"), false);
    assert.equal(isDeprecated(undefined), false);
});

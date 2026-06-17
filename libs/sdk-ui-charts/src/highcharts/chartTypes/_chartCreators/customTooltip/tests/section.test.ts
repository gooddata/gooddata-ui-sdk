// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    type IResolvedReferenceValues,
    type ITooltipLocalizedStrings,
    buildKeySegment,
    joinKeySegments,
} from "@gooddata/sdk-ui-vis-commons";

import { type IChartConfig } from "../../../../../interfaces/chartConfig.js";
import {
    type ICustomTooltipRuntime,
    type IUnsafeHighchartsTooltipPoint,
} from "../../../../typings/unsafe.js";
import { type IIdentifierMapping } from "../identifierMapping.js";
import { getCustomTooltipSection } from "../section.js";

const STRINGS: ITooltipLocalizedStrings = {
    noFetch: "(could not be retrieved)",
    noData: "(No data)",
    multipleItems: "(Multiple items)",
};

// Minimal drill-intersection shapes — only the fields the resolver reads. They
// live in the point's `any`-typed drillIntersection and are narrowed at runtime
// by the resolver's guards (same pattern as referenceResolver.test.ts).
function attributeIntersection(displayFormId: string, name: string, uri: string) {
    return {
        header: {
            attributeHeader: { identifier: displayFormId, formOf: { identifier: displayFormId } },
            attributeHeaderItem: { name, uri },
        },
    };
}

function measureIntersection(localIdentifier: string, identifier: string, format: string) {
    return { header: { measureHeaderItem: { localIdentifier, identifier, format } } };
}

// Multi-measure bar chart [customers, returns] by month; hovering the *customers*
// bar yields a drill intersection with only customers.
const point: IUnsafeHighchartsTooltipPoint = {
    y: 1234,
    drillIntersection: [
        attributeIntersection("month", "March", "/m/march"),
        measureIntersection("mc", "customers", "#,##0"),
    ],
};
// The key buildPointKey derives from the intersection above (one attribute).
const pointKey = joinKeySegments([buildKeySegment("month", "/m/march")]);
const config: IChartConfig = {
    type: "column",
    customTooltip: { enabled: true, content: "{metric/customers} | {metric/returns}" },
};
const identifierMapping: IIdentifierMapping = { measures: { mc: { ldmId: "customers", pointField: "y" } } };

describe("getCustomTooltipSection — in-chart sibling / null resolution (F1-2510)", () => {
    it("resolves a sibling-series metric and renders a null cell as 'No data', without cascading", () => {
        // `returns` lives on another series (absent from the hovered intersection)
        // and is null at this point — the chart-wide lookup supplies it as empty.
        const chartLookup = new Map<string, IResolvedReferenceValues>([
            [
                pointKey,
                { "metric/customers": { kind: "value", text: "1,234" }, "metric/returns": { kind: "empty" } },
            ],
        ]);
        const runtime: ICustomTooltipRuntime = { identifierMapping, chartLookup };

        const html = getCustomTooltipSection(point, STRINGS, config, runtime);

        expect(html).toContain("1,234"); // hovered metric still resolves
        expect(html).toContain("(No data)"); // sibling null → "No data"…
        expect(html).not.toContain("could not be retrieved"); // …not a cascade
    });

    it("renders an absent reference as 'could not be retrieved' when no chart lookup entry exists", () => {
        // Pre-fix default: with no chart-wide lookup, the sibling is genuinely
        // unresolved — the hovered metric must still render its own value.
        const runtime: ICustomTooltipRuntime = { identifierMapping };

        const html = getCustomTooltipSection(point, STRINGS, config, runtime);

        expect(html).toContain("1,234");
        expect(html).toContain("could not be retrieved");
    });
});

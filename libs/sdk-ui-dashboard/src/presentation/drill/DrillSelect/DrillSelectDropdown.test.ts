// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IInsight, type IInsightWidget, idRef } from "@gooddata/sdk-model";

import { newInsightMap } from "../../../_staging/metadata/objRefMap.js";
import { createInternalIntl } from "../../localization/createInternalIntl.js";
import { createDrillEvent, keyDriverAnalysis } from "../utils/kdaUtils.test.helpers.js";

import { createDrillSelectItems } from "./DrillSelectDropdown.js";

const insightRef = idRef("mekko", "insight");

function createInsight(disableKeyDriveAnalysisOn?: Record<string, boolean>): IInsight {
    return {
        insight: {
            identifier: "mekko",
            uri: "/mekko",
            ref: insightRef,
            title: "Mekko",
            visualizationUrl: "local:mekko",
            buckets: [],
            filters: [],
            sorts: [],
            properties: { controls: { disableKeyDriveAnalysisOn } },
        },
    };
}

const widget = { type: "insight", ref: idRef("widget"), insight: insightRef } as unknown as IInsightWidget;

function getKeyDriverItemNames(insight: IInsight) {
    return createDrillSelectItems({
        drillDefinitions: [keyDriverAnalysis],
        drillEvent: createDrillEvent(false, 1),
        isDrillRestricted: () => false,
        insights: newInsightMap([insight]),
        dashboardList: [],
        dashboardTitle: "",
        intl: createInternalIntl(),
        widget,
        attributeDisplayForms: {},
    }).map((item) => item.name);
}

describe("createDrillSelectItems with key driver analysis", () => {
    it("explains the height measure of a Mekko chart", () => {
        expect(getKeyDriverItemNames(createInsight())).toEqual(["Drop from 2011", "Increase in 2013"]);
    });

    it("skips measures with key driver analysis disabled on the widget insight", () => {
        expect(getKeyDriverItemNames(createInsight({ height: true }))).toEqual([
            "Increase from 2011",
            "Increase in 2013",
        ]);
    });
});

// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { MEASURES, VIEW } from "../constants/bucket.js";
import { type IAppState } from "../store/types.js";
import { defaultVisualizationClasses, productAttribute } from "../tests/constants.test.helpers.js";
import { getInitializedState } from "../tests/state.test.helpers.js";
import { withData } from "../tests/state_builder.test.helpers.js";

import { getInsightForRawExport, getRawExportOverrides } from "./insight_selectors.js";

// A bucket item carrying an explicit display-form choice (`displayForm`/`dfRef`) injects its refs
// into the decorated attribute (models/decorated_bucket_item.ts#getAttribute merge), and every raw
// export — geo or not — reads them back out. These fixtures hold the shape production stores, so a
// reader that only works on some other shape fails here.
describe("raw export selectors on plain buckets with an explicit display form", () => {
    const selectedDf = productAttribute.displayForms[1]; // "Product (short)"

    function createState(): IAppState {
        const viewItem = {
            attribute: productAttribute.identifier,
            type: "attribute",
            localIdentifier: "a1",
            // the explicit user choice of a non-default display form
            displayForm: { uri: selectedDf.uri },
            dfRef: { uri: selectedDf.uri },
            dfUri: selectedDf.uri,
            dfIdentifier: selectedDf.id,
        };

        return withData(
            withData(
                withData(getInitializedState(), { visualizationClass: defaultVisualizationClasses[0] }),
                {
                    itemCache: {
                        ...getInitializedState().data.itemCache,
                        [`attribute.${productAttribute.identifier}`]: productAttribute,
                    },
                },
            ),
            {
                buckets: [
                    { localIdentifier: MEASURES, items: [] },
                    { localIdentifier: VIEW, items: [viewItem] },
                ],
            },
        ) as IAppState;
    }

    it("getRawExportOverrides should resolve the display form title without crashing", () => {
        const overrides = getRawExportOverrides(createState());

        expect(overrides.displayForms["a1"]).toEqual({ title: selectedDf.title });
    });

    it("getInsightForRawExport should build the insight without crashing", () => {
        const insight = getInsightForRawExport(createState());

        expect(insight.insight.buckets.length).toBeGreaterThan(0);
    });
});

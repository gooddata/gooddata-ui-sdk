// (C) 2021-2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { itemCache } from "../tests/constants.test.helpers.js";
import { dateDatasetsMetaItems } from "../tests/date_datasets_meta.test.helpers.js";

import { getDateDatasetRefsWithGranularities } from "./date_dataset_with_granularities_selector.js";

describe("getDateDatasetsWithGranularities", () => {
    it("should return date datasets with all granularities, extended by granularity option and cacheIdentifier", () => {
        expect(
            getDateDatasetRefsWithGranularities.resultFunc(dateDatasetsMetaItems, itemCache),
        ).toMatchSnapshot();
    });
});

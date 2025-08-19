// (C) 2021-2025 GoodData Corporation

import { describe, expect, it } from "vitest";

import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { recordedDataViews } from "@gooddata/sdk-backend-mockingbird";
import { IDataView } from "@gooddata/sdk-backend-spi";

import { DataViewFacade } from "../../../results/facade.js";
import { getAvailableDrillTargets } from "../availableDrillTargets.js";

describe("getAvailableDrillTargets", () => {
    const Scenarios: Array<[string, IDataView]> = recordedDataViews(ReferenceRecordings.Recordings).map(
        (dv) => [dv.name, dv.dataView],
    );

    it.each(Scenarios)("should provide correct available drill targets for: %s", (_desc, dataView) => {
        expect(getAvailableDrillTargets(DataViewFacade.for(dataView))).toMatchSnapshot();
    });
});

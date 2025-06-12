// (C) 2021 GoodData Corporation

import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { recordedDataViews } from "@gooddata/sdk-backend-mockingbird";
import { IDataView } from "@gooddata/sdk-backend-spi";
import { getAvailableDrillTargets } from "../availableDrillTargets.js";
import { DataViewFacade } from "../../../results/facade.js";
import { describe, expect, it } from "vitest";

describe("getAvailableDrillTargets", () => {
    const Scenarios: Array<[string, IDataView]> = recordedDataViews(ReferenceRecordings.Recordings).map(
        (dv) => [dv.name, dv.dataView],
    );

    it.each(Scenarios)("should provide correct available drill targets for: %s", (_desc, dataView) => {
        expect(getAvailableDrillTargets(DataViewFacade.for(dataView))).toMatchSnapshot();
    });
});

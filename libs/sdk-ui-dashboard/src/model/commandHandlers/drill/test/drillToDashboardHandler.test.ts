// (C) 2023 GoodData Corporation
import { beforeEach, describe, it, expect } from "vitest";
import { IDrillToDashboard } from "@gooddata/sdk-model";
import { TestCorrelation } from "./../../../tests/fixtures/Dashboard.fixtures.js";
import { IDashboardDrillEvent } from "../../../../types.js";
import { DashboardDrillToDashboardResolved } from "../../../events/drill.js";

import { DashboardTester, preloadedTesterFactory } from "../../../tests/DashboardTester.js";
import { drillToDashboard } from "../../../commands/index.js";
import {
    DrillToDashboardFromWonMeasureDefinition,
    SimpleDashboardIdentifier,
    SimpleSortedTableWidgetRef,
    SimpleDashboardSimpleSortedTableWonMeasureLocalIdentifier,
} from "../../../tests/fixtures/SimpleDashboard.fixtures.js";

const drills: IDrillToDashboard = DrillToDashboardFromWonMeasureDefinition;
const eventData: IDashboardDrillEvent = {
    dataView: {} as any,
    drillContext: {
        element: "bar",
        type: "combo",
        intersection: [
            {
                header: {
                    measureHeaderItem: {
                        name: "Won",
                        format: "$#,##0.00",
                        localIdentifier: SimpleDashboardSimpleSortedTableWonMeasureLocalIdentifier,
                        ref: undefined,
                    },
                },
            },
        ],
    },
    drillDefinitions: [drills],
    widgetRef: SimpleSortedTableWidgetRef,
};

// NOTE: other cases should be covered.
describe("drill to dashboard handler", () => {
    let Tester: DashboardTester;

    beforeEach(async () => {
        await preloadedTesterFactory((tester) => {
            Tester = tester;
        }, SimpleDashboardIdentifier);
    });

    it("should emit the appropriate events for drill to dashboard", async () => {
        await Tester.dispatchAndWaitFor(
            drillToDashboard(DrillToDashboardFromWonMeasureDefinition, eventData, TestCorrelation),
            "GDC.DASH/EVT.DRILL.DRILL_TO_DASHBOARD.RESOLVED",
        );

        expect(Tester.emittedEventsDigest()).toMatchSnapshot();
    });

    it("should resolve drill to dashboard with correct data", async () => {
        const event: DashboardDrillToDashboardResolved = await Tester.dispatchAndWaitFor(
            drillToDashboard(DrillToDashboardFromWonMeasureDefinition, eventData, TestCorrelation),
            "GDC.DASH/EVT.DRILL.DRILL_TO_DASHBOARD.RESOLVED",
        );

        expect(event.payload.filters).toEqual([
            {
                negativeAttributeFilter: {
                    displayForm: {
                        uri: "/example/md/mock/123",
                    },
                    notIn: {
                        uris: ["/example/md/mock/124"],
                    },
                },
            },
        ]);
        expect(event.payload.drillDefinition).toEqual(drills);
        expect(event.payload.drillEvent).toEqual(eventData);
    });
});

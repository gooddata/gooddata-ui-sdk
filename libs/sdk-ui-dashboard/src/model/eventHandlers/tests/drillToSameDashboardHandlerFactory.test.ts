// (C) 2026 GoodData Corporation

import { describe, expect, it, vi } from "vitest";

import { type IAnalyticalBackend, type IDataView } from "@gooddata/sdk-backend-spi";
import { type IDrillToDashboard, idRef } from "@gooddata/sdk-model";
import { type IDrillEventContext } from "@gooddata/sdk-ui";

import { type IDashboardDrillToDashboardResolved, drillToDashboardResolved } from "../../events/drill.js";
import { newDrillToSameDashboardHandler } from "../drillToSameDashboardHandlerFactory.js";

describe("newDrillToSameDashboardHandler", () => {
    const dashboardRef = idRef("dash-1");
    const topNRef = idRef("topN", "parameter");

    const drillDefinition: IDrillToDashboard = {
        type: "drillToDashboard",
        transition: "in-place",
        origin: { type: "drillFromMeasure", measure: { localIdentifier: "m1" } },
        target: dashboardRef,
    };

    // dataView/drillContext are required by the event types but never read by the handler under test
    const drillEvent = {
        dataView: {} as IDataView,
        drillContext: {} as IDrillEventContext,
        drillDefinitions: [],
    };

    function makeResolvedEvent(): IDashboardDrillToDashboardResolved {
        return drillToDashboardResolved(
            { workspace: "ws-1", backend: {} as IAnalyticalBackend },
            [],
            [],
            [{ ref: topNRef, value: 3 }],
            drillDefinition,
            drillEvent,
        );
    }

    it("dispatches both the filter selection and the parameter values commands", () => {
        const dispatch = vi.fn();
        const select = vi.fn();

        newDrillToSameDashboardHandler(dashboardRef).handler(makeResolvedEvent(), dispatch, select);

        const dispatched = dispatch.mock.calls.map(([action]) => action);
        const dispatchedTypes = dispatched.map((action) => action.type);

        expect(dispatchedTypes).toContain("GDC.DASH/CMD.FILTER_CONTEXT.CHANGE_SELECTION");
        expect(dispatchedTypes).toContain("GDC.DASH/CMD.PARAMETERS.CHANGE_VALUES");

        const paramCommand = dispatched.find(
            (action) => action.type === "GDC.DASH/CMD.PARAMETERS.CHANGE_VALUES",
        );
        expect(paramCommand?.payload.parameters).toEqual([{ ref: topNRef, value: 3 }]);
    });
});

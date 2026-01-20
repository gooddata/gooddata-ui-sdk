// (C) 2021-2026 GoodData Corporation

import { beforeEach, describe, expect, it } from "vitest";

import { type IDashboard, type IRichTextWidgetDefinition, idRef } from "@gooddata/sdk-model";

import { createDefaultFilterContext } from "../../../../_staging/dashboard/defaultFilterContext.js";
import { defaultDateFilterConfig } from "../../../../_staging/dateFilterConfig/defaultConfig.js";
import {
    type IChangeRichTextWidgetContent,
    addLayoutSection,
    changeRichTextWidgetContent,
} from "../../../commands/index.js";
import {
    type IDashboardCommandFailed,
    type IDashboardRichTextWidgetContentChanged,
} from "../../../events/index.js";
import { selectAnalyticalWidgetByRef } from "../../../store/tabs/layout/layoutSelectors.js";
import { type DashboardTester, preloadedTesterFactory } from "../../../tests/DashboardTester.js";
import {
    EmptyDashboardIdentifier,
    EmptyDashboardWithReferences,
    TestCorrelation,
} from "../../../tests/fixtures/Dashboard.fixtures.js";
import { TestRichTextItem } from "../../../tests/fixtures/Layout.fixtures.js";
import { type PrivateDashboardContext } from "../../../types/commonTypes.js";
import { EmptyDashboardLayout } from "../../dashboard/common/dashboardInitialize.js";

describe("rich text widget", () => {
    let Tester: DashboardTester;

    const dashboardWithDefaults: IDashboard = {
        ...EmptyDashboardWithReferences.dashboard,
        ref: idRef(EmptyDashboardIdentifier),
        identifier: EmptyDashboardIdentifier,
        layout: EmptyDashboardLayout,
        filterContext: createDefaultFilterContext(
            defaultDateFilterConfig,
            true,
        ) as IDashboard["filterContext"],
    };

    const customizationFnsWithPreload: PrivateDashboardContext = {
        preloadedDashboard: dashboardWithDefaults,
    };

    beforeEach(async () => {
        await preloadedTesterFactory(
            (tester) => {
                Tester = tester;
            },
            EmptyDashboardIdentifier,
            {
                backendConfig: {
                    useRefType: "id",
                },
                customizationFns: customizationFnsWithPreload,
            },
        );

        await Tester.dispatchAndWaitFor(
            addLayoutSection(0, undefined, [TestRichTextItem]),
            "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_ADDED",
        );
    });

    it("should set new rich text content", async () => {
        const UpdatedContent = "# Title";

        const event: IDashboardRichTextWidgetContentChanged = await Tester.dispatchAndWaitFor(
            changeRichTextWidgetContent(TestRichTextItem.widget!.ref, UpdatedContent),
            "GDC.DASH/EVT.RICH_TEXT_WIDGET.CONTENT_CHANGED",
        );

        expect(event.payload.content).toEqual(UpdatedContent);
        const widgetState = selectAnalyticalWidgetByRef(TestRichTextItem.widget!.ref)(
            Tester.state(),
        ) as IRichTextWidgetDefinition;
        expect(widgetState.content).toEqual(UpdatedContent);
    });

    it("should fail if trying to vis properties of non-existent widget", async () => {
        const UpdatedContent = "# Title";

        const event: IDashboardCommandFailed<IChangeRichTextWidgetContent> = await Tester.dispatchAndWaitFor(
            changeRichTextWidgetContent(idRef("mising"), UpdatedContent, TestCorrelation),
            "GDC.DASH/EVT.COMMAND.FAILED",
        );

        expect(event.payload.reason).toEqual("USER_ERROR");
        expect(event.correlationId).toEqual(TestCorrelation);
    });
});

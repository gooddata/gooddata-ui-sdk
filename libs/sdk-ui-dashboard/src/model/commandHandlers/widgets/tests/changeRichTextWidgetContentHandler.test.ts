// (C) 2021-2024 GoodData Corporation
import { beforeEach, describe, it, expect } from "vitest";
import { DashboardTester, preloadedTesterFactory } from "../../../tests/DashboardTester.js";
import { EmptyDashboardIdentifier, TestCorrelation } from "../../../tests/fixtures/Dashboard.fixtures.js";
import {
    ChangeRichTextWidgetContent,
    addLayoutSection,
    changeRichTextWidgetContent,
} from "../../../commands/index.js";
import { DashboardCommandFailed, DashboardRichTextWidgetContentChanged } from "../../../events/index.js";
import { selectAnalyticalWidgetByRef } from "../../../store/layout/layoutSelectors.js";
import { idRef, IRichTextWidgetDefinition } from "@gooddata/sdk-model";
import { TestRichTextItem } from "../../../tests/fixtures/Layout.fixtures.js";

describe("rich text widget", () => {
    let Tester: DashboardTester;

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
            },
        );

        await Tester.dispatchAndWaitFor(
            addLayoutSection(0, undefined, [TestRichTextItem]),
            "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_ADDED",
        );
    });

    it("should set new rich text content", async () => {
        const UpdatedContent = "# Title";

        const event: DashboardRichTextWidgetContentChanged = await Tester.dispatchAndWaitFor(
            changeRichTextWidgetContent(TestRichTextItem.widget!.ref, UpdatedContent),
            "GDC.DASH/EVT.RICH_TEXT_WIDGET.CONTENT_CHANGED",
        );

        expect(event.payload.content).toEqual(UpdatedContent);
        const widgetState = selectAnalyticalWidgetByRef(TestRichTextItem.widget!.ref)(
            Tester.state(),
        ) as IRichTextWidgetDefinition;
        expect(widgetState!.content).toEqual(UpdatedContent);
    });

    it("should fail if trying to vis properties of non-existent widget", async () => {
        const UpdatedContent = "# Title";

        const event: DashboardCommandFailed<ChangeRichTextWidgetContent> = await Tester.dispatchAndWaitFor(
            changeRichTextWidgetContent(idRef("mising"), UpdatedContent, TestCorrelation),
            "GDC.DASH/EVT.COMMAND.FAILED",
        );

        expect(event.payload.reason).toEqual("USER_ERROR");
        expect(event.correlationId).toEqual(TestCorrelation);
    });
});

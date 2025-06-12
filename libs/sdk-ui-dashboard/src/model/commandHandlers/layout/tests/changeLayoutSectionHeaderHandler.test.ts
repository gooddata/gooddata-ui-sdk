// (C) 2021-2022 GoodData Corporation
import { beforeEach, describe, it, expect } from "vitest";
import { DashboardTester, preloadedTesterFactory } from "../../../tests/DashboardTester.js";
import { TestCorrelation } from "../../../tests/fixtures/Dashboard.fixtures.js";
import {
    DashboardCommandFailed,
    DashboardLayoutChanged,
    DashboardLayoutSectionHeaderChanged,
} from "../../../events/index.js";
import {
    ChangeLayoutSectionHeader,
    changeLayoutSectionHeader,
    undoLayoutChanges,
} from "../../../commands/index.js";
import { selectLayout } from "../../../store/layout/layoutSelectors.js";
import { SimpleDashboardIdentifier } from "../../../tests/fixtures/SimpleDashboard.fixtures.js";

const FullHeader = { title: "My Section", description: "My Section Description" };
const HeaderWithJustTitle = { title: "My Section" };
const HeaderWithJustDescription = { description: "My Section Description" };

describe("change layout section header handler", () => {
    // Note: the simple dashboard has one section and this section does not have any header specified
    describe("for any dashboard", () => {
        let Tester: DashboardTester;

        beforeEach(async () => {
            await preloadedTesterFactory((tester) => {
                Tester = tester;
            }, SimpleDashboardIdentifier);
        });

        it("should replace header with a new one", async () => {
            const event: DashboardLayoutSectionHeaderChanged = await Tester.dispatchAndWaitFor(
                changeLayoutSectionHeader(0, FullHeader),
                "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_HEADER_CHANGED",
            );

            expect(event.payload.sectionIndex).toEqual(0);
            expect(event.payload.newHeader).toEqual(FullHeader);

            const layout = selectLayout(Tester.state());
            expect(layout.sections[0].header).toEqual(FullHeader);
        });

        it("should incrementally merge header", async () => {
            const firstEvent: DashboardLayoutSectionHeaderChanged = await Tester.dispatchAndWaitFor(
                changeLayoutSectionHeader(0, HeaderWithJustTitle, true),
                "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_HEADER_CHANGED",
            );

            expect(firstEvent.payload.newHeader).toEqual(HeaderWithJustTitle);
            const firstLayout = selectLayout(Tester.state());
            expect(firstLayout.sections[0].header).toEqual(HeaderWithJustTitle);

            const secondEvent: DashboardLayoutSectionHeaderChanged = await Tester.dispatchAndWaitFor(
                changeLayoutSectionHeader(0, HeaderWithJustDescription, true),
                "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_HEADER_CHANGED",
            );

            // merging header with just the title & header with just the description must lead to full header
            expect(secondEvent.payload.newHeader).toEqual(FullHeader);
            const secondLayout = selectLayout(Tester.state());
            expect(secondLayout.sections[0].header).toEqual(FullHeader);
        });

        it("should modify part of existing header using merge", async () => {
            // set some header
            await Tester.dispatchAndWaitFor(
                changeLayoutSectionHeader(0, FullHeader),
                "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_HEADER_CHANGED",
            );

            // then modify just title, keeping the original description
            const headerToUpdate = { title: "My Updated Section Title" };
            const titleChanged: DashboardLayoutSectionHeaderChanged = await Tester.dispatchAndWaitFor(
                changeLayoutSectionHeader(0, headerToUpdate, true),
                "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_HEADER_CHANGED",
            );

            expect(titleChanged.payload.newHeader.title).toEqual(headerToUpdate.title);
            expect(titleChanged.payload.newHeader.description).toEqual(FullHeader.description);

            const layout = selectLayout(Tester.state());
            expect(layout.sections[0].header).toEqual(titleChanged.payload.newHeader);
        });

        it("should be undoable", async () => {
            const originalLayout = selectLayout(Tester.state());

            //
            // first incrementally modify the header using two commands
            //

            await Tester.dispatchAndWaitFor(
                changeLayoutSectionHeader(0, HeaderWithJustTitle, true),
                "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_HEADER_CHANGED",
            );

            const layoutAfterFirstUpdate = selectLayout(Tester.state());

            await Tester.dispatchAndWaitFor(
                changeLayoutSectionHeader(0, HeaderWithJustDescription, true),
                "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_HEADER_CHANGED",
            );

            //
            // then undo changes, command after command
            //

            const lastChangeUndone: DashboardLayoutChanged = await Tester.dispatchAndWaitFor(
                undoLayoutChanges(),
                "GDC.DASH/EVT.FLUID_LAYOUT.LAYOUT_CHANGED",
            );

            expect(lastChangeUndone.payload.layout.sections[0].header).toEqual(
                layoutAfterFirstUpdate.sections[0].header,
            );
            expect(selectLayout(Tester.state())).toEqual(layoutAfterFirstUpdate);

            const secondUndoFinished: DashboardLayoutChanged = await Tester.dispatchAndWaitFor(
                undoLayoutChanges(),
                "GDC.DASH/EVT.FLUID_LAYOUT.LAYOUT_CHANGED",
            );

            expect(secondUndoFinished.payload.layout.sections[0].header).toEqual(
                originalLayout.sections[0].header,
            );
            expect(selectLayout(Tester.state())).toEqual(originalLayout);
        });

        it("should emit the correct events", async () => {
            await Tester.dispatchAndWaitFor(
                changeLayoutSectionHeader(0, FullHeader, false, TestCorrelation),
                "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_HEADER_CHANGED",
            );

            expect(Tester.emittedEventsDigest()).toMatchSnapshot();
        });

        it("should fail if bad section index provided", async () => {
            const originalLayout = selectLayout(Tester.state());

            const failed: DashboardCommandFailed<ChangeLayoutSectionHeader> = await Tester.dispatchAndWaitFor(
                changeLayoutSectionHeader(originalLayout.sections.length, FullHeader, false, TestCorrelation),
                "GDC.DASH/EVT.COMMAND.FAILED",
            );

            expect(failed.payload.reason).toEqual("USER_ERROR");
            expect(failed.correlationId).toEqual(TestCorrelation);
        });
    });
});

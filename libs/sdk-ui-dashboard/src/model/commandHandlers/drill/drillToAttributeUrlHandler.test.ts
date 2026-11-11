// (C) 2026 GoodData Corporation

import { beforeEach, describe, expect, it, vi } from "vitest";

import { dummyDataView } from "@gooddata/sdk-backend-mockingbird";
import { type IDrillToAttributeUrl, idRef, newDefForItems } from "@gooddata/sdk-model";

import {
    SimpleDashboardIdentifier,
    SimpleSortedTableWidgetRef,
} from "../../../tests/SimpleDashboard.test.helpers.js";
import { type IDashboardDrillEvent } from "../../../types.js";
import { drillToAttributeUrl } from "../../commands/drill.js";
import { type DashboardTester, preloadedTesterFactory } from "../../DashboardTester.js";
import { isDashboardDrillToAttributeUrlResolved } from "../../events/drill.js";
import { isDashboardCommandFailed } from "../../events/general.js";

const hyperlink = vi.hoisted((): { value: string | undefined } => ({ value: "" }));

vi.mock("./resolveDrillToAttributeUrl.js", () => ({
    resolveDrillToAttributeUrl: () => hyperlink.value,
}));

describe("drillToAttributeUrlHandler", () => {
    const drillDefinition: IDrillToAttributeUrl = {
        type: "drillToAttributeUrl",
        transition: "new-window",
        origin: { type: "drillFromAttribute", attribute: { localIdentifier: "a1" } },
        target: { displayForm: idRef("label"), hyperlinkDisplayForm: idRef("hyperlink") },
    };

    const drillEvent: IDashboardDrillEvent = {
        dataView: dummyDataView(newDefForItems("reference-workspace", [])),
        drillContext: { type: "table", element: "cell", intersection: [] },
        drillDefinitions: [],
        widgetRef: SimpleSortedTableWidgetRef,
    };

    let Tester: DashboardTester;
    beforeEach(async () => {
        await preloadedTesterFactory(function setTester(tester) {
            Tester = tester;
        }, SimpleDashboardIdentifier);
    });

    it("resolves a web hyperlink", async () => {
        hyperlink.value = "https://example.com/item";

        const event: unknown = await Tester.dispatchAndWaitFor(
            drillToAttributeUrl(drillDefinition, drillEvent),
            "GDC.DASH/EVT.DRILL.DRILL_TO_ATTRIBUTE_URL.RESOLVED",
        );

        if (!isDashboardDrillToAttributeUrlResolved(event)) {
            throw new Error("The attribute URL drill did not resolve.");
        }
        expect(event.payload.url).toBe("https://example.com/item");
    });

    it("resolves a hyperlink with a malformed percent escape", async () => {
        hyperlink.value = "https://example.com/discount/50%";

        const event: unknown = await Tester.dispatchAndWaitFor(
            drillToAttributeUrl(drillDefinition, drillEvent),
            "GDC.DASH/EVT.DRILL.DRILL_TO_ATTRIBUTE_URL.RESOLVED",
        );

        if (!isDashboardDrillToAttributeUrlResolved(event)) {
            throw new Error("The attribute URL drill did not resolve.");
        }
        expect(event.payload.url).toBe("https://example.com/discount/50%");
    });

    it("rejects a hyperlink with a script scheme", async () => {
        hyperlink.value = "javascript:alert(document.domain)";

        const event: unknown = await Tester.dispatchAndWaitFor(
            drillToAttributeUrl(drillDefinition, drillEvent),
            "GDC.DASH/EVT.COMMAND.FAILED",
        );

        if (!isDashboardCommandFailed(event)) {
            throw new Error("The attribute URL drill did not fail.");
        }
        expect(event.payload.reason).toBe("USER_ERROR");
    });

    it("rejects a missing hyperlink", async () => {
        hyperlink.value = undefined;

        const event: unknown = await Tester.dispatchAndWaitFor(
            drillToAttributeUrl(drillDefinition, drillEvent),
            "GDC.DASH/EVT.COMMAND.FAILED",
        );

        if (!isDashboardCommandFailed(event)) {
            throw new Error("The attribute URL drill did not fail.");
        }
        expect(event.payload.reason).toBe("USER_ERROR");
    });
});

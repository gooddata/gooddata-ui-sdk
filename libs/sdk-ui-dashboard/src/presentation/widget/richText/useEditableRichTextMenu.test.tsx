// (C) 2026 GoodData Corporation

import { renderHook } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type IRichTextWidget, idRef } from "@gooddata/sdk-model";

const mockIsRestricted = vi.fn();

// `isolate: false` shares one module graph per worker, so the modules mocked below may already have
// been evaluated against their real dependencies by a test file that ran earlier in the same worker.
vi.hoisted(() => {
    vi.resetModules();
});

vi.mock("../../../model/react/DashboardStoreProvider.js", () => ({
    useDashboardSelector: () => true, // the filter-configuration switch is on
    useDashboardDispatch: () => vi.fn(),
}));

vi.mock("../../../model/react/useDashboardEventDispatch.js", () => ({
    useDashboardEventDispatch: () => vi.fn(),
}));

vi.mock("../../dashboardContexts/DashboardCustomizationsContext.js", () => ({
    useDashboardCustomizationsContext: () => ({}),
}));

vi.mock("../../../model/react/useIsWidgetRestricted.js", () => ({
    useIsWidgetRestricted: () => mockIsRestricted(),
}));

const { useEditableRichTextMenu } = await import("./useEditableRichTextMenu.js");

const widget: IRichTextWidget = {
    type: "richText",
    content: "Margin {metric/m-restricted}",
    ref: idRef("widget-1"),
    uri: "/widget-1",
    identifier: "widget-1",
    title: "",
    description: "",
    drills: [],
    ignoreDashboardFilters: [],
};

function renderMenu() {
    return renderHook(() => useEditableRichTextMenu({ widget, closeMenu: vi.fn() }), {
        wrapper: ({ children }) => (
            <IntlProvider
                locale="en-US"
                messages={{
                    "configurationPanel.title": "Configuration",
                    "configurationPanel.remove.form.dashboard": "Remove from dashboard",
                }}
            >
                {children}
            </IntlProvider>
        ),
    }).result.current;
}

describe("useEditableRichTextMenu", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("offers removal alone for a widget whose reference the editor cannot read", () => {
        mockIsRestricted.mockReturnValue(true);

        expect(renderMenu().menuItems.map((item) => item.itemId)).toEqual(["InteractionPanelRemove"]);
    });

    it("keeps the configuration for an ordinary widget", () => {
        mockIsRestricted.mockReturnValue(false);

        expect(renderMenu().menuItems.map((item) => item.itemId)).toEqual([
            "ConfigurationPanelSubmenu",
            "ConfigurationPanelRemoveSeparator",
            "InteractionPanelRemove",
        ]);
    });
});

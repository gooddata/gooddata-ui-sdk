// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import { render, renderHook, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { type IAutomationMetadataObject, idRef } from "@gooddata/sdk-model";
import { ToastsCenterContextProvider } from "@gooddata/sdk-ui-kit";

import { InternalIntlWrapper } from "../../internal/utils/internalIntlProvider.js";
import { type AutomationAction, type IEditAutomation, type IUseAutomationColumnsProps } from "../types.js";

import { useAutomationColumns } from "./useAutomationColumns.js";

vi.mock("../UserContext.js", () => ({
    useUser: () => ({
        canManageAutomation: () => true,
        isSubscribedToAutomation: () => false,
        canPauseAutomation: () => false,
        canResumeAutomation: () => false,
        canTriggerAutomation: () => false,
    }),
}));

const automation = {
    id: "a1",
    type: "automation",
    title: "Weekly export",
    dashboard: { id: "d1", title: "Dashboard" },
} as IAutomationMetadataObject;

const restrictedAutomation: IAutomationMetadataObject = {
    ...automation,
    unavailable: [{ ref: idRef("vis", "insight"), type: "insight", reason: "forbidden" }],
};

const wrapper = ({ children }: { children?: ReactNode }) => (
    <InternalIntlWrapper>
        <ToastsCenterContextProvider skipAutomaticMessageRendering>{children}</ToastsCenterContextProvider>
    </InternalIntlWrapper>
);

const renderColumns = () => {
    const props: IUseAutomationColumnsProps = {
        type: "schedule",
        automationsType: "schedule",
        selectedColumnDefinitions: [{ name: "title" }, { name: "widget" }, { name: "menu" }],
        tableVariant: "regular",
        enableBulkActions: false,
        deleteAutomation: vi.fn<AutomationAction>(),
        unsubscribeFromAutomation: vi.fn<AutomationAction>(),
        pauseAutomation: vi.fn<AutomationAction>(),
        resumeAutomation: vi.fn<AutomationAction>(),
        triggerAutomation: vi.fn<AutomationAction>(),
        dashboardUrlBuilder: () => "dashboard-url",
        widgetUrlBuilder: () => "widget-url",
        editAutomation: vi.fn<IEditAutomation>(),
        setPendingAction: vi.fn<IUseAutomationColumnsProps["setPendingAction"]>(),
    };
    const [title, widget, menu] = renderHook(() => useAutomationColumns(props), { wrapper }).result.current
        .columnDefinitions;
    return { title, widget, menu };
};

const restrictedTooltip =
    "You don't have access to some of the objects used in this automation, so it can't be opened.";

describe("useAutomationColumns with a restricted automation", () => {
    it("shows the lock instead of the type icon only when the automation is restricted", () => {
        const { title } = renderColumns();

        const { unmount } = render(<>{title.renderRoleIcon?.(automation)}</>, { wrapper });
        expect(screen.queryByLabelText(restrictedTooltip)).not.toBeInTheDocument();
        unmount();

        render(<>{title.renderRoleIcon?.(restrictedAutomation)}</>, { wrapper });
        expect(screen.getByLabelText(restrictedTooltip)).toBeInTheDocument();
    });

    it("shows the name locked only when the automation is restricted", () => {
        const { title } = renderColumns();

        expect(title.isLocked?.(automation)).toBe(false);
        expect(title.isLocked?.(restrictedAutomation)).toBe(true);
    });

    it("hides the widget link only when the automation is restricted", () => {
        const { widget } = renderColumns();

        expect(widget.getTextHref?.(automation)).toBe("widget-url");
        expect(widget.getTextHref?.(restrictedAutomation)).toBeUndefined();
    });

    it("disables Edit only when the automation is restricted", () => {
        const { menu } = renderColumns();

        const { unmount } = render(<>{menu.renderMenu?.(automation, vi.fn<() => void>())}</>, { wrapper });
        expect(screen.getByRole("menuitem", { name: "Edit" })).not.toHaveAttribute("aria-disabled", "true");
        unmount();

        render(<>{menu.renderMenu?.(restrictedAutomation, vi.fn<() => void>())}</>, { wrapper });
        expect(screen.getByRole("menuitem", { name: "Edit" })).toHaveAttribute("aria-disabled", "true");
        expect(screen.getByRole("menuitem", { name: "Delete" })).not.toHaveAttribute("aria-disabled", "true");
    });
});

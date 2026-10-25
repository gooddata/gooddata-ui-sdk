// (C) 2026 GoodData Corporation

import { useEffect } from "react";

import { fireEvent, render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { describe, expect, it, vi } from "vitest";

import { type IUiResizableSidebarState, UiResizableSidebarProvider } from "@gooddata/sdk-ui-kit";

import { getIntlOptions } from "../../utils/with_intl.js";

import { CatalogSidebar } from "./CatalogSidebar.js";
import { CatalogSidebarHeader, CatalogSidebarRestoreToggle } from "./CatalogSidebarToggle.js";
import { STATIC_CATALOG_SIDEBAR } from "./useCatalogSidebarState.js";

const resizable: IUiResizableSidebarState = {
    ...STATIC_CATALOG_SIDEBAR,
    max: 500,
    canResize: true,
    canCollapse: true,
};

const collapsed: IUiResizableSidebarState = {
    ...STATIC_CATALOG_SIDEBAR,
    width: 0,
    min: 0,
    max: 0,
    canCollapse: true,
    isCollapsed: true,
};

function Catalog({ onMount }: { onMount: () => void }) {
    useEffect(onMount, [onMount]);

    return <div data-testid="catalog" />;
}

function renderWithSidebar(sidebar: IUiResizableSidebarState, isEnabled = true) {
    const onMount = vi.fn();
    const tree = (state: IUiResizableSidebarState) => (
        <IntlProvider {...getIntlOptions()}>
            <UiResizableSidebarProvider value={state}>
                <CatalogSidebarRestoreToggle />
                <CatalogSidebar isEnabled={isEnabled}>
                    <CatalogSidebarHeader />
                    <Catalog onMount={onMount} />
                </CatalogSidebar>
            </UiResizableSidebarProvider>
        </IntlProvider>
    );
    const { rerender } = render(tree(sidebar));

    return { onMount, rerenderWith: (state: IUiResizableSidebarState) => rerender(tree(state)) };
}

describe("CatalogSidebar", () => {
    it("renders the plain catalog when the sidebar is not enabled", () => {
        renderWithSidebar(STATIC_CATALOG_SIDEBAR, false);

        expect(screen.getByTestId("catalog")).toBeInTheDocument();
        expect(screen.queryByTestId("s-catalog-sidebar")).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "Collapse Data Catalog" })).not.toBeInTheDocument();
    });

    it("renders the resize handle of a resizable catalog", () => {
        renderWithSidebar(resizable);

        expect(screen.getByTestId("s-catalog-sidebar")).toContainElement(screen.getByTestId("catalog"));
        expect(screen.getByRole("separator", { name: "Resize Data Catalog" })).toBeInTheDocument();
    });

    it("keeps the catalog mounted when it can no longer resize or collapse", () => {
        const { onMount, rerenderWith } = renderWithSidebar(resizable);

        rerenderWith(STATIC_CATALOG_SIDEBAR);

        expect(screen.getByTestId("s-catalog-sidebar")).toContainElement(screen.getByTestId("catalog"));
        expect(screen.queryByRole("separator", { name: "Resize Data Catalog" })).not.toBeInTheDocument();
        expect(onMount).toHaveBeenCalledOnce();
    });

    it("collapses the catalog from the toggle above it", () => {
        const setCollapsed = vi.fn();
        renderWithSidebar({ ...resizable, setCollapsed });

        const toggle = screen.getByRole("button", { name: "Collapse Data Catalog" });
        expect(toggle).toHaveAttribute("aria-expanded", "true");
        expect(screen.queryByTestId("s-catalog-sidebar-restore-toggle")).not.toBeInTheDocument();

        fireEvent.click(toggle);
        expect(setCollapsed).toHaveBeenCalledExactlyOnceWith(true);
    });

    it("restores the collapsed catalog from the header toggle", () => {
        const setCollapsed = vi.fn();
        renderWithSidebar({ ...collapsed, setCollapsed });

        fireEvent.click(screen.getByTestId("s-catalog-sidebar-restore-toggle"));
        expect(setCollapsed).toHaveBeenCalledExactlyOnceWith(false);
    });

    it("restores the collapsed catalog from the edge trigger", () => {
        const setCollapsed = vi.fn();
        renderWithSidebar({ ...collapsed, setCollapsed });

        fireEvent.click(screen.getByTestId("s-catalog-sidebar-expand-trigger"));
        expect(setCollapsed).toHaveBeenCalledExactlyOnceWith(false);
    });
});

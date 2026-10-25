// (C) 2026 GoodData Corporation

import { type ReactElement, type ReactNode } from "react";

import { useIntl } from "react-intl";

import {
    UiResizableSidebar,
    UiResizableSidebarExpandTrigger,
    UiResizableSidebarHandle,
} from "@gooddata/sdk-ui-kit";

import { useCatalogSidebar } from "./useCatalogSidebarState.js";

interface ICatalogSidebarProps {
    /**
     * Whether the catalog lives in the shared resizable sidebar at all; it stays there even while it can
     * neither resize nor collapse, so the catalog is not remounted when that changes.
     */
    isEnabled: boolean;
    children: ReactNode;
}

/**
 * The catalog column inside the shared resizable sidebar with its drag handle and, while collapsed, the edge
 * trigger that restores it. Renders the catalog as is when the sidebar is not enabled.
 */
export function CatalogSidebar({ isEnabled, children }: ICatalogSidebarProps): ReactElement {
    const intl = useIntl();
    const sidebar = useCatalogSidebar();
    const { canResize, isCollapsed, setCollapsed } = sidebar;

    if (!isEnabled) {
        return <>{children}</>;
    }

    return (
        <>
            {isCollapsed ? (
                <UiResizableSidebarExpandTrigger
                    label={intl.formatMessage({ id: "catalog.sidebar.expand" })}
                    dataTestId="s-catalog-sidebar-expand-trigger"
                    onExpand={() => setCollapsed(false)}
                />
            ) : null}
            <UiResizableSidebar state={sidebar} dataTestId="s-catalog-sidebar">
                {children}
                {canResize ? (
                    <UiResizableSidebarHandle
                        accessibilityConfig={{
                            ariaLabel: intl.formatMessage({ id: "catalog.sidebar.resize" }),
                        }}
                        dataTestId="s-catalog-sidebar-resize-handle"
                    />
                ) : null}
            </UiResizableSidebar>
        </>
    );
}

// (C) 2026 GoodData Corporation

import { type ReactElement } from "react";

import { useIntl } from "react-intl";

import { UiResizableSidebarCollapseToggle, UiTooltip } from "@gooddata/sdk-ui-kit";

import { useCatalogSidebar } from "./useCatalogSidebarState.js";

interface ICatalogSidebarToggleProps {
    isCollapsed: boolean;
    onToggle: () => void;
    dataTestId: string;
}

/**
 * The kit sidebar collapse toggle with the catalog's translated labels and tooltip.
 */
export function CatalogSidebarToggle({
    isCollapsed,
    onToggle,
    dataTestId,
}: ICatalogSidebarToggleProps): ReactElement {
    const intl = useIntl();
    const collapseLabel = intl.formatMessage({ id: "catalog.sidebar.collapse" });
    const expandLabel = intl.formatMessage({ id: "catalog.sidebar.expand" });

    return (
        <UiTooltip
            content={isCollapsed ? expandLabel : collapseLabel}
            arrowPlacement="left"
            triggerBy={["hover", "focus"]}
            optimalPlacement
            accessibilityHidden
            closeOnAnchorClick
            anchor={
                <UiResizableSidebarCollapseToggle
                    isCollapsed={isCollapsed}
                    onToggle={onToggle}
                    collapseLabel={collapseLabel}
                    expandLabel={expandLabel}
                    dataTestId={dataTestId}
                />
            }
        />
    );
}

/**
 * The row above the catalog that holds its collapse toggle.
 */
export function CatalogSidebarHeader(): ReactElement | null {
    const { canCollapse, isCollapsed, setCollapsed } = useCatalogSidebar();

    if (!canCollapse) {
        return null;
    }

    return (
        <div className="adi-catalog-sidebar-header">
            <CatalogSidebarToggle
                isCollapsed={isCollapsed}
                onToggle={() => setCollapsed(!isCollapsed)}
                dataTestId="s-catalog-sidebar-collapse-toggle"
            />
        </div>
    );
}

/**
 * Restores the collapsed catalog from the editor header, in place of the hidden catalog toggle.
 */
export function CatalogSidebarRestoreToggle(): ReactElement | null {
    const { isCollapsed, setCollapsed } = useCatalogSidebar();

    if (!isCollapsed) {
        return null;
    }

    return (
        <div className="adi-catalog-sidebar-restore">
            <CatalogSidebarToggle
                isCollapsed
                onToggle={() => setCollapsed(false)}
                dataTestId="s-catalog-sidebar-restore-toggle"
            />
        </div>
    );
}

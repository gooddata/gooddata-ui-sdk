// (C) 2026 GoodData Corporation

import { type ReactElement, useCallback, useId, useLayoutEffect, useMemo, useRef, useState } from "react";

import { useIntl } from "react-intl";

import { InsightRenderer } from "@gooddata/sdk-ui-ext";
import { type IUiTab, type IUiTabsAccessibilityConfig, UiTabs } from "@gooddata/sdk-ui-kit";

import { type ILayerTableDefinition } from "./insightToTable.js";
import { type IInsightBodyProps } from "./types.js";

/**
 * @internal
 */
export interface ILayeredTableViewProps extends Omit<IInsightBodyProps, "insight"> {
    layerTables: ILayerTableDefinition[];
}

/**
 * Accessible tabbed component that renders each insight layer as a separate table tab.
 *
 * Uses UiTabs from sdk-ui-kit for visual consistency with other tabbed UIs.
 * Only the active panel mounts InsightRenderer (lazy rendering).
 *
 * @internal
 */
export function LayeredTableView(props: ILayeredTableViewProps): ReactElement {
    const { layerTables, ...insightBodyProps } = props;
    const [selectedTabIdState, setSelectedTabIdState] = useState(layerTables[0]?.layerId ?? "");
    const [focusRequestedForTabId, setFocusRequestedForTabId] = useState<string | null>(null);
    const uniqueId = useId();
    const panelRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const intl = useIntl();
    const selectedTabId = useMemo(() => {
        if (layerTables.some((layer) => layer.layerId === selectedTabIdState)) {
            return selectedTabIdState;
        }
        return layerTables[0]?.layerId ?? "";
    }, [layerTables, selectedTabIdState]);

    const tabPanels = useMemo(
        () =>
            layerTables.map((layer, index) => {
                const tabId = `${uniqueId}-layer-tab-${index}`;
                const panelId = `${uniqueId}-layer-panel-${index}`;

                return {
                    layer,
                    tabId,
                    panelId,
                };
            }),
        [layerTables, uniqueId],
    );

    const tabs: IUiTab[] = useMemo(
        () =>
            tabPanels.map(({ layer, tabId, panelId }) => ({
                id: layer.layerId,
                label: layer.layerName,
                tabId,
                panelId,
                ariaLabel: layer.layerName,
                autoSelectOnFocus: false,
            })),
        [tabPanels],
    );

    const accessibilityConfig: IUiTabsAccessibilityConfig = useMemo(
        () => ({
            role: "tablist",
            tabRole: "tab",
            ariaLabel: intl.formatMessage({ id: "geochart.alternateView.tablist.label" }),
        }),
        [intl],
    );

    const handleTabSelect = useCallback((tab: IUiTab) => {
        setSelectedTabIdState(tab.id);
        setFocusRequestedForTabId(tab.id);
    }, []);

    useLayoutEffect(() => {
        if (!focusRequestedForTabId || focusRequestedForTabId !== selectedTabId) {
            return;
        }

        panelRefs.current[focusRequestedForTabId]?.focus();
        setFocusRequestedForTabId(null);
    }, [focusRequestedForTabId, selectedTabId]);

    return (
        <div className="gd-layered-table-view">
            <UiTabs
                size="small"
                tabs={tabs}
                selectedTabId={selectedTabId}
                onTabSelect={handleTabSelect}
                accessibilityConfig={accessibilityConfig}
            />
            <div className="gd-layered-table-view__panels">
                {tabPanels.map(({ layer, tabId, panelId }) => {
                    const isActive = layer.layerId === selectedTabId;

                    return (
                        <div
                            key={layer.layerId}
                            className={
                                isActive
                                    ? "gd-layered-table-view__panel gd-layered-table-view__panel--active"
                                    : "gd-layered-table-view__panel"
                            }
                            id={panelId}
                            role="tabpanel"
                            aria-labelledby={tabId}
                            tabIndex={-1}
                            hidden={!isActive}
                            ref={(node) => {
                                panelRefs.current[layer.layerId] = node;
                            }}
                        >
                            {isActive ? (
                                <InsightRenderer {...insightBodyProps} insight={layer.tableInsight} />
                            ) : null}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

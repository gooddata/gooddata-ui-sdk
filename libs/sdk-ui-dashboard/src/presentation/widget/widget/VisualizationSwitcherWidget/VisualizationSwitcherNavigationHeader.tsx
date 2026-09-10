// (C) 2020-2026 GoodData Corporation

import { type RefObject, forwardRef, useCallback, useMemo } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";

import { type IInsightWidget, type IVisualizationSwitcherWidget } from "@gooddata/sdk-model";
import {
    Dropdown,
    type IDropdownButtonRenderProps,
    type IUiListboxInteractiveItem,
    type IUiListboxItem,
    UiIcon,
    UiListbox,
} from "@gooddata/sdk-ui-kit";

import { useDashboardSelector } from "../../../../model/react/DashboardStoreProvider.js";
import { useDashboardUserInteraction } from "../../../../model/react/useDashboardUserInteraction.js";
import { selectRestrictedInsightsMap } from "../../../../model/store/unavailableObjects/unavailableObjectsSelectors.js";
import { type CommonExportDataAttributes } from "../../../export/types.js";
import { DashboardItemHeadline } from "../../../presentationComponents/DashboardItems/DashboardItemHeadline.js";

interface IVisualizationSwitcherNavigationHeaderProps {
    clientWidth: number | undefined;
    clientHeight: number | undefined;
    activeVisualization: IInsightWidget;
    widget: IVisualizationSwitcherWidget;
    onActiveVisualizationChange: (visualizationId: string) => void;
    exportData?: CommonExportDataAttributes;
    titleId: string;
}

const alignPoints = [
    {
        align: "bc tc",
        offset: { x: 0, y: -9 },
    },
    {
        align: "tc bc",
        offset: { x: 0, y: 9 },
    },
];

export function VisualizationSwitcherNavigationHeader({
    widget,
    clientWidth,
    clientHeight,
    activeVisualization,
    onActiveVisualizationChange,
    exportData,
    titleId,
}: IVisualizationSwitcherNavigationHeaderProps) {
    const userInteraction = useDashboardUserInteraction();

    const intl = useIntl();
    const restrictedInsights = useDashboardSelector(selectRestrictedInsightsMap);
    const restrictedEntryTitle = intl.formatMessage({ id: "visualizationSwitcher.restrictedEntry" });

    const items = useMemo<IUiListboxItem<IInsightWidget>[]>(() => {
        return widget.visualizations.map((visualization) => {
            // a stored entry title names the visualization, so a restricted entry must never show it
            const isRestricted = restrictedInsights.has(visualization.insight);
            return {
                type: "interactive",
                id: visualization.identifier,
                stringTitle: isRestricted ? restrictedEntryTitle : visualization.title,
                icon: isRestricted ? ("lock" as const) : undefined,
                data: visualization,
            };
        });
    }, [widget.visualizations, restrictedInsights, restrictedEntryTitle]);

    const handleSelectVisualization = useCallback(
        (item: IUiListboxInteractiveItem<IInsightWidget>) => {
            onActiveVisualizationChange(item.id);
            userInteraction.visualizationSwitcherInteraction("visualizationSwitcherSwitched");
        },
        [onActiveVisualizationChange, userInteraction],
    );

    return (
        <Dropdown
            alignPoints={alignPoints}
            accessibilityConfig={{ popupRole: "listbox" }}
            autofocusOnOpen
            renderBody={({ closeDropdown, ariaAttributes }) => (
                <UiListbox
                    items={items}
                    selectedItemId={activeVisualization.identifier}
                    onSelect={handleSelectVisualization}
                    onClose={closeDropdown}
                    ariaAttributes={ariaAttributes}
                    maxWidth={clientWidth ?? 200}
                    dataTestId="s-visualization-switcher-widget-list"
                    itemDataTestId="s-visualization-switcher-widget-list-item"
                />
            )}
            renderButton={({ toggleDropdown, isOpen, ariaAttributes, buttonRef }) => (
                <VisualizationSwitcherNavigationHeaderButton
                    isRestricted={restrictedInsights.has(activeVisualization.insight)}
                    title={
                        restrictedInsights.has(activeVisualization.insight)
                            ? restrictedEntryTitle
                            : activeVisualization.title
                    }
                    isOpen={isOpen}
                    toggleDropdown={toggleDropdown}
                    clientHeight={clientHeight}
                    exportData={exportData}
                    ariaAttributes={ariaAttributes}
                    titleId={titleId}
                    ref={buttonRef}
                />
            )}
        />
    );
}

type VisualizationSwitcherNavigationHeaderButtonProps = {
    title: string;
    isRestricted: boolean;
    isOpen: boolean;
    toggleDropdown: (desiredState?: unknown) => void;
    clientHeight?: number;
    exportData?: CommonExportDataAttributes;
    ariaAttributes: IDropdownButtonRenderProps["ariaAttributes"];
    titleId: string;
};

const VisualizationSwitcherNavigationHeaderButton = forwardRef<
    HTMLElement,
    VisualizationSwitcherNavigationHeaderButtonProps
>(function VisualizationSwitcherNavigationHeaderButton(
    { isOpen, toggleDropdown, title, isRestricted, clientHeight, ariaAttributes, exportData, titleId },
    ref,
) {
    const classNames = cx("gd-visualization-switcher-widget-header s-visualization-switcher-widget-header", {
        "is-open": isOpen,
    });
    return (
        <div
            ref={ref as RefObject<HTMLDivElement>}
            className={classNames}
            onClick={toggleDropdown}
            tabIndex={0}
            {...exportData}
            {...ariaAttributes}
        >
            <div className="gd-visualization-switcher-widget-header-title">
                {isRestricted ? <UiIcon type="lock" size={14} color="complementary-7" /> : null}
                <DashboardItemHeadline clientHeight={clientHeight} title={title} titleId={titleId} />
            </div>
        </div>
    );
});

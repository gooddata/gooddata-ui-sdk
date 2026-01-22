// (C) 2020-2026 GoodData Corporation

import { type RefObject, forwardRef, useCallback, useMemo } from "react";

import cx from "classnames";

import { type IInsightWidget, type IVisualizationSwitcherWidget } from "@gooddata/sdk-model";
import {
    Dropdown,
    type IDropdownButtonRenderProps,
    type IUiListboxInteractiveItem,
    type IUiListboxItem,
    UiListbox,
} from "@gooddata/sdk-ui-kit";

import { useDashboardUserInteraction } from "../../../../model/react/useDashboardUserInteraction.js";
import { type CommonExportDataAttributes } from "../../../export/types.js";
import { DashboardItemHeadline } from "../../../presentationComponents/DashboardItems/DashboardItemHeadline.js";

interface IVisualizationSwitcherNavigationHeaderProps {
    clientWidth: number | undefined;
    clientHeight: number | undefined;
    activeVisualization: IInsightWidget;
    widget: IVisualizationSwitcherWidget;
    onActiveVisualizationChange: (visualizationId: string) => void;
    exportData?: CommonExportDataAttributes;
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
}: IVisualizationSwitcherNavigationHeaderProps) {
    const userInteraction = useDashboardUserInteraction();

    const items = useMemo<IUiListboxItem<IInsightWidget>[]>(() => {
        return widget.visualizations.map((visualization) => ({
            type: "interactive",
            id: visualization.identifier,
            stringTitle: visualization.title,
            data: visualization,
        }));
    }, [widget.visualizations]);

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
                    title={activeVisualization.title}
                    isOpen={isOpen}
                    toggleDropdown={toggleDropdown}
                    clientHeight={clientHeight}
                    exportData={exportData}
                    ariaAttributes={ariaAttributes}
                    ref={buttonRef}
                />
            )}
        />
    );
}

type VisualizationSwitcherNavigationHeaderButtonProps = {
    title: string;
    isOpen: boolean;
    toggleDropdown: (desiredState?: unknown) => void;
    clientHeight?: number;
    exportData?: CommonExportDataAttributes;
    ariaAttributes: IDropdownButtonRenderProps["ariaAttributes"];
};

const VisualizationSwitcherNavigationHeaderButton = forwardRef<
    HTMLElement,
    VisualizationSwitcherNavigationHeaderButtonProps
>(function VisualizationSwitcherNavigationHeaderButton(
    { isOpen, toggleDropdown, title, clientHeight, ariaAttributes, exportData },
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
            <DashboardItemHeadline clientHeight={clientHeight} title={title} />
        </div>
    );
});

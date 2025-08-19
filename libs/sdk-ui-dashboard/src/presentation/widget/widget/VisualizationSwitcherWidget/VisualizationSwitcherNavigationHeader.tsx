// (C) 2020-2025 GoodData Corporation
import React from "react";

import cx from "classnames";

import { IInsightWidget, IVisualizationSwitcherWidget } from "@gooddata/sdk-model";
import {
    Dropdown,
    IDropdownButtonRenderProps,
    IUiListboxInteractiveItem,
    IUiListboxItem,
    UiListbox,
} from "@gooddata/sdk-ui-kit";

import { useDashboardUserInteraction } from "../../../../model/index.js";
import { CommonExportDataAttributes } from "../../../export/index.js";
import { DashboardItemHeadline } from "../../../presentationComponents/index.js";

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

export const VisualizationSwitcherNavigationHeader: React.FC<IVisualizationSwitcherNavigationHeaderProps> = ({
    widget,
    clientWidth,
    clientHeight,
    activeVisualization,
    onActiveVisualizationChange,
    exportData,
}) => {
    const userInteraction = useDashboardUserInteraction();

    const items = React.useMemo<IUiListboxItem<IInsightWidget>[]>(() => {
        return widget.visualizations.map((visualization) => ({
            type: "interactive",
            id: visualization.identifier,
            stringTitle: visualization.title,
            data: visualization,
        }));
    }, [widget.visualizations]);

    const handleSelectVisualization = React.useCallback(
        (item: IUiListboxInteractiveItem<IInsightWidget>) => {
            onActiveVisualizationChange(item.id);
            userInteraction.visualizationSwitcherInteraction("visualizationSwitcherSwitched");
        },
        [onActiveVisualizationChange, userInteraction],
    );

    return (
        <Dropdown
            alignPoints={alignPoints}
            autofocusOnOpen={true}
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
};

type VisualizationSwitcherNavigationHeaderButtonProps = {
    title: string;
    isOpen: boolean;
    toggleDropdown: (desiredState?: boolean | unknown) => void;
    clientHeight?: number;
    exportData?: CommonExportDataAttributes;
    ariaAttributes: IDropdownButtonRenderProps["ariaAttributes"];
};

const VisualizationSwitcherNavigationHeaderButton = React.forwardRef<
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
            ref={ref as React.RefObject<HTMLDivElement>}
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

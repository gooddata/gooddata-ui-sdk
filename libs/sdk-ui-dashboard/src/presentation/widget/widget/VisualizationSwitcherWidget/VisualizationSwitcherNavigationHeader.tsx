// (C) 2020-2024 GoodData Corporation
import React, { useCallback } from "react";
import { IInsightWidget, IVisualizationSwitcherWidget, objRefToString, widgetRef } from "@gooddata/sdk-model";

import { DashboardItemHeadline } from "../../../presentationComponents/index.js";

import { ItemsWrapper, Overlay, ShortenedText } from "@gooddata/sdk-ui-kit";
import cx from "classnames";
import { stringUtils } from "@gooddata/util";
import { useDashboardUserInteraction } from "../../../../model/index.js";

interface IVisualizationSwitcherNavigationHeaderProps {
    clientWidth: number | undefined;
    clientHeight: number | undefined;
    activeVisualization: IInsightWidget;
    widget: IVisualizationSwitcherWidget;
    onActiveVisualizationChange: (visualizationId: string) => void;
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
}) => {
    const userInteraction = useDashboardUserInteraction();

    const [isOpen, setIsOpen] = React.useState(false);

    const widgetRefAsString = objRefToString(widgetRef(widget));

    const alignTo = `gd-visualization-switcher-widget-header-${stringUtils.simplifyText(widgetRefAsString)}`;

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const onSelect = useCallback(
        (item: IInsightWidget) => {
            onActiveVisualizationChange(item.identifier);
            setIsOpen(false);
        },
        [onActiveVisualizationChange],
    );

    return (
        <>
            <VisualizationSwitcherNavigationHeaderButton
                className={alignTo}
                title={activeVisualization.title}
                isOpen={isOpen}
                toggleDropdown={toggleDropdown}
                clientHeight={clientHeight}
            />

            {isOpen ? (
                <Overlay
                    key="VisualizationSwitcherNavigationHeader"
                    alignTo={`.${alignTo}`}
                    alignPoints={alignPoints}
                    className="s-visualization-switcher-widget-header"
                    closeOnMouseDrag={true}
                    closeOnOutsideClick={true}
                    closeOnParentScroll={true}
                    onClose={toggleDropdown}
                >
                    <ItemsWrapper className="gd-visualization-switcher-widget-header-list">
                        <div className="gd-visualization-switcher-widget-header-list-container">
                            {widget.visualizations.map((visualization) => {
                                return (
                                    <VisualizationSwitcherNavigationHeaderItem
                                        key={visualization.identifier}
                                        onSelect={(item) => {
                                            onSelect(item);
                                            userInteraction.visualizationSwitcherInteraction(
                                                "visualizationSwitcherChanged",
                                            );
                                        }}
                                        item={visualization}
                                        isSelected={
                                            visualization.identifier === activeVisualization.identifier
                                        }
                                        maxWidth={clientWidth ?? 200}
                                    />
                                );
                            })}
                        </div>
                    </ItemsWrapper>
                </Overlay>
            ) : null}
        </>
    );
};

type VisualizationSwitcherNavigationHeaderButtonProps = {
    title: string;
    isOpen: boolean;
    toggleDropdown: () => void;
    className: string;
    clientHeight?: number;
};

const VisualizationSwitcherNavigationHeaderButton: React.FC<
    VisualizationSwitcherNavigationHeaderButtonProps
> = ({ isOpen, toggleDropdown, title, className, clientHeight }) => {
    const classNames = cx("gd-visualization-switcher-widget-header", className, {
        "is-open": isOpen,
    });
    return (
        <div className={classNames} onClick={toggleDropdown}>
            <DashboardItemHeadline clientHeight={clientHeight} title={title} />
        </div>
    );
};

type VisualizationSwitcherNavigationHeaderItemProps = {
    item: IInsightWidget;
    isSelected: boolean;
    maxWidth: number;
    onSelect: (item: IInsightWidget) => void;
};

const VisualizationSwitcherNavigationHeaderItem: React.FC<VisualizationSwitcherNavigationHeaderItemProps> = ({
    item,
    isSelected,
    onSelect,
    maxWidth,
}) => {
    const classNames = cx("gd-visualization-switcher-widget-header-item", "gd-list-item", {
        "is-selected": isSelected,
    });
    return (
        <div
            className={classNames}
            onClick={() => {
                onSelect(item);
            }}
        >
            <div className="gd-visualization-switcher-widget-header-item-content" style={{ maxWidth }}>
                <ShortenedText className="title">{item.title}</ShortenedText>
            </div>
        </div>
    );
};

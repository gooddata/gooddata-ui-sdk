// (C) 2024-2025 GoodData Corporation

import React, { useCallback } from "react";

import cx from "classnames";
import { FormattedMessage } from "react-intl";

import { IInsightWidget } from "@gooddata/sdk-model";
import { Bubble, BubbleHoverTrigger, GD_COLOR_HIGHLIGHT, IAlignPoint, Icon } from "@gooddata/sdk-ui-kit";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";

import { useDashboardUserInteraction } from "../../../../model/index.js";

const bubbleAlignPoints: IAlignPoint[] = [{ align: "tc bc", offset: { x: 0, y: -8 } }];
interface IToolbarTopProps {
    visualizations: IInsightWidget[];
    activeVisualizationId: string | undefined;
    onNavigate: (widgetId: string) => void;
    onDelete: () => void;
    toggleVisualizationsList: () => void;
    visualizationsListShown: boolean;
}
export function ToolbarTop({
    visualizations,
    onNavigate,
    activeVisualizationId: activeWidgetId,
    onDelete,
    toggleVisualizationsList,
    visualizationsListShown,
}: IToolbarTopProps) {
    const theme = useTheme();
    const userInteraction = useDashboardUserInteraction();
    const activeWidgetIndex = visualizations.findIndex((vis) => vis.identifier === activeWidgetId);

    const prevDisabled = activeWidgetIndex <= 0;
    const nextDisabled = activeWidgetIndex === -1 || activeWidgetIndex >= visualizations.length - 1;

    const iconColor = visualizationsListShown
        ? (theme?.palette?.primary?.base ?? GD_COLOR_HIGHLIGHT)
        : (theme?.palette?.complementary?.c7 ?? "#6D7680");

    const enabledColor = theme?.palette?.complementary?.c7 ?? "#6D7680";
    const disabledColor = theme?.palette?.complementary?.c5 ?? "#B0BECA";

    const prevColor = prevDisabled ? disabledColor : enabledColor;
    const nextColor = nextDisabled ? disabledColor : enabledColor;

    const onNavigatePrev = useCallback(() => {
        if (prevDisabled) {
            return;
        }
        const prevIndex = activeWidgetIndex - 1;
        const prevWidgetId = visualizations[prevIndex].identifier;
        onNavigate(prevWidgetId);
    }, [activeWidgetIndex, visualizations, onNavigate, prevDisabled]);

    const onNavigateNext = useCallback(() => {
        if (nextDisabled) {
            return;
        }
        const nextIndex = activeWidgetIndex + 1;
        const nextWidgetId = visualizations[nextIndex].identifier;
        onNavigate(nextWidgetId);
    }, [activeWidgetIndex, visualizations, onNavigate, nextDisabled]);

    const leftSectionClassName = cx("left-section", visualizationsListShown ? "is-active" : null);

    const navigatePrevClassName = cx("navigate-button", "navigate-prev", prevDisabled ? "is-disabled" : null);

    const navigateNextClassName = cx("navigate-button", "navigate-next", nextDisabled ? "is-disabled" : null);

    return (
        <div className="gd-visualization-switcher-toolbar-top bubble bubble-light">
            <div className={leftSectionClassName} onClick={toggleVisualizationsList}>
                <BubbleHoverTrigger eventsOnBubble={true}>
                    <Icon.VisualizationSwitcher color={iconColor} width={20} height={20} />
                    <Bubble alignPoints={bubbleAlignPoints}>
                        <FormattedMessage id="visualizationSwitcherToolbar.visualizationsList.tooltip" />
                    </Bubble>
                </BubbleHoverTrigger>
            </div>
            <div className="vertical-divider" />
            <div className="middle-section">
                <div className={navigatePrevClassName} onClick={onNavigatePrev}>
                    <BubbleHoverTrigger eventsOnBubble={true}>
                        <Icon.ArrowLeft color={prevColor} />
                        <Bubble alignPoints={bubbleAlignPoints}>
                            <FormattedMessage id="visualizationSwitcherToolbar.visualizationsList.prev" />
                        </Bubble>
                    </BubbleHoverTrigger>
                </div>
                <div className="status">
                    {activeWidgetIndex + 1}/{visualizations.length}
                </div>
                <div className={navigateNextClassName} onClick={onNavigateNext}>
                    <BubbleHoverTrigger eventsOnBubble={true}>
                        <Icon.ArrowRight color={nextColor} />
                        <Bubble alignPoints={bubbleAlignPoints}>
                            <FormattedMessage id="visualizationSwitcherToolbar.visualizationsList.next" />
                        </Bubble>
                    </BubbleHoverTrigger>
                </div>
            </div>
            <div className="vertical-divider" />
            <div className="right-section">
                <div
                    className="s-visualization-switcher-remove-button"
                    onClick={() => {
                        onDelete();
                        userInteraction.visualizationSwitcherInteraction("visualizationSwitcherRemoved");
                    }}
                >
                    <BubbleHoverTrigger eventsOnBubble={true}>
                        <Icon.Trash className="gd-trash-icon" width={20} />
                        <Bubble alignPoints={bubbleAlignPoints}>
                            <FormattedMessage id="visualizationSwitcherToolbar.remove" />
                        </Bubble>
                    </BubbleHoverTrigger>
                </div>
            </div>
        </div>
    );
}

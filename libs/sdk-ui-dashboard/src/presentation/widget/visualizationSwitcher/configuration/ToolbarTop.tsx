// (C) 2024 GoodData Corporation

import { Button, GD_COLOR_HIGHLIGHT, Icon } from "@gooddata/sdk-ui-kit";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";
import React, { useCallback } from "react";
import { IInsightWidget } from "@gooddata/sdk-model";
import { gdColorStateBlank } from "../../../constants/colors.js";

interface IToolbarTopProps {
    visualizations: IInsightWidget[];
    activeVisualizationId: string | undefined;
    onNavigate: (widgetId: string) => void;
    onDelete: () => void;
    toggleVisualizationsList: () => void;
    visualizationsListShown: boolean;
}
export const ToolbarTop: React.FC<IToolbarTopProps> = ({
    visualizations,
    onNavigate,
    activeVisualizationId: activeWidgetId,
    onDelete,
    toggleVisualizationsList,
    visualizationsListShown,
}) => {
    const theme = useTheme();
    const activeWidgetIndex = visualizations.findIndex((vis) => vis.identifier === activeWidgetId);

    const prevDisabled = activeWidgetIndex <= 0;
    const nextDisabled = activeWidgetIndex === -1 || activeWidgetIndex >= visualizations.length - 1;

    const iconColor = visualizationsListShown
        ? theme?.palette?.primary?.base ?? GD_COLOR_HIGHLIGHT
        : theme?.palette?.complementary?.c6 ?? gdColorStateBlank;

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

    return (
        <div className="gd-visualization-switcher-toolbar-top bubble-light">
            <div className="left-section" onClick={toggleVisualizationsList}>
                <Icon.VisualizationSwitcher color={iconColor} width={20} height={20} />
            </div>
            <div className="vertical-divider" />
            <div className="middle-section">
                <div className="navigate-button navigate-prev" onClick={onNavigatePrev}>
                    <Icon.ArrowLeft color={prevColor} />
                </div>
                <div className="status">
                    {activeWidgetIndex + 1}/{visualizations.length}
                </div>
                <div className="navigate-button navigate-next" onClick={onNavigateNext}>
                    <Icon.ArrowRight color={nextColor} />
                </div>
            </div>
            <div className="vertical-divider" />
            <div className="right-section">
                <Button
                    className="gd-button-link gd-button-icon-only gd-icon-trash s-visualization-switcher-remove-button"
                    onClick={onDelete}
                />
            </div>
        </div>
    );
};

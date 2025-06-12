// (C) 2024 GoodData Corporation

import { ArrowOffsets, Bubble } from "@gooddata/sdk-ui-kit";
import React, { useCallback, useState } from "react";
import cx from "classnames";
import { v4 as uuid } from "uuid";
import { IVisualizationSizeInfo } from "@gooddata/sdk-ui-ext";

import {
    IInsight,
    IInsightWidget,
    IVisualizationSwitcherWidget,
    idRef,
    insightRef,
    insightTitle,
} from "@gooddata/sdk-model";

import {
    selectSettings,
    useDashboardSelector,
    useDashboardUserInteraction,
    selectEnableFlexibleLayout,
} from "../../../../model/index.js";
import {
    defaultAlignPoints,
    defaultArrowDirections,
} from "../../common/configuration/ConfigurationBubble.js";
import { getSizeInfo } from "../../../../_staging/layout/sizing.js";
import { ToolbarTop } from "./ToolbarTop.js";
import { ToolbarBottom } from "./ToolbarBottom.js";

const defaultFluidArrowOffsets: ArrowOffsets = {
    "tr tl": [7, 18],
    "br bl": [7, -18],
    "tl tr": [-7, 18],
    "tr tr": [-76, 18],
    "br br": [-76, -18],
};

const defaultFlexibleArrowOffsets: ArrowOffsets = {
    "tr tl": [7, 8],
    "br bl": [7, -8],
    "tl tr": [-7, 8],
    "tr tr": [-76, 8],
    "br br": [-76, -8],
};

interface ToolbarProps {
    widget: IVisualizationSwitcherWidget;
    onVisualizationsChanged: (visualizations: IInsightWidget[]) => void;
    onVisualizationAdded: (
        insightWidget: IInsightWidget,
        insight: IInsight,
        sizeInfo: IVisualizationSizeInfo,
    ) => void;
    onWidgetDelete: () => void;
    onSelectedVisualizationChanged?: (visualizationId: string) => void;
    onClose: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
    widget,
    onVisualizationsChanged,
    onVisualizationAdded,
    onWidgetDelete,
    onSelectedVisualizationChanged,
    onClose,
}) => {
    const userInteraction = useDashboardUserInteraction();

    const visualizations = widget.visualizations;

    const [isVisualizationsListVisible, setVisualizationsListVisible] = useState(true);

    const [activeVisualizationId, setActiveVisualizationId] = useState(visualizations[0]?.identifier);
    const settings = useDashboardSelector(selectSettings);

    const isFlexibleLayoutEnabled = useDashboardSelector(selectEnableFlexibleLayout);
    const arrowOffsets = isFlexibleLayoutEnabled ? defaultFlexibleArrowOffsets : defaultFluidArrowOffsets;

    const onVisualizationAdd = useCallback(
        (insight: IInsight) => {
            const sizeInfo = getSizeInfo(settings, "insight", insight);
            const identifier = uuid();

            const newWidget: IInsightWidget = {
                type: "insight",
                insight: insightRef(insight),
                ignoreDashboardFilters: [],
                drills: [],
                title: insightTitle(insight),
                description: "",
                identifier,
                localIdentifier: identifier,
                uri: "",
                ref: idRef(identifier),
            };
            onVisualizationAdded(newWidget, insight, sizeInfo);
            setActiveVisualizationId(identifier);
            onSelectedVisualizationChanged?.(identifier);
        },
        [onVisualizationAdded, settings, onSelectedVisualizationChanged],
    );

    const onVisualizationDelete = useCallback(
        (widgetId: string) => {
            const removedVisualizationIndex = visualizations.findIndex(
                (visualization) => visualization.identifier === widgetId,
            );
            const pruneVisualizations = visualizations.filter(
                (visualization) => visualization.identifier !== widgetId,
            );
            const nextVisualizationIndex = Math.min(
                removedVisualizationIndex,
                pruneVisualizations.length - 1,
            );
            const nextVisualizationId = pruneVisualizations[nextVisualizationIndex]?.identifier;
            onVisualizationsChanged(pruneVisualizations);

            setActiveVisualizationId(nextVisualizationId);
            onSelectedVisualizationChanged?.(nextVisualizationId);
        },
        [onVisualizationsChanged, visualizations, onSelectedVisualizationChanged],
    );

    const onVisualizationPositionChanged = useCallback(
        (widgetId: string, direction: string) => {
            const updatedVisualizations = [...visualizations];
            const changedVisualizationIndex = visualizations.findIndex(
                (visualization) => visualization.identifier === widgetId,
            );

            const element = updatedVisualizations[changedVisualizationIndex];
            updatedVisualizations.splice(changedVisualizationIndex, 1);

            if (direction === "moveUp") {
                updatedVisualizations.splice(changedVisualizationIndex - 1, 0, element);
            } else {
                updatedVisualizations.splice(changedVisualizationIndex + 1, 0, element);
            }

            onVisualizationsChanged(updatedVisualizations);
            userInteraction.visualizationSwitcherInteraction("visualizationSwitcherOrderChanged");
        },
        [onVisualizationsChanged, visualizations],
    );

    const showVisualizationsList = () => {
        setVisualizationsListVisible(true);
    };

    const onNavigate = useCallback(
        (identifier: string) => {
            setActiveVisualizationId(identifier);
            onSelectedVisualizationChanged?.(identifier);
        },
        [onSelectedVisualizationChanged],
    );

    const onVisualizationSelect = useCallback(
        (identifier: string) => {
            setActiveVisualizationId(identifier);
            onSelectedVisualizationChanged?.(identifier);
            setVisualizationsListVisible(false);
            userInteraction.visualizationSwitcherInteraction(
                "visualizationSwitcherVisualizationDetailOpened",
            );
        },
        [onSelectedVisualizationChanged],
    );

    const activeVisualization = visualizations.find(
        (visualization) => visualization.identifier === activeVisualizationId,
    );

    const shouldShowVisualizationsList = isVisualizationsListVisible || !activeVisualization;
    const alignTo = ".s-dash-item.is-selected";
    const ignoreClicksOnByClass = [alignTo]; // do not close on click to the widget
    const configBubbleClassNames = cx(
        "gd-visualization-switcher-configuration-bubble",
        "edit-insight-config",
        "s-edit-insight-config",
        "edit-insight-config-title-1-line",
        "edit-insight-config-arrow-color",
    );

    return (
        <Bubble
            className={cx(
                "gd-configuration-bubble s-gd-visualization-switcher-toolbar-bubble",
                configBubbleClassNames,
            )}
            overlayClassName="gd-configuration-bubble-wrapper sdk-edit-mode-on gd-visualization-switcher-toolbar-bubble-wrapper"
            alignTo={alignTo}
            alignPoints={defaultAlignPoints}
            arrowOffsets={arrowOffsets}
            arrowDirections={defaultArrowDirections}
            closeOnOutsideClick
            closeOnParentScroll={false}
            ignoreClicksOnByClass={ignoreClicksOnByClass}
            arrowStyle={{ display: "none" }}
            onClose={onClose}
        >
            <ToolbarTop
                visualizations={visualizations}
                onNavigate={onNavigate}
                activeVisualizationId={activeVisualizationId}
                onDelete={onWidgetDelete}
                toggleVisualizationsList={showVisualizationsList}
                visualizationsListShown={shouldShowVisualizationsList}
            />
            <ToolbarBottom
                visualizations={visualizations}
                activeVisualizationId={activeVisualizationId}
                showVisualizationsList={shouldShowVisualizationsList}
                onVisualizationAdd={onVisualizationAdd}
                onVisualizationDelete={onVisualizationDelete}
                onVisualizationSelect={onVisualizationSelect}
                onVisualizationPositionChange={onVisualizationPositionChanged}
            />
        </Bubble>
    );
};

// (C) 2024-2025 GoodData Corporation

import { type IInsight, type IInsightWidget, type ObjRef } from "@gooddata/sdk-model";
import { type IVisualizationSizeInfo } from "@gooddata/sdk-ui-ext";

import { type IDashboardCommand } from "./base.js";

/**
 * Payload of the {@link AddVisualizationToVisualizationSwitcherWidgetContent} command.
 * @beta
 */
export interface AddVisualizationToVisualizationSwitcherWidgetContentPayload {
    /**
     * Visualization switcher widget reference whose content to change.
     */
    readonly ref: ObjRef;
    /**
     * Visualization to add onto switcher widget.
     */
    readonly visualization: IInsightWidget;

    /**
     * Insight that is added.
     */
    readonly insight: IInsight;

    /**
     * Size info of the added visualizaiton.
     */
    readonly sizeInfo: IVisualizationSizeInfo;
}

/**
 * @beta
 */
export interface AddVisualizationToVisualizationSwitcherWidgetContent extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.VISUALIZATION_SWITCHER_WIDGET.ADD_VISUALIZATION";
    readonly payload: AddVisualizationToVisualizationSwitcherWidgetContentPayload;
}

/**
 * Creates the AddVisualizationToSwitcherWidgetContent command. Dispatching this command will result in addition of visualization to switcher widget.
 *
 * @param ref - reference of the visualization switcher widget to modify
 * @param visualization - visualization to add
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @beta
 */
export function addVisualizationToSwitcherWidgetContent(
    ref: ObjRef,
    visualization: IInsightWidget,
    insight: IInsight,
    sizeInfo: IVisualizationSizeInfo,
    correlationId?: string,
): AddVisualizationToVisualizationSwitcherWidgetContent {
    return {
        type: "GDC.DASH/CMD.VISUALIZATION_SWITCHER_WIDGET.ADD_VISUALIZATION",
        correlationId,
        payload: {
            ref,
            visualization,
            insight,
            sizeInfo,
        },
    };
}

/**
 * Payload of the {@link UpdateVisualizationsFromVisualizationSwitcherWidgetContent} command.
 * @beta
 */
export interface UpdateVisualizationsFromVisualizationSwitcherWidgetontentPayload {
    /**
     * Visualization switcher widget reference whose content to change.
     */
    readonly ref: ObjRef;

    /**
     * Visualization to update from switcher widget.
     */
    readonly visualizations: IInsightWidget[];
}

/**
 * @beta
 */
export interface UpdateVisualizationsFromVisualizationSwitcherWidgetContent extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.VISUALIZATION_SWITCHER_WIDGET.UPDATE_VISUALIZATIONS";
    readonly payload: UpdateVisualizationsFromVisualizationSwitcherWidgetontentPayload;
}

/**
 * Creates the ChangeVisualizationsFromVisualizationSwitcherWidgetContent command. Dispatching this command will result in the update of visualization
 * which form part of the visualization switcher widget.
 *
 * @param ref - reference of the visualization switcher widget to modify
 * @param visualizations - changed visualizations to remove
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @beta
 */
export function updateVisualizationsFromSwitcherWidgetContent(
    ref: ObjRef,
    visualizations: IInsightWidget[],
    correlationId?: string,
): UpdateVisualizationsFromVisualizationSwitcherWidgetContent {
    return {
        type: "GDC.DASH/CMD.VISUALIZATION_SWITCHER_WIDGET.UPDATE_VISUALIZATIONS",
        correlationId,
        payload: {
            ref,
            visualizations,
        },
    };
}

// (C) 2024-2026 GoodData Corporation

import { type IInsight, type IInsightWidget, type ObjRef } from "@gooddata/sdk-model";
import { type IVisualizationSizeInfo } from "@gooddata/sdk-ui-ext";

import { type IDashboardCommand } from "./base.js";

/**
 * Payload of the {@link IAddVisualizationToVisualizationSwitcherWidgetContent} command.
 * @beta
 */
export interface IAddVisualizationToVisualizationSwitcherWidgetContentPayload {
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
     * Size info of the added visualization.
     */
    readonly sizeInfo: IVisualizationSizeInfo;
}

/**
 * @beta
 */
export interface IAddVisualizationToVisualizationSwitcherWidgetContent extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.VISUALIZATION_SWITCHER_WIDGET.ADD_VISUALIZATION";
    readonly payload: IAddVisualizationToVisualizationSwitcherWidgetContentPayload;
}

/**
 * Creates the AddVisualizationToSwitcherWidgetContent command. Dispatching this command will result in addition of visualization to switcher widget.
 *
 * @param ref - reference of the visualization switcher widget to modify
 * @param visualization - visualization to add
 * @param insight -
 * @param sizeInfo -
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
): IAddVisualizationToVisualizationSwitcherWidgetContent {
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
 * Payload of the {@link IUpdateVisualizationsFromVisualizationSwitcherWidgetContent} command.
 * @beta
 */
export interface IUpdateVisualizationsFromVisualizationSwitcherWidgetContentPayload {
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
export interface IUpdateVisualizationsFromVisualizationSwitcherWidgetContent extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.VISUALIZATION_SWITCHER_WIDGET.UPDATE_VISUALIZATIONS";
    readonly payload: IUpdateVisualizationsFromVisualizationSwitcherWidgetContentPayload;
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
): IUpdateVisualizationsFromVisualizationSwitcherWidgetContent {
    return {
        type: "GDC.DASH/CMD.VISUALIZATION_SWITCHER_WIDGET.UPDATE_VISUALIZATIONS",
        correlationId,
        payload: {
            ref,
            visualizations,
        },
    };
}

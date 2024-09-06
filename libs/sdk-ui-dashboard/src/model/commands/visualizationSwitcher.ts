// (C) 2024 GoodData Corporation

import { IDashboardCommand } from "./base.js";
import { IInsightWidget, ObjRef } from "@gooddata/sdk-model";

/**
 * Payload of the {@link AddVisualizationToVisualizationSwitcherWidgetContent} command.
 * @beta
 */
export interface AddVisualizationToVisualizationSwitcherWidgetontentPayload {
    /**
     * Visualization switcher widget reference whose content to change.
     */
    readonly ref: ObjRef;

    /**
     * Visualization to add onto switcher widget.
     */
    readonly visualization: IInsightWidget;
}

/**
 * @beta
 */
export interface AddVisualizationToVisualizationSwitcherWidgetContent extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.VISUALIZATION_SWITCHER_WIDGET.ADD_VISUALIZATION";
    readonly payload: AddVisualizationToVisualizationSwitcherWidgetontentPayload;
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
    correlationId?: string,
): AddVisualizationToVisualizationSwitcherWidgetContent {
    return {
        type: "GDC.DASH/CMD.VISUALIZATION_SWITCHER_WIDGET.ADD_VISUALIZATION",
        correlationId,
        payload: {
            ref,
            visualization,
        },
    };
}

/**
 * Payload of the {@link RemoveVisualizationFromVisualizationSwitcherWidgetContent} command.
 * @beta
 */
export interface RemoveVisualizationFromVisualizationSwitcherWidgetontentPayload {
    /**
     * Visualization switcher widget reference whose content to change.
     */
    readonly ref: ObjRef;

    /**
     * Visualization to remove from switcher widget.
     */
    readonly visualization: IInsightWidget;
}

/**
 * @beta
 */
export interface RemoveVisualizationFromVisualizationSwitcherWidgetContent extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.VISUALIZATION_SWITCHER_WIDGET.REMOVE_VISUALIZATION";
    readonly payload: RemoveVisualizationFromVisualizationSwitcherWidgetontentPayload;
}

/**
 * Creates the AddVisualizationToSwitcherWidgetContent command. Dispatching this command will result in addition of visualization to switcher widget.
 *
 * @param ref - reference of the visualization switcher widget to modify
 * @param visualization - visualization to remove
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @beta
 */
export function removeVisualizationFromSwitcherWidgetContent(
    ref: ObjRef,
    visualization: IInsightWidget,
    correlationId?: string,
): RemoveVisualizationFromVisualizationSwitcherWidgetContent {
    return {
        type: "GDC.DASH/CMD.VISUALIZATION_SWITCHER_WIDGET.REMOVE_VISUALIZATION",
        correlationId,
        payload: {
            ref,
            visualization,
        },
    };
}

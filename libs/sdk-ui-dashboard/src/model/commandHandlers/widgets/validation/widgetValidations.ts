// (C) 2021-2025 GoodData Corporation

import {
    type IInsightWidget,
    type IKpiWidget,
    type IRichTextWidget,
    type IVisualizationSwitcherWidget,
    type ObjRef,
    isInsightWidget,
    isKpiWidget,
    isRichTextWidget,
    isVisualizationSwitcherWidget,
    serializeObjRef,
} from "@gooddata/sdk-model";

import { type ObjRefMap } from "../../../../_staging/metadata/objRefMap.js";
import { type IDashboardCommand } from "../../../commands/index.js";
import { invalidArgumentsProvided } from "../../../events/general.js";
import { type DashboardContext } from "../../../types/commonTypes.js";
import { type ExtendedDashboardWidget } from "../../../types/layoutTypes.js";

type CommandWithRef = IDashboardCommand & {
    payload: {
        ref: ObjRef;
    };
};

/**
 * Given list of all dashboard widgets and a command that contains a ref, this function tests that the `ref` is
 * a reference to an existing dashboard widget and that the existing widget is an rich text widget.
 *
 * If the validation succeeds, the located rich text widget will be returned. Otherwise an error will fly. The error
 * will be an instance of DashboardCommandFailed event - it can be propagated through the command handler all the
 * way to the root command handler saga.
 *
 * @param ctx - dashboard context, this will be included in the DashboardCommandFailed event
 * @param widgets - map of widgets on the dashboard
 * @param cmd - any command that has 'ref' in its payload
 */
export function validateExistingRichTextWidget(
    widgets: ObjRefMap<ExtendedDashboardWidget>,
    cmd: CommandWithRef,
    ctx: DashboardContext,
): IRichTextWidget {
    const {
        payload: { ref },
    } = cmd;
    const widget = widgets.get(ref);

    if (!widget) {
        throw invalidArgumentsProvided(
            ctx,
            cmd,
            `Cannot find rich text widget with ref: ${serializeObjRef(ref)}.`,
        );
    }

    if (!isRichTextWidget(widget)) {
        throw invalidArgumentsProvided(
            ctx,
            cmd,
            `Widget with ref: ${serializeObjRef(ref)} exists but is not an rich text widget.`,
        );
    }

    return widget;
}

/**
 * Given list of all dashboard widgets and a command that contains a ref, this function tests that the `ref` is
 * a reference to an existing dashboard widget and that the existing widget is an insight widget.
 *
 * If the validation succeeds, the located insight widget will be returned. Otherwise an error will fly. The error
 * will be an instance of DashboardCommandFailed event - it can be propagated through the command handler all the
 * way to the root command handler saga.
 *
 * @param ctx - dashboard context, this will be included in the DashboardCommandFailed event
 * @param widgets - map of widgets on the dashboard
 * @param cmd - any command that has 'ref' in its payload
 */
export function validateExistingInsightWidget(
    widgets: ObjRefMap<ExtendedDashboardWidget>,
    cmd: CommandWithRef,
    ctx: DashboardContext,
): IInsightWidget {
    const {
        payload: { ref },
    } = cmd;
    const widget = widgets.get(ref);

    if (!widget) {
        throw invalidArgumentsProvided(
            ctx,
            cmd,
            `Cannot find insight widget with ref: ${serializeObjRef(ref)}.`,
        );
    }

    if (!isInsightWidget(widget)) {
        throw invalidArgumentsProvided(
            ctx,
            cmd,
            `Widget with ref: ${serializeObjRef(ref)} exists but is not an insight widget.`,
        );
    }

    return widget;
}

/**
 * Given list of all dashboard widgets and a command that contains a ref, this function tests that the `ref` is
 * a reference to an existing dashboard widget and that the existing widget is a KPI widget.
 *
 * If the validation succeeds, the located KPI widget will be returned. Otherwise an error will fly. The error
 * will be an instance of DashboardCommandFailed event - it can be propagated through the command handler all the
 * way to the root command handler saga.
 *
 * @param ctx - dashboard context, this will be included in the DashboardCommandFailed event
 * @param widgets - map of widgets on the dashboard
 * @param cmd - any command that has 'ref' in its payload
 */
export function validateExistingKpiWidget(
    widgets: ObjRefMap<ExtendedDashboardWidget>,
    cmd: CommandWithRef,
    ctx: DashboardContext,
): IKpiWidget {
    const {
        payload: { ref },
    } = cmd;
    const widget = widgets.get(ref);

    if (!widget) {
        throw invalidArgumentsProvided(
            ctx,
            cmd,
            `Cannot find insight widget with ref: ${serializeObjRef(ref)}.`,
        );
    }

    if (!isKpiWidget(widget)) {
        throw invalidArgumentsProvided(
            ctx,
            cmd,
            `Widget with ref: ${serializeObjRef(ref)} exists but is not a KPI widget.`,
        );
    }

    return widget;
}
/**
 * Given list of all dashboard widgets and a command that contains a ref, this function tests that the `ref` is
 * a reference to an existing dashboard widget and that the existing widget is an visualization switcher widget.
 *
 * If the validation succeeds, the located visualization switcher widget will be returned. Otherwise an error will fly. The error
 * will be an instance of DashboardCommandFailed event - it can be propagated through the command handler all the
 * way to the root command handler saga.
 *
 * @param widgets - map of widgets on the dashboard
 * @param ctx - dashboard context, this will be included in the DashboardCommandFailed event
 * @param cmd - any command that has 'ref' in its payload
 */
export function validateExistingVisualizationSwitcherWidget(
    widgets: ObjRefMap<ExtendedDashboardWidget>,
    cmd: CommandWithRef,
    ctx: DashboardContext,
): IVisualizationSwitcherWidget {
    const {
        payload: { ref },
    } = cmd;
    const widget = widgets.get(ref);

    if (!widget) {
        throw invalidArgumentsProvided(
            ctx,
            cmd,
            `Cannot find visualization switcher widget with ref: ${serializeObjRef(ref)}.`,
        );
    }

    if (!isVisualizationSwitcherWidget(widget)) {
        throw invalidArgumentsProvided(
            ctx,
            cmd,
            `Widget with ref: ${serializeObjRef(ref)} exists but is not a visualization switcher widget.`,
        );
    }

    return widget;
}

// (C) 2022-2025 GoodData Corporation

import { SagaIterator } from "redux-saga";
import { SagaReturnType, all, call, put } from "redux-saga/effects";

import {
    DrillDefinition,
    IInsightWidget,
    IKpiWidget,
    IRichTextWidget,
    IVisualizationSwitcherWidget,
    InsightDrillDefinition,
    isInsightWidget,
    widgetRef,
} from "@gooddata/sdk-model";

import { IDashboardCommand } from "../../commands/index.js";
import { insightWidgetDrillsRemoved } from "../../events/insight.js";
import { layoutActions } from "../../store/layout/index.js";
import { uiActions } from "../../store/ui/index.js";
import { DashboardContext } from "../../types/commonTypes.js";
import { existsDrillDefinitionInArray } from "../widgets/validation/insightDrillDefinitionUtils.js";
import {
    getValidationData,
    validateDrillDefinition,
} from "../widgets/validation/insightDrillDefinitionValidation.js";

interface IInvalidDrillInfo {
    invalidDrills: DrillDefinition[];
    widget: IInsightWidget;
}

export function* validateDrills(
    ctx: DashboardContext,
    cmd: IDashboardCommand,
    widgets: (IKpiWidget | IInsightWidget | IRichTextWidget | IVisualizationSwitcherWidget)[],
) {
    const possibleInvalidDrills: SagaReturnType<typeof validateInsightDrillDefinitions>[] = yield all(
        widgets
            .filter(isInsightWidget) // KPI drills should not be validated like this and never removed
            .map((widget) => call(validateInsightDrillDefinitions, ctx, cmd, widget)),
    );

    const invalidDrills = possibleInvalidDrills.filter(({ invalidDrills }) => invalidDrills.length > 0);

    if (invalidDrills.length === 0) {
        yield put(uiActions.removeInvalidDrillWidgetRefs(widgets.map(widgetRef)));
    } else {
        yield all(
            invalidDrills.map((drillInfo) =>
                call(removeInsightWidgetDrills, ctx, cmd, drillInfo.widget, drillInfo.invalidDrills),
            ),
        );

        yield put(uiActions.addInvalidDrillWidgetRefs(invalidDrills.map((drill) => drill.widget.ref)));
    }
}

function* removeInsightWidgetDrills(
    ctx: DashboardContext,
    cmd: IDashboardCommand,
    widget: IInsightWidget,
    invalidDrills: DrillDefinition[],
) {
    const notModifiedDrillDefinition = widget.drills.filter(
        (drillItem) => !existsDrillDefinitionInArray(drillItem, invalidDrills as InsightDrillDefinition[]),
    );

    yield put(
        layoutActions.replaceWidgetDrillWithoutUndo({
            ref: widgetRef(widget),
            drillDefinitions: notModifiedDrillDefinition,
        }),
    );

    yield put(insightWidgetDrillsRemoved(ctx, widgetRef(widget), invalidDrills, cmd.correlationId));
}

function* validateInsightDrillDefinitions(
    ctx: DashboardContext,
    cmd: IDashboardCommand,
    widget: IInsightWidget,
): SagaIterator<IInvalidDrillInfo> {
    const validationData: SagaReturnType<typeof getValidationData> = yield call(
        getValidationData,
        widgetRef(widget),
        widget.drills,
        ctx,
    );

    if (!validationData.drillTargets) {
        return {
            invalidDrills: [],
            widget,
        };
    }

    const invalidDrills = widget.drills.flatMap((drillItem) => {
        try {
            validateDrillDefinition(drillItem, validationData, ctx, cmd);
            return [];
        } catch {
            return [drillItem];
        }
    });

    return { invalidDrills, widget };
}

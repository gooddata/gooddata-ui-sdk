// (C) 2022-2026 GoodData Corporation

import { isEqual } from "lodash-es";
import { type SagaIterator } from "redux-saga";
import { type SagaReturnType, all, call, put } from "redux-saga/effects";

import {
    type DrillDefinition,
    type IInsightWidget,
    type IKpiWidget,
    type IRichTextWidget,
    type IVisualizationSwitcherWidget,
    type InsightDrillDefinition,
    isInsightWidget,
    widgetRef,
} from "@gooddata/sdk-model";

import { type IDashboardCommand } from "../../commands/base.js";
import { insightWidgetDrillsRemoved } from "../../events/insight.js";
import { tabsActions } from "../../store/tabs/index.js";
import { uiActions } from "../../store/ui/index.js";
import { type DashboardContext } from "../../types/commonTypes.js";
import { wasDrillFilterConfigurationSanitized } from "../widgets/validation/insightDrillDefinitionUtils.js";
import {
    getValidationData,
    validateDrillDefinition,
} from "../widgets/validation/insightDrillDefinitionValidation.js";

interface IInvalidDrillInfo {
    invalidDrills: DrillDefinition[];
    hasSanitizedDrillFilterConfig: boolean;
    sanitizedDrills: InsightDrillDefinition[];
    widget: IInsightWidget;
}

export function* validateDrills(
    ctx: DashboardContext,
    cmd: IDashboardCommand,
    widgets: (IKpiWidget | IInsightWidget | IRichTextWidget | IVisualizationSwitcherWidget)[],
) {
    const drillValidationResults: SagaReturnType<typeof validateInsightDrillDefinitions>[] = yield all(
        widgets
            .filter(isInsightWidget) // KPI drills should not be validated like this and never removed
            .map((widget) => call(validateInsightDrillDefinitions, ctx, cmd, widget)),
    );

    const widgetsToSanitize = drillValidationResults.filter(({ sanitizedDrills, widget }) => {
        return !isEqual(widget.drills, sanitizedDrills);
    });
    const widgetsWithInvalidDrills = drillValidationResults.filter(
        ({ invalidDrills }) => invalidDrills.length > 0,
    );
    const widgetsWithoutInvalidDrills = drillValidationResults.filter(
        ({ invalidDrills }) => invalidDrills.length === 0,
    );
    const widgetsWithSanitizedDrillFilterConfig = drillValidationResults.filter(
        ({ hasSanitizedDrillFilterConfig }) => hasSanitizedDrillFilterConfig,
    );
    const widgetsWithoutSanitizedDrillFilterConfig = drillValidationResults.filter(
        ({ hasSanitizedDrillFilterConfig }) => !hasSanitizedDrillFilterConfig,
    );

    if (widgetsToSanitize.length > 0) {
        yield all(
            widgetsToSanitize.map((drillInfo) =>
                call(applyInsightWidgetDrillsValidation, ctx, cmd, drillInfo),
            ),
        );
    }

    if (widgetsWithoutInvalidDrills.length > 0) {
        yield put(
            uiActions.removeInvalidDrillWidgetRefs(
                widgetsWithoutInvalidDrills.map((drill) => drill.widget.ref),
            ),
        );
    }

    if (widgetsWithInvalidDrills.length > 0) {
        yield put(
            uiActions.addInvalidDrillWidgetRefs(widgetsWithInvalidDrills.map((drill) => drill.widget.ref)),
        );
    }

    if (widgetsWithoutSanitizedDrillFilterConfig.length > 0) {
        yield put(
            uiActions.removeSanitizedDrillWidgetRefs(
                widgetsWithoutSanitizedDrillFilterConfig.map((drill) => drill.widget.ref),
            ),
        );
    }

    if (widgetsWithSanitizedDrillFilterConfig.length > 0) {
        yield put(
            uiActions.addSanitizedDrillWidgetRefs(
                widgetsWithSanitizedDrillFilterConfig.map((drill) => drill.widget.ref),
            ),
        );
    }
}

function* applyInsightWidgetDrillsValidation(
    ctx: DashboardContext,
    cmd: IDashboardCommand,
    validationResult: IInvalidDrillInfo,
) {
    const { widget, invalidDrills, sanitizedDrills } = validationResult;

    yield put(
        tabsActions.replaceWidgetDrillWithoutUndo({
            ref: widgetRef(widget),
            drillDefinitions: sanitizedDrills,
        }),
    );

    if (invalidDrills.length > 0) {
        yield put(insightWidgetDrillsRemoved(ctx, widgetRef(widget), invalidDrills, cmd.correlationId));
    }
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
            hasSanitizedDrillFilterConfig: false,
            sanitizedDrills: widget.drills,
            widget,
        };
    }

    const invalidDrills: DrillDefinition[] = [];
    let hasSanitizedDrillFilterConfig = false;
    const sanitizedDrills = widget.drills.flatMap((drillItem) => {
        try {
            const validatedDrillDefinition = validateDrillDefinition(drillItem, validationData, ctx, cmd);
            hasSanitizedDrillFilterConfig =
                hasSanitizedDrillFilterConfig ||
                wasDrillFilterConfigurationSanitized(drillItem, validatedDrillDefinition);

            return [validatedDrillDefinition];
        } catch {
            invalidDrills.push(drillItem);
            return [];
        }
    });

    return { invalidDrills, hasSanitizedDrillFilterConfig, sanitizedDrills, widget };
}

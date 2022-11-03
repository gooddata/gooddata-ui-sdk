// (C) 2022 GoodData Corporation
import {
    DrillDefinition,
    IInsightWidget,
    IKpiWidget,
    InsightDrillDefinition,
    isInsightWidget,
    IWidget,
    widgetRef,
} from "@gooddata/sdk-model";
import { SagaIterator } from "redux-saga";
import { all, call, put, SagaReturnType, select } from "redux-saga/effects";
import { v4 as uuid } from "uuid";
import { ChangeRenderMode } from "../../commands";
import { insightWidgetDrillsRemoved } from "../../events/insight";
import { kpiWidgetDrillRemoved } from "../../events/kpi";
import { selectAllAnalyticalWidgets, uiActions } from "../../store";
import { layoutActions } from "../../store/layout";
import { DashboardContext } from "../../types/commonTypes";
import { existsDrillDefinitionInArray } from "../widgets/validation/insightDrillDefinitionUtils";
import {
    getValidationData,
    validateDrillDefinition,
} from "../widgets/validation/insightDrillDefinitionValidation";
import { validateKpiDrill } from "../widgets/validation/kpiDrillValidation";

interface IInvalidDrillInfo {
    invalidDrills: DrillDefinition[];
    widget: IWidget;
}

export function* validateDrills(ctx: DashboardContext, cmd: ChangeRenderMode) {
    const widgets: ReturnType<typeof selectAllAnalyticalWidgets> = yield select(selectAllAnalyticalWidgets);
    const widgetsWithDrills = widgets.filter((widget) => widget.drills.length > 0);
    if (!widgetsWithDrills.length) {
        return;
    }

    const invalidDrills: IInvalidDrillInfo[] = [];

    for (const widget of widgetsWithDrills) {
        const validationResult: SagaReturnType<typeof validateWidgetDrills> = yield call(
            validateWidgetDrills,
            ctx,
            cmd,
            widget,
        );

        if (validationResult.invalidDrills.length) {
            invalidDrills.push(validationResult);
        }
    }

    if (invalidDrills.length === 0) {
        return;
    }

    yield all(
        invalidDrills.map((drillInfo) =>
            isInsightWidget(drillInfo.widget)
                ? call(removeInsightWidgetDrills, ctx, drillInfo.widget, drillInfo.invalidDrills)
                : call(removeKpiWidgetDrill, ctx, drillInfo.widget),
        ),
    );

    yield put(
        uiActions.addToastMessage({
            id: uuid(),
            type: "warning",
            titleId: "messages.dashboard.invalidDrills.title",
            detailId: "messages.dashboard.invalidDrills.body",
            detailValues: { listOfWidgetTitles: invalidDrills.map((d) => d.widget.title).join(", ") },
            showMoreId: "messages.dashboard.expandable.showMore",
            showLessId: "messages.dashboard.expandable.showLess",
        }),
    );
}

function* removeInsightWidgetDrills(
    ctx: DashboardContext,
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

    yield put(insightWidgetDrillsRemoved(ctx, widgetRef(widget), invalidDrills));
}

function* removeKpiWidgetDrill(ctx: DashboardContext, widget: IKpiWidget) {
    yield put(
        layoutActions.replaceKpiWidgetDrillWithoutUndo({
            ref: widgetRef(widget),
            drill: undefined,
        }),
    );

    yield put(kpiWidgetDrillRemoved(ctx, widgetRef(widget)));
}

function* validateWidgetDrills(
    ctx: DashboardContext,
    cmd: ChangeRenderMode,
    widget: IWidget,
): SagaIterator<IInvalidDrillInfo> {
    if (isInsightWidget(widget)) {
        const result: SagaReturnType<typeof validateInsightDrillDefinitions> = yield call(
            validateInsightDrillDefinitions,
            ctx,
            cmd,
            widget,
        );
        return result;
    } else {
        const result: SagaReturnType<typeof validateKpiDrillDefinitions> = yield call(
            validateKpiDrillDefinitions,
            ctx,
            cmd,
            widget,
        );
        return result;
    }
}

function* validateInsightDrillDefinitions(
    ctx: DashboardContext,
    cmd: ChangeRenderMode,
    widget: IInsightWidget,
): SagaIterator<IInvalidDrillInfo> {
    const validationData: SagaReturnType<typeof getValidationData> = yield call(
        getValidationData,
        widgetRef(widget),
        widget.drills,
        ctx,
    );

    const invalidDrills: DrillDefinition[] = [];

    for (const drillItem of widget.drills) {
        try {
            validateDrillDefinition(drillItem, validationData, ctx, cmd);
        } catch {
            invalidDrills.push(drillItem);
        }
    }

    return { invalidDrills, widget };
}

function* validateKpiDrillDefinitions(
    ctx: DashboardContext,
    cmd: ChangeRenderMode,
    widget: IKpiWidget,
): SagaIterator<IInvalidDrillInfo> {
    try {
        yield call(validateKpiDrill, widget.drills[0], ctx, cmd);
        return { widget, invalidDrills: [] };
    } catch {
        return { widget, invalidDrills: widget.drills };
    }
}

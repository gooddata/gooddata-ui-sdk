// (C) 2021-2023 GoodData Corporation

import { SagaIterator } from "redux-saga";
import { call, SagaReturnType, select } from "redux-saga/effects";
import { invalidArgumentsProvided } from "../../../events/general.js";
import { DashboardContext } from "../../../types/commonTypes.js";
import {
    extractDisplayFormIdentifiers,
    extractInsightRefs,
    InsightDrillDefinitionValidationData,
    validateDrillDefinitionOrigin,
    validateInsightDrillDefinition,
} from "./insightDrillDefinitionUtils.js";
import { IDrillTargets } from "../../../store/drillTargets/drillTargetsTypes.js";
import { ObjRefMap } from "../../../../_staging/metadata/objRefMap.js";
import { ObjRef, InsightDrillDefinition, IListedDashboard } from "@gooddata/sdk-model";
import { IDashboardCommand } from "../../../commands/index.js";
import { InsightResolutionResult, resolveInsights } from "../../../utils/insightResolver.js";
import {
    DisplayFormResolutionResult,
    resolveDisplayFormMetadata,
} from "../../../utils/displayFormResolver.js";
import { selectDrillTargetsByWidgetRef } from "../../../store/drillTargets/drillTargetsSelectors.js";
import { selectAccessibleDashboardsMap } from "../../../store/accessibleDashboards/accessibleDashboardsSelectors.js";
import { selectInaccessibleDashboardsMap } from "../../../store/inaccessibleDashboards/inaccessibleDashboardsSelectors.js";
import { IInaccessibleDashboard } from "../../../types/inaccessibleDashboardTypes.js";

export function validateDrillDefinition(
    drillDefinition: InsightDrillDefinition,
    validationData: DrillDefinitionValidationData,
    ctx: DashboardContext,
    cmd: IDashboardCommand,
): InsightDrillDefinition {
    let item = drillDefinition;
    // validate drill targets
    if (!validationData.drillTargets?.availableDrillTargets) {
        throw invalidArgumentsProvided(ctx, cmd, `Drill targets not set`);
    }

    // validate drills origin
    try {
        item = validateDrillDefinitionOrigin(item, validationData.drillTargets.availableDrillTargets);
    } catch (ex) {
        const messageDetail = (ex as Error).message;

        throw invalidArgumentsProvided(
            ctx,
            cmd,
            `Invalid drill origin for InsightDrillDefinition. Error: ${messageDetail}`,
        );
    }

    // validate drill
    const validationContext: InsightDrillDefinitionValidationData = {
        dashboardsMap: validationData.accessibleDashboardMap,
        insightsMap: validationData.resolvedInsights.resolved,
        displayFormsMap: validationData.resolvedDisplayForms.resolved,
        availableDrillTargets: validationData.drillTargets.availableDrillTargets!,
        inaccessibleDashboardsMap: validationData.inaccessibleDashboardsMap,
    };

    try {
        item = validateInsightDrillDefinition(item, validationContext);
    } catch (ex) {
        const messageDetail = (ex as Error).message;
        throw invalidArgumentsProvided(ctx, cmd, `Invalid InsightDrillDefinition. Error: ${messageDetail}`);
    }

    return item;
}

export interface DrillDefinitionValidationData {
    drillTargets: IDrillTargets | undefined;
    resolvedInsights: InsightResolutionResult;
    resolvedDisplayForms: DisplayFormResolutionResult;
    accessibleDashboardMap: ObjRefMap<IListedDashboard>;
    inaccessibleDashboardsMap: ObjRefMap<IInaccessibleDashboard>;
}

export function* getValidationData(
    widgetRef: ObjRef,
    drillsToModify: InsightDrillDefinition[],
    ctx: DashboardContext,
): SagaIterator<DrillDefinitionValidationData> {
    const selectDrillTargetsByWidgetRefSelector = selectDrillTargetsByWidgetRef(widgetRef);
    const drillTargets: ReturnType<typeof selectDrillTargetsByWidgetRefSelector> = yield select(
        selectDrillTargetsByWidgetRefSelector,
    );

    const accessibleDashboardMap: ReturnType<typeof selectAccessibleDashboardsMap> = yield select(
        selectAccessibleDashboardsMap,
    );
    const inaccessibleDashboardsMap: ReturnType<typeof selectInaccessibleDashboardsMap> = yield select(
        selectInaccessibleDashboardsMap,
    );

    const insightRefs = extractInsightRefs(drillsToModify);
    const resolvedInsights: SagaReturnType<typeof resolveInsights> = yield call(
        resolveInsights,
        ctx,
        insightRefs,
    );

    const displayFormIds = extractDisplayFormIdentifiers(drillsToModify);
    const resolvedDisplayForms: SagaReturnType<typeof resolveDisplayFormMetadata> = yield call(
        resolveDisplayFormMetadata,
        ctx,
        displayFormIds,
    );

    return {
        drillTargets,
        accessibleDashboardMap,
        resolvedInsights,
        resolvedDisplayForms,
        inaccessibleDashboardsMap,
    };
}

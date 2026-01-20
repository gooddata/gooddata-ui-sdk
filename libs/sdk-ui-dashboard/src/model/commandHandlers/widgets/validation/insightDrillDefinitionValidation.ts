// (C) 2021-2026 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { type SagaReturnType, call, select } from "redux-saga/effects";

import {
    type IAttribute,
    type IDashboardTab,
    type IListedDashboard,
    type InsightDrillDefinition,
    type ObjRef,
    bucketsAttributes,
    insightBuckets,
} from "@gooddata/sdk-model";

import {
    type IInsightDrillDefinitionValidationData,
    extractDisplayFormIdentifiers,
    extractInsightRefs,
    validateDrillDefinitionOrigin,
    validateInsightDrillDefinition,
} from "./insightDrillDefinitionUtils.js";
import { type ObjRefMap } from "../../../../_staging/metadata/objRefMap.js";
import { type IDashboardCommand } from "../../../commands/index.js";
import { invalidArgumentsProvided } from "../../../events/general.js";
import { selectAccessibleDashboardsMap } from "../../../store/accessibleDashboards/accessibleDashboardsSelectors.js";
import { selectDrillTargetsByWidgetRef } from "../../../store/drillTargets/drillTargetsSelectors.js";
import { type IDrillTargets } from "../../../store/drillTargets/drillTargetsTypes.js";
import { selectInaccessibleDashboardsMap } from "../../../store/inaccessibleDashboards/inaccessibleDashboardsSelectors.js";
import { selectInsightByWidgetRef } from "../../../store/insights/insightsSelectors.js";
import { selectDashboardRef } from "../../../store/meta/metaSelectors.js";
import { selectTabs } from "../../../store/tabs/tabsSelectors.js";
import { type DashboardContext } from "../../../types/commonTypes.js";
import { type IInaccessibleDashboard } from "../../../types/inaccessibleDashboardTypes.js";
import {
    type DisplayFormResolutionResult,
    resolveDisplayFormMetadata,
} from "../../../utils/displayFormResolver.js";
import { type IInsightResolutionResult, resolveInsights } from "../../../utils/insightResolver.js";

export function validateDrillDefinition(
    drillDefinition: InsightDrillDefinition,
    validationData: IDrillDefinitionValidationData,
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
    const validationContext: IInsightDrillDefinitionValidationData = {
        widgetInsightAttributes: validationData.widgetInsightAttributes,
        dashboardsMap: validationData.accessibleDashboardMap,
        insightsMap: validationData.resolvedInsights.resolved,
        displayFormsMap: validationData.resolvedDisplayForms.resolved,
        availableDrillTargets: validationData.drillTargets.availableDrillTargets,
        inaccessibleDashboardsMap: validationData.inaccessibleDashboardsMap,
        currentDashboardRef: validationData.currentDashboardRef,
        currentDashboardTabs: validationData.currentDashboardTabs,
    };

    try {
        item = validateInsightDrillDefinition(item, validationContext);
    } catch (ex) {
        const messageDetail = (ex as Error).message;
        throw invalidArgumentsProvided(ctx, cmd, `Invalid InsightDrillDefinition. Error: ${messageDetail}`);
    }

    return item;
}

export interface IDrillDefinitionValidationData {
    widgetInsightAttributes: IAttribute[];
    drillTargets: IDrillTargets | undefined;
    resolvedInsights: IInsightResolutionResult;
    resolvedDisplayForms: DisplayFormResolutionResult;
    accessibleDashboardMap: ObjRefMap<IListedDashboard>;
    inaccessibleDashboardsMap: ObjRefMap<IInaccessibleDashboard>;
    currentDashboardRef: ObjRef | undefined;
    currentDashboardTabs: IDashboardTab[] | undefined;
}

export function* getValidationData(
    widgetRef: ObjRef,
    drillsToModify: InsightDrillDefinition[],
    ctx: DashboardContext,
): SagaIterator<IDrillDefinitionValidationData> {
    const widgetInsight: ReturnType<ReturnType<typeof selectInsightByWidgetRef>> = yield select(
        selectInsightByWidgetRef(widgetRef),
    );
    const widgetInsightAttributes = widgetInsight ? bucketsAttributes(insightBuckets(widgetInsight)) : [];

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

    const currentDashboardRef: ReturnType<typeof selectDashboardRef> = yield select(selectDashboardRef);
    const tabs: ReturnType<typeof selectTabs> = yield select(selectTabs);
    // Convert TabState to minimal IDashboardTab structure needed for validation
    const currentDashboardTabs: IDashboardTab[] | undefined = tabs?.map((tab) => ({
        localIdentifier: tab.localIdentifier,
        title: tab.title ?? "",
    }));

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
        widgetInsightAttributes,
        drillTargets,
        accessibleDashboardMap,
        resolvedInsights,
        resolvedDisplayForms,
        inaccessibleDashboardsMap,
        currentDashboardRef,
        currentDashboardTabs,
    };
}

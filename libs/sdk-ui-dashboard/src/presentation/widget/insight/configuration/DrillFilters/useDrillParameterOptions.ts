// (C) 2026 GoodData Corporation

import { useMemo } from "react";

import { useIntl } from "react-intl";

import {
    type IInsight,
    areObjRefsEqual,
    insightRef,
    objRefToString,
    serializeObjRef,
} from "@gooddata/sdk-model";

import { useDashboardSelector } from "../../../../../model/react/DashboardStoreProvider.js";
import { selectCatalogRequestedParameterRoots } from "../../../../../model/store/catalog/catalogSelectors.js";
import { selectDashboardRef } from "../../../../../model/store/meta/metaSelectors.js";
import {
    collectAppliedParameterEntriesForRoots,
    hasAppliedParameterValue,
    resolveParameterTitle,
} from "../../../../../model/store/tabs/parameters/parametersHelpers.js";
import {
    selectDashboardParametersByTab,
    selectWidgetParameterContext,
} from "../../../../../model/store/tabs/parameters/parametersSelectors.js";
import {
    DRILL_TARGET_TYPE,
    type IDrillConfigItem,
    isDrillToDashboardConfig,
} from "../../../../drill/types.js";

import { messages } from "./messages.js";
import { type IDrillFiltersConfigOption } from "./types.js";

interface IUseDrillParameterOptionsResult {
    options: IDrillFiltersConfigOption[];
    isLoading: boolean;
}

/**
 * @internal
 */
export function useDrillParameterOptions(
    item: IDrillConfigItem,
    executedInsight: IInsight | undefined,
): IUseDrillParameterOptionsResult {
    const intl = useIntl();
    const parameterContext = useDashboardSelector(selectWidgetParameterContext(item.widgetRef));
    const requestedRoots = useDashboardSelector(selectCatalogRequestedParameterRoots);
    const sourceDashboardRef = useDashboardSelector(selectDashboardRef);
    const parametersByTab = useDashboardSelector(selectDashboardParametersByTab);
    const isDrillToDashboard = item.drillTargetType === DRILL_TARGET_TYPE.DRILL_TO_DASHBOARD;
    // The target tab ignores a value of a parameter that it does not define.
    const targetTabParameters =
        isDrillToDashboardConfig(item) &&
        item.dashboardTab &&
        areObjRefsEqual(item.dashboard, sourceDashboardRef)
            ? parametersByTab[item.dashboardTab]
            : undefined;
    const message = intl.formatMessage(messages.drillParameterTooltip);

    const options = useMemo(() => {
        const result: IDrillFiltersConfigOption[] = [];
        if (!parameterContext) {
            return result;
        }
        const sentEntries = isDrillToDashboard
            ? parameterContext.entries.filter(hasAppliedParameterValue)
            : executedInsight
              ? collectAppliedParameterEntriesForRoots(parameterContext, [insightRef(executedInsight)])
              : [];
        for (const entry of sentEntries) {
            const isDefinedOnTarget =
                !targetTabParameters ||
                targetTabParameters.some((parameter) => areObjRefsEqual(parameter.ref, entry.parameter.ref));
            if (!isDefinedOnTarget) {
                continue;
            }
            result.push({
                id: `parameter:${entry.parameter.ref.identifier}`,
                title: resolveParameterTitle(
                    entry.parameter,
                    parameterContext.workspaceParameterByRef.get(objRefToString(entry.parameter.ref)),
                ),
                disabled: { message, selected: true },
            });
        }
        return result;
    }, [isDrillToDashboard, parameterContext, targetTabParameters, executedInsight, message]);

    const rootsCheckedForPending =
        isDrillToDashboard || !executedInsight
            ? []
            : [insightRef(executedInsight), ...(parameterContext?.filterRoots ?? [])];
    const isLoading = rootsCheckedForPending.some(
        (root) => requestedRoots[serializeObjRef(root)] === "pending",
    );

    return { options, isLoading };
}

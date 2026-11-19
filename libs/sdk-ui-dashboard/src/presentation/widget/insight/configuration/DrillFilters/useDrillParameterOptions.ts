// (C) 2026 GoodData Corporation

import { useMemo } from "react";

import { useIntl } from "react-intl";

import {
    type IDashboardParameter,
    type IInsight,
    areObjRefsEqual,
    insightRef,
    objRefToString,
    serializeObjRef,
} from "@gooddata/sdk-model";

import { useDashboardSelector } from "../../../../../model/react/DashboardStoreProvider.js";
import { selectCatalogRequestedParameterRoots } from "../../../../../model/store/catalog/catalogSelectors.js";
import {
    collectAppliedParameterEntriesForRoots,
    hasAppliedParameterValue,
    resolveParameterTitle,
} from "../../../../../model/store/tabs/parameters/parametersHelpers.js";
import { selectWidgetParameterContext } from "../../../../../model/store/tabs/parameters/parametersSelectors.js";
import { DRILL_TARGET_TYPE, type IDrillConfigItem } from "../../../../drill/types.js";

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
    targetDashboardParameters: IDashboardParameter[],
): IUseDrillParameterOptionsResult {
    const intl = useIntl();
    const parameterContext = useDashboardSelector(selectWidgetParameterContext(item.widgetRef));
    const requestedRoots = useDashboardSelector(selectCatalogRequestedParameterRoots);
    const isDrillToDashboard = item.drillTargetType === DRILL_TARGET_TYPE.DRILL_TO_DASHBOARD;
    const passedMessage = intl.formatMessage(messages.drillParameterTooltip);
    const notOnTargetMessage = intl.formatMessage(messages.drillToDashboardParameterNotOnTargetTooltip);

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
                !isDrillToDashboard ||
                targetDashboardParameters.some((parameter) =>
                    areObjRefsEqual(parameter.ref, entry.parameter.ref),
                );
            result.push({
                id: `parameter:${entry.parameter.ref.identifier}`,
                title: resolveParameterTitle(
                    entry.parameter,
                    parameterContext.workspaceParameterByRef.get(objRefToString(entry.parameter.ref)),
                ),
                disabled: isDefinedOnTarget
                    ? { message: passedMessage, selected: true }
                    : { message: notOnTargetMessage, selected: false },
            });
        }
        return result;
    }, [
        isDrillToDashboard,
        parameterContext,
        targetDashboardParameters,
        executedInsight,
        passedMessage,
        notOnTargetMessage,
    ]);

    const rootsCheckedForPending =
        isDrillToDashboard || !executedInsight
            ? []
            : [insightRef(executedInsight), ...(parameterContext?.filterRoots ?? [])];
    const isLoading = rootsCheckedForPending.some(
        (root) => requestedRoots[serializeObjRef(root)] === "pending",
    );

    return { options, isLoading };
}

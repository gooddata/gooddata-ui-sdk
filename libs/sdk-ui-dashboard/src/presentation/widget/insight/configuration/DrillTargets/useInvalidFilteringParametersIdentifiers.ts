// (C) 2020-2026 GoodData Corporation

import { useMemo } from "react";

import { uniq } from "lodash-es";

import {
    type IAttributeFilter,
    type IDashboardAttributeFilterConfig,
    type IDashboardMeasureValueFilter,
    type IMeasureValueFilter,
    areObjRefsEqual,
    filterObjRef,
} from "@gooddata/sdk-model";
import {
    getDashboardAttributeFilterPlaceholdersFromUrl,
    getDashboardMeasureValueFilterPlaceholdersFromUrl,
    getInsightAttributeFilterPlaceholdersFromUrl,
    getInsightMeasureValueFilterPlaceholdersFromUrl,
    placeholderIdentifierText,
} from "@gooddata/sdk-model/internal";

import { useDashboardSelector } from "../../../../../model/react/DashboardStoreProvider.js";
import {
    selectAllCatalogDisplayFormsMap,
    selectAllCatalogMeasuresMap,
} from "../../../../../model/store/catalog/catalogSelectors.js";
import {
    dashboardMeasureValueFilterMatchesIdentifier,
    insightMeasureValueFilterMatchesIdentifier,
} from "../../../../../model/utils/measureValueFilterUtils.js";
import { type UrlDrillTarget, isDrillToCustomUrlConfig } from "../../../../drill/types.js";

export function useInvalidFilteringParametersIdentifiers(
    urlDrillTarget: UrlDrillTarget | undefined,
    insightFilters: IAttributeFilter[] | undefined,
    dashboardFilters: IAttributeFilter[] | undefined,
    dashboardMeasureValueFilters: IDashboardMeasureValueFilter[] | undefined,
    insightMeasureValueFilters: IMeasureValueFilter[] | undefined,
    enableInsightMeasureValueFilters: boolean,
    attributeFilterConfigs: IDashboardAttributeFilterConfig[] | undefined,
) {
    const displayForms = useDashboardSelector(selectAllCatalogDisplayFormsMap);
    const measures = useDashboardSelector(selectAllCatalogMeasuresMap);

    return useMemo(() => {
        if (isDrillToCustomUrlConfig(urlDrillTarget)) {
            const dashboardAttributeFilterParameters = getDashboardAttributeFilterPlaceholdersFromUrl(
                urlDrillTarget.customUrl,
            );
            const insightAttributeFilterParameters = getInsightAttributeFilterPlaceholdersFromUrl(
                urlDrillTarget.customUrl,
            );
            const dashboardMeasureValueFilterParameters = getDashboardMeasureValueFilterPlaceholdersFromUrl(
                urlDrillTarget.customUrl,
            );
            const insightMeasureValueFilterParameters = getInsightMeasureValueFilterPlaceholdersFromUrl(
                urlDrillTarget.customUrl,
            );

            const invalidDashboardParameters = dashboardAttributeFilterParameters
                // The placeholder's own ref is used rather than a display-form one rebuilt from the
                // identifier: a computed attribute shares the shape of a display form but not its type,
                // and the filters are sanitized to that same typed ref.
                .filter(({ ref }) => {
                    // parameter is invalid if either it points to display form that no longer exists
                    const relevantDf = displayForms.get(ref);
                    if (!relevantDf) {
                        return true;
                    }

                    return (
                        !dashboardFilters?.some((filter) => {
                            return areObjRefsEqual(filterObjRef(filter), ref);
                        }) &&
                        !attributeFilterConfigs?.some((config) => {
                            return config.displayAsLabel && areObjRefsEqual(config.displayAsLabel, ref);
                        })
                    );
                })
                // named as it is written in the URL, so the warning quotes text the user can find there
                .map(({ ref }) => placeholderIdentifierText(ref));

            const invalidInsightParameters = insightAttributeFilterParameters
                .filter(({ ref }) => {
                    // parameter is invalid if either it points to display form that no longer exists
                    const relevantDf = displayForms.get(ref);
                    if (!relevantDf) {
                        return true;
                    }

                    return !insightFilters?.some((filter) => {
                        return areObjRefsEqual(filterObjRef(filter), ref);
                    });
                })
                // named as it is written in the URL, so the warning quotes text the user can find there
                .map(({ ref }) => placeholderIdentifierText(ref));

            const invalidDashboardMvfParameters = dashboardMeasureValueFilterParameters
                .filter(({ identifier }) => {
                    return !dashboardMeasureValueFilters?.some((filter) =>
                        dashboardMeasureValueFilterMatchesIdentifier(
                            filter.dashboardMeasureValueFilter.measure,
                            identifier,
                            measures,
                        ),
                    );
                })
                .map(({ identifier }) => identifier);

            const invalidInsightMvfParameters = enableInsightMeasureValueFilters
                ? insightMeasureValueFilterParameters
                      .filter(({ identifier }) => {
                          return !insightMeasureValueFilters?.some((filter) =>
                              insightMeasureValueFilterMatchesIdentifier(
                                  filter.measureValueFilter.measure,
                                  identifier,
                              ),
                          );
                      })
                      .map(({ identifier }) => identifier)
                : insightMeasureValueFilterParameters.map(({ identifier }) => identifier);

            return uniq([
                ...invalidDashboardParameters,
                ...invalidInsightParameters,
                ...invalidDashboardMvfParameters,
                ...invalidInsightMvfParameters,
            ]);
        }
        return [];
    }, [
        displayForms,
        measures,
        urlDrillTarget,
        insightFilters,
        dashboardFilters,
        dashboardMeasureValueFilters,
        insightMeasureValueFilters,
        enableInsightMeasureValueFilters,
        attributeFilterConfigs,
    ]);
}

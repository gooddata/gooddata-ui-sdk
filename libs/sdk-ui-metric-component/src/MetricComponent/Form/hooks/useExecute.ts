// (C) 2021-2026 GoodData Corporation

import { type DependencyList, useMemo } from "react";

import { useIntl } from "react-intl";

import { type ICatalogAttribute, type IMeasure, newRankingFilter } from "@gooddata/sdk-model";
import { type AttributesOrPlaceholders, type NullableFiltersOrPlaceholders } from "@gooddata/sdk-ui";

import { type IMeasureDef } from "../../metric/metricHelpers.js";
import { transformToMetricDefinition } from "../../metric/transformer.js";
import { createAttribute } from "../attribute.js";
import { createInlineMeasure } from "../inlineMeasure.js";

export function useExecute(
    measure?: IMeasureDef | null,
    {
        attributes,
        limit,
        ranking,
    }: {
        attributes?: Array<ICatalogAttribute>;
        limit?: 10 | 100 | 1000 | 10000;
        ranking?: "top" | "bottom";
    } = {},
    deps?: DependencyList,
): {
    measures: IMeasure[];
    rows: AttributesOrPlaceholders;
    filters: NullableFiltersOrPlaceholders;
} | null {
    const intl = useIntl();
    const metric = measure ? transformToMetricDefinition(measure) : null;

    return useMemo(() => {
        const inline =
            metric &&
            createInlineMeasure(
                metric,
                intl.formatMessage({ id: "metricComponent.editMetricForm.namePlaceholder" }),
            );
        const filter =
            inline &&
            ranking &&
            newRankingFilter(
                inline.measure.localIdentifier,
                ranking === "bottom" ? "BOTTOM" : "TOP",
                limit || 10,
            );

        return inline
            ? {
                  measures: [inline],
                  filters: filter ? [filter] : [],
                  rows: (attributes || []).map(createAttribute),
              }
            : null;
        // oxlint-disable-next-line react-hooks/exhaustive-deps
    }, [...(deps || []), attributes, ranking, limit, intl]);
}

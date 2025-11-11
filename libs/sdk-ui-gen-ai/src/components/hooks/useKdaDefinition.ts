// (C) 2025 GoodData Corporation

import { useMemo } from "react";

import { useIntl } from "react-intl";

import {
    IAttribute,
    IDashboardAttributeFilter,
    IFilter,
    IMeasure,
    isAttributeFilter,
    isNegativeAttributeFilter,
    objRefToString,
} from "@gooddata/sdk-model";
import { IDrillEvent } from "@gooddata/sdk-ui";
import { DashboardKeyDriverCombinationItem, IKdaDefinition } from "@gooddata/sdk-ui-dashboard";
import { attributeFilterToDashboardAttributeFilter } from "@gooddata/sdk-ui-dashboard/internal";
import { DateFilterHelpers } from "@gooddata/sdk-ui-filters";

import { ChangeAnalysisContents } from "../../model.js";

export function useKdaDefinition(content: ChangeAnalysisContents, format?: string, locale?: string) {
    const intl = useIntl();

    const measure = content.params.measure;

    const def: IKdaDefinition = useMemo(() => {
        return createKdaDefinition(
            measure,
            content.params.dateAttribute,
            content.params.filters
                .map(getDashboardAttributeFilter)
                .filter(Boolean) as IDashboardAttributeFilter[],
            content.params.referencePeriod,
            content.params.analyzedPeriod,
            locale ?? intl.locale,
            format,
        );
    }, [
        content.params.analyzedPeriod,
        content.params.filters,
        content.params.referencePeriod,
        content.params.dateAttribute,
        format,
        intl.locale,
        locale,
        measure,
    ]);

    return def;
}

export function useKdaInfo(def: IKdaDefinition, splitter: string) {
    const title = def.metric.measure.title ?? def.metric.measure.alias ?? def.metric.measure.localIdentifier;

    const from = def.range[0];
    const to = def.range[1];
    const pattern = def.range[0].format?.pattern ?? "yyyy-MM-dd";

    const range = DateFilterHelpers.formatAbsoluteDateRange(
        new Date(from.date),
        new Date(to.date),
        pattern,
        splitter,
    );

    return {
        title,
        range,
    };
}

export function createKdaDefinition(
    measure: IMeasure,
    dateAttribute: IAttribute,
    filters: IDashboardAttributeFilter[],
    referencePeriod: string,
    analyzedPeriod: string,
    locale: string,
    format = "dd/MM/yyyy",
): IKdaDefinition {
    return {
        metric: {
            ...measure,
            measure: {
                ...measure.measure,
                title: measure.measure.title ?? measure.measure.alias ?? measure.measure.localIdentifier,
            },
        },
        metrics: [],
        dateAttribute: dateAttribute.attribute.displayForm,
        filters,
        type: "previous_period",
        range: [
            {
                date: referencePeriod,
                value: undefined,
                format: {
                    locale: locale,
                    pattern: format,
                },
            },
            {
                date: analyzedPeriod,
                value: undefined,
                format: {
                    locale: locale,
                    pattern: format,
                },
            },
        ],
    };
}

export function createKdaDefinitionFromDrill(
    locale: string,
    data: DashboardKeyDriverCombinationItem,
    event: IDrillEvent,
    filters?: IDashboardAttributeFilter[],
) {
    const from = data.range[0];
    const to = data.range[1];

    const measure = event.dataView.definition.measures.find((m) => {
        return data.measure.measureHeaderItem.localIdentifier === m.measure.localIdentifier;
    });
    const attr = from.descriptor.attributeHeader;

    if (!measure) {
        return;
    }

    return createKdaDefinition(
        measure,
        {
            attribute: {
                localIdentifier: attr.localIdentifier,
                displayForm: attr.formOf,
                alias: attr.name,
            },
        },
        filters ?? [],
        from.header.attributeHeaderItem.uri,
        to.header.attributeHeaderItem.uri,
        attr.format?.locale ?? locale,
        attr.format?.pattern,
    );
}

export function getDashboardAttributeFilter(f: IFilter) {
    if (isAttributeFilter(f)) {
        const ref = isNegativeAttributeFilter(f)
            ? f.negativeAttributeFilter.displayForm
            : f.positiveAttributeFilter.displayForm;
        const id = objRefToString(ref);
        return attributeFilterToDashboardAttributeFilter(f, `local_${id}`, undefined);
    }
    return null;
}

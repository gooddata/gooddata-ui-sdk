// (C) 2025-2026 GoodData Corporation

import { useMemo } from "react";

import { useIntl } from "react-intl";

import { type IChatKdaDefinition } from "@gooddata/sdk-backend-spi";
import {
    type CatalogItem,
    type DateAttributeGranularity,
    type IAttribute,
    type IDashboardAttributeFilter,
    type IFilter,
    type IMeasure,
    areObjRefsEqual,
    filterObjRef,
    isAttributeFilter,
    isCatalogAttribute,
    isCatalogFact,
    isCatalogMeasure,
    isSimpleMeasure,
    objRefToString,
} from "@gooddata/sdk-model";
import { type IDrillEvent } from "@gooddata/sdk-ui";
import {
    type IDashboardKeyDriverCombinationItem,
    type IKdaDefinition,
    type KdaPeriodType,
    formatKeyDriverAnalysisDateRange,
} from "@gooddata/sdk-ui-dashboard";
import { attributeFilterToDashboardAttributeFilter } from "@gooddata/sdk-ui-dashboard/internal";

export function useKdaDefinition(content: IChatKdaDefinition, format?: string, locale?: string) {
    const intl = useIntl();

    const measure = content.measure;

    const def: IKdaDefinition = useMemo(() => {
        return createKdaDefinition(
            measure,
            content.dateAttribute,
            content.filters.map(getDashboardAttributeFilter).filter(Boolean) as IDashboardAttributeFilter[],
            "previous_period",
            content.referencePeriod,
            content.analyzedPeriod,
            locale ?? intl.locale,
            getFormatByGranularity(content.dateGranularity) ?? format,
        );
    }, [
        measure,
        content.dateAttribute,
        content.filters,
        content.referencePeriod,
        content.analyzedPeriod,
        content.dateGranularity,
        locale,
        intl.locale,
        format,
    ]);

    return def;
}

export function useKdaInfo(catalogItems: CatalogItem[], def: IKdaDefinition, splitter: string) {
    const title = getTitle(catalogItems, def.metric);
    const range = formatKeyDriverAnalysisDateRange(def?.range, splitter);

    return {
        title,
        range,
    };
}

export function createKdaDefinition(
    measure: IMeasure,
    dateAttribute: IAttribute,
    filters: IDashboardAttributeFilter[],
    type: KdaPeriodType,
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
        type,
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
    data: IDashboardKeyDriverCombinationItem,
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

    if (!from.header.attributeHeaderItem.normalizedValue || !to.header.attributeHeaderItem.normalizedValue) {
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
        data.type === "year-to-year" ? "same_period_previous_year" : "previous_period",
        from.header.attributeHeaderItem.normalizedValue,
        to.header.attributeHeaderItem.normalizedValue,
        attr.format?.locale ?? locale,
        attr.format?.pattern,
    );
}

export function getDashboardAttributeFilter(f: IFilter) {
    if (isAttributeFilter(f)) {
        const ref = filterObjRef(f);
        const id = objRefToString(ref);
        return attributeFilterToDashboardAttributeFilter(f, `local_${id}`, undefined);
    }
    return null;
}

function getFormatByGranularity(granularity: DateAttributeGranularity) {
    switch (granularity) {
        case "GDC.time.date":
            return "dd/MM/yyyy";
        case "GDC.time.day_in_month":
            return "d";
        case "GDC.time.day_in_week":
            return "ccc";
        case "GDC.time.day_in_year":
            return "D";
        case "GDC.time.hour":
            return "M/d/y, h a";
        case "GDC.time.hour_in_day":
            return "h a";
        case "GDC.time.minute":
            return "M/d/y, h:mm a";
        case "GDC.time.minute_in_hour":
            return "m";
        case "GDC.time.month":
            return "MMM y";
        case "GDC.time.month_in_year":
            return "LLL";
        case "GDC.time.quarter":
            return "QQQ y";
        case "GDC.time.quarter_in_year":
            return "qqq";
        case "GDC.time.week_us":
            return "w/Y";
        case "GDC.time.week_in_year":
            return "w";
        case "GDC.time.year":
            return "y";
        default:
            return undefined;
    }
}

function getTitle(catalogItems: CatalogItem[], metric: IMeasure) {
    const objRef = isSimpleMeasure(metric) ? metric.measure.definition.measureDefinition.item : undefined;

    const operator = isSimpleMeasure(metric)
        ? metric.measure.definition.measureDefinition.aggregation
        : undefined;

    function getOperatorTitle(title: string) {
        return operator ? `${operator.toUpperCase()}({${title}})` : title;
    }

    return catalogItems
        .map((i) => {
            if (objRef && isCatalogMeasure(i) && areObjRefsEqual(i.measure.ref, objRef)) {
                return getOperatorTitle(`measure/${objRefToString(objRef)}`);
            }
            if (objRef && isCatalogFact(i) && areObjRefsEqual(i.fact.ref, objRef)) {
                return getOperatorTitle(`fact/${objRefToString(objRef)}`);
            }
            if (objRef && isCatalogAttribute(i) && areObjRefsEqual(i.attribute.ref, objRef)) {
                return getOperatorTitle(`attribute/${objRefToString(objRef)}`);
            }
            return undefined;
        })
        .find((title) => title !== undefined) as string | undefined;
}

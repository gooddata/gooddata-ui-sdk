// (C) 2025-2026 GoodData Corporation

import { invariant } from "ts-invariant";

import { ClientFormatterFacade, type ISeparators } from "@gooddata/number-formatter";
import {
    type DashboardAttributeFilterItem,
    type ICatalogAttribute,
    type IDashboardAttributeFilter,
    type ObjRef,
    areObjRefsEqual,
    dashboardAttributeFilterItemDisplayForm,
    isAttributeElementsByRef,
    isDashboardArbitraryAttributeFilter,
    isDashboardAttributeFilter,
    isDashboardMatchAttributeFilter,
    objRefToString,
} from "@gooddata/sdk-model";
import { DateFilterHelpers } from "@gooddata/sdk-ui-filters";

import { DEFAULT_MEASURE_FORMAT } from "./const.js";
import { type IKdaState } from "./internalTypes.js";
import { type DeepReadonly, type IKdaDataPoint, type IKdaDefinition } from "./types.js";

//Format value

export function formatValue(
    definition: DeepReadonly<IKdaDefinition>,
    value: number,
    separators?: ISeparators,
) {
    const val = ClientFormatterFacade.formatValue(
        value,
        definition.metric.measure.format ?? DEFAULT_MEASURE_FORMAT,
        separators,
    );

    return val.formattedValue;
}

//Format title

/**
 * @beta
 */
export function formatKeyDriverAnalysisDateRange(
    range: DeepReadonly<[IKdaDataPoint, IKdaDataPoint]> | undefined,
    splitter: string,
): string {
    const [from, to] = range ?? [null, null];

    // Not defined
    if (!from || !to) {
        return " - ";
    }

    // NOTE: Normalize server-supplied pattern so date-fns uses ISO week tokens (I/R/etc.)
    // instead of locale-based ones.
    const pattern = toIsoPattern(from.format?.pattern ?? "yyyy-MM-dd");

    return DateFilterHelpers.formatAbsoluteDateRange(
        new Date(from.date),
        new Date(to.date),
        pattern,
        splitter,
    );
}

//Attribute filters

export function getOnlyRelevantFilters(
    all: DashboardAttributeFilterItem[],
    relevantAttrs: ICatalogAttribute[],
) {
    return all.filter((f) => {
        const displayForm = dashboardAttributeFilterItemDisplayForm(f);
        return relevantAttrs.some(
            (r) =>
                areObjRefsEqual(displayForm, r.attribute) ||
                r.displayForms.some((df) => areObjRefsEqual(displayForm, df.ref)),
        );
    });
}

export function createNewAttributeFilter(
    attr: ICatalogAttribute,
    displayForm: ObjRef,
    id: string,
    value?: string,
) {
    const displayFormOf = attr.displayForms.find((df) => areObjRefsEqual(df.ref, displayForm));
    invariant(displayFormOf);

    const dashboardFilter: IDashboardAttributeFilter = {
        attributeFilter: {
            displayForm: displayFormOf.ref,
            negativeSelection: !value,
            attributeElements: {
                values: value ? [value] : [],
            },
            localIdentifier: `${objRefToString(displayFormOf.ref)}_${id}`,
            title: displayFormOf.title,
            selectionMode: "multi",
        },
    };

    return dashboardFilter;
}

export function updateExistingAttributeFilter(
    f: DashboardAttributeFilterItem,
    val: string,
    primaryDisplayForm?: ObjRef,
): DashboardAttributeFilterItem {
    if (isDashboardAttributeFilter(f)) {
        const attributeElements = isAttributeElementsByRef(f.attributeFilter.attributeElements)
            ? { uris: [val] }
            : { values: [val] };
        return {
            ...f,
            attributeFilter: {
                ...f.attributeFilter,
                negativeSelection: false,
                attributeElements,
            },
        };
    }

    if (isDashboardArbitraryAttributeFilter(f)) {
        return {
            attributeFilter: {
                displayForm: primaryDisplayForm ?? f.arbitraryAttributeFilter.displayForm,
                negativeSelection: false,
                attributeElements: { uris: [val] },
                localIdentifier: f.arbitraryAttributeFilter.localIdentifier,
                title: f.arbitraryAttributeFilter.title,
                selectionMode: "multi",
            },
        };
    }

    if (isDashboardMatchAttributeFilter(f)) {
        return {
            attributeFilter: {
                displayForm: primaryDisplayForm ?? f.matchAttributeFilter.displayForm,
                negativeSelection: false,
                attributeElements: { uris: [val] },
                localIdentifier: f.matchAttributeFilter.localIdentifier,
                title: f.matchAttributeFilter.title,
                selectionMode: "multi",
            },
        };
    }

    return f;
}

export function clearSummaryValue(definition: DeepReadonly<IKdaDefinition> | null): Partial<IKdaState> {
    return {
        ...(definition
            ? {
                  fromValue: { ...definition?.range[0], value: undefined },
                  toValue: { ...definition?.range[1], value: undefined },
              }
            : {}),
    };
}

const ISO_TOKEN_MAP: Array<[RegExp, (match: string) => string]> = [
    [/(Y{1,4})/g, (match) => match.replace(/Y/g, "R")],
    [/(w{1,2})/g, (match) => match.replace(/w/g, "I")],
    [/(e{1,4})/g, (match) => match.replace(/e/g, "i")],
];

function toIsoPattern(pattern: string): string {
    return ISO_TOKEN_MAP.reduce((acc, [regex, replacer]) => acc.replace(regex, replacer), pattern);
}

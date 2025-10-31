// (C) 2025 GoodData Corporation

import { invariant } from "ts-invariant";

import { ClientFormatterFacade, ISeparators } from "@gooddata/number-formatter";
import {
    ICatalogAttribute,
    IDashboardAttributeFilter,
    ObjRef,
    areObjRefsEqual,
    isAttributeElementsByRef,
    isAttributeElementsByValue,
    objRefToString,
} from "@gooddata/sdk-model";
import { DateFilterHelpers } from "@gooddata/sdk-ui-filters";

import { KdaDateOptions } from "./internalTypes.js";
import { IKdaDefinition } from "./types.js";
import { DEFAULT_MEASURE_FORMAT } from "../presentation/alerting/DefaultAlertingDialog/constants.js";

//Format value

export function formatValue(definition: IKdaDefinition, value: number, separators?: ISeparators) {
    const val = ClientFormatterFacade.formatValue(
        value,
        definition.metric.measure.format ?? DEFAULT_MEASURE_FORMAT,
        separators,
    );

    return val.formattedValue;
}

//Format title

export function formatTitle(option: KdaDateOptions, splitter: string): string {
    const [from, to] = option.range ?? [null, null];

    // Not defined
    if (!from || !to) {
        return " - ";
    }

    const pattern = from.format?.pattern ?? "yyyy-MM-dd";

    return DateFilterHelpers.formatAbsoluteDateRange(
        new Date(from.date),
        new Date(to.date),
        pattern,
        splitter,
    );
}

//Attribute filters

export function getOnlyRelevantFilters(all: IDashboardAttributeFilter[], relevantAttrs: ICatalogAttribute[]) {
    return all.filter((f) => {
        return relevantAttrs.some(
            (r) =>
                areObjRefsEqual(f.attributeFilter.displayForm, r.attribute) ||
                r.displayForms.some((df) => areObjRefsEqual(f.attributeFilter.displayForm, df.ref)),
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

export function updateExistingAttributeFilter(f: IDashboardAttributeFilter, val: string) {
    return {
        ...f,
        attributeFilter: {
            ...f.attributeFilter,
            negativeSelection: false,
            attributeElements: {
                ...(isAttributeElementsByRef(f.attributeFilter.attributeElements)
                    ? {
                          uris: [val],
                      }
                    : {}),
                ...(isAttributeElementsByValue(f.attributeFilter.attributeElements)
                    ? {
                          values: [val],
                      }
                    : {}),
            },
        },
    } as IDashboardAttributeFilter;
}

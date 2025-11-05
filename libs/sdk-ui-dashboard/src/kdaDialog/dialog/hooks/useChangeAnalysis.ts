// (C) 2025 GoodData Corporation

import { useEffect, useMemo } from "react";

import { ClientFormatterFacade } from "@gooddata/number-formatter";
import { IChangeAnalysisResults, IKeyDriver } from "@gooddata/sdk-backend-spi";
import {
    IAttribute,
    ICatalogAttribute,
    IDashboardAttributeFilter,
    IMeasure,
    ISeparators,
    ObjRef,
    newAttribute,
} from "@gooddata/sdk-model";
import { useBackendStrict, useCancelablePromise, useWorkspaceStrict } from "@gooddata/sdk-ui";
import { IUiListboxInteractiveItem } from "@gooddata/sdk-ui-kit";

import { dashboardAttributeFilterToAttributeFilter } from "../../../_staging/dashboard/dashboardFilterConverter.js";
import { useAttribute } from "../../hooks/useAttribute.js";
import { useDateAttribute } from "../../hooks/useDateAttribute.js";
import { useRelevantFilters } from "../../hooks/useRelevantFilters.js";
import { KdaItem, KdaState } from "../../internalTypes.js";
import { useKdaState } from "../../providers/KdaState.js";
import { IKdaDefinition } from "../../types.js";

export function useChangeAnalysis() {
    const { state, setState } = useKdaState();
    const definition = state.definition;

    const attributes = useMemo(() => {
        return state.selectedAttributes;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.selectedUpdated]);

    const filters = useRelevantFilters();
    const loading = state.relevantStatus === "loading" || state.relevantStatus === "pending";

    const results = useChangeAnalysisResults(definition, attributes, filters, loading);
    const list = useKdaStateWithList(results, definition);

    useEffect(() => {
        setState(list);
    }, [list, setState]);
}

function useChangeAnalysisResults(
    definition: IKdaDefinition | null,
    attrs: ObjRef[],
    attrFilters: IDashboardAttributeFilter[],
    loading: boolean,
) {
    const backend = useBackendStrict();
    const workspace = useWorkspaceStrict();

    const from = definition?.range[0].date;
    const to = definition?.range[1].date;
    const dateAttributeFinder = useDateAttribute();
    const attributeFinder = useAttribute();

    return useCancelablePromise<IChangeAnalysisResults | undefined>(
        {
            promise: () => {
                const dateAttribute = dateAttributeFinder(definition?.dateAttribute);

                if (!definition || !dateAttribute || loading) {
                    return Promise.resolve(undefined);
                }

                const granularity = dateAttribute.granularity;
                const attributes = attrs
                    .map((ref) => {
                        const attr = attributeFinder(ref);
                        return attr ? newAttribute(ref) : null;
                    })
                    .filter(Boolean) as IAttribute[];
                const filters = attrFilters.map(dashboardAttributeFilterToAttributeFilter);

                return backend
                    .workspace(workspace)
                    .keyDriverAnalysis()
                    .computeChangeAnalysis(
                        {
                            measure: definition.metric,
                            auxMeasures: definition.metrics,
                            attributes,
                            filters,
                        },
                        {
                            dateAttribute: newAttribute(dateAttribute.defaultDisplayForm.ref),
                            from: from ?? "",
                            to: to ?? "",
                            granularity,
                        },
                    );
            },
        },
        [backend, definition, attrs, workspace, from, to, loading, attrFilters],
    );
}

function useKdaStateWithList(
    { result, status }: ReturnType<typeof useChangeAnalysisResults>,
    definition: IKdaDefinition | null,
): Partial<KdaState> {
    const { state } = useKdaState();
    const loadingStatus = definition ? status : "pending";

    const attributeFinder = useAttribute();
    const metric = definition?.metric;

    const separators = state.separators;
    const from = definition?.range[0].date;
    const to = definition?.range[1].date;

    const { items, attributes, toValue, fromValue } = useMemo(() => {
        const attributes: ICatalogAttribute[] = [];

        function mapKeyDrive(keyDriver: IKeyDriver, i: number) {
            const ref = keyDriver.displayForm;
            const attribute = attributeFinder(ref);

            if (attribute && !attributes.includes(attribute)) {
                attributes.push(attribute);
            }
            if (attribute && metric && from && to) {
                return createKdaItem(metric, attribute, ref, keyDriver, i, from, to, separators);
            }
            return null;
        }

        const toValue = result?.toValue;
        const fromValue = result?.fromValue;
        const list = result?.keyDrivers.map(mapKeyDrive) ?? [];
        const items = list.filter(Boolean) as IUiListboxInteractiveItem<KdaItem>[];

        return {
            items,
            attributes,
            toValue,
            fromValue,
        };
    }, [
        attributeFinder,
        from,
        metric,
        result?.toValue,
        result?.keyDrivers,
        result?.fromValue,
        separators,
        to,
    ]);

    return useMemo(() => {
        const currentFrom = state.definition?.range[0].value;
        const currentTo = state.definition?.range[1].value;

        const definition = state.definition;
        // update from
        if (definition && currentFrom === undefined && fromValue !== undefined) {
            definition.range[0].value = fromValue;
        }
        // update to
        if (definition && currentTo === undefined && toValue !== undefined) {
            definition.range[1].value = toValue;
        }

        return {
            items,
            definition,
            selectedItem: "summary",
            itemsStatus: loadingStatus,
            selectedStatus: loadingStatus,
            selectedAttributes: attributes.map((a) => a.defaultDisplayForm.ref),
        };
    }, [state.definition, fromValue, toValue, items, loadingStatus, attributes]);
}

function createKdaItem(
    metric: IMeasure,
    attribute: ICatalogAttribute,
    displayForm: ObjRef,
    driver: IKeyDriver,
    i: number,
    from: string,
    to: string,
    separators?: ISeparators,
): IUiListboxInteractiveItem<KdaItem> {
    const stringTitle = `${attribute.attribute.title}: ${driver.value}`;
    const id = `key_driver_${i}`;

    return {
        id,
        stringTitle,
        data: {
            id,
            attribute: attribute.defaultDisplayForm.ref,
            displayForm: displayForm,
            title: attribute.attribute.title,
            description: attribute.attribute.description,
            category: driver.value,
            from: {
                value: driver.metricValue.from,
                date: from,
            },
            to: {
                value: driver.metricValue.to,
                date: to,
            },
            isSignificant: driver.isSignificantChange,
            standardDeviation: driver.std,
            mean: driver.mean,
            formatValue: (value: number) => {
                const format = metric.measure.format;
                return ClientFormatterFacade.formatValue(value, format, separators).formattedValue;
            },
        },
        type: "interactive",
    };
}

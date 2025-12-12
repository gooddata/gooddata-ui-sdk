// (C) 2025 GoodData Corporation

import { useEffect, useMemo } from "react";

import stringify from "json-stable-stringify";

import { ClientFormatterFacade } from "@gooddata/number-formatter";
import { type IChangeAnalysisResults, type IKeyDriver } from "@gooddata/sdk-backend-spi";
import {
    type IAttribute,
    type ICatalogAttribute,
    type IDashboardAttributeFilter,
    type IMeasure,
    type ISeparators,
    type ObjRef,
    isAllValuesDashboardAttributeFilter,
    newAttribute,
} from "@gooddata/sdk-model";
import { useBackendStrict, useCancelablePromise, useWorkspaceStrict } from "@gooddata/sdk-ui";
import { type IUiListboxInteractiveItem } from "@gooddata/sdk-ui-kit";

import { useAttribute } from "../../hooks/useAttribute.js";
import { useDateAttribute } from "../../hooks/useDateAttribute.js";
import { useRelevantFilters } from "../../hooks/useRelevantFilters.js";
import { type KdaItem, type KdaState } from "../../internalTypes.js";
import { useKdaState } from "../../providers/KdaState.js";
import { type DeepReadonly, type IKdaDefinition } from "../../types.js";
import { dashboardAttributeFilterToAttributeFilter } from "../../utils.js";

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
    definition: DeepReadonly<IKdaDefinition> | null,
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

    const attributeFiltersFingerprint = useMemo(() => {
        return attrFilters
            .filter((f) => !isAllValuesDashboardAttributeFilter(f))
            .map((f) => stringify(f))
            .join();
    }, [attrFilters]);

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
                const filters = attrFilters
                    .filter((f) => !isAllValuesDashboardAttributeFilter(f))
                    .map(dashboardAttributeFilterToAttributeFilter);

                return backend
                    .workspace(workspace)
                    .keyDriverAnalysis()
                    .computeChangeAnalysis(
                        {
                            measure: definition.metric as IMeasure,
                            auxMeasures: definition.metrics as IMeasure[],
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
        [
            backend,
            definition,
            attrs,
            workspace,
            from,
            to,
            loading,
            dateAttributeFinder,
            attributeFiltersFingerprint,
        ],
    );
}

function useKdaStateWithList(
    { result, status }: ReturnType<typeof useChangeAnalysisResults>,
    definition: DeepReadonly<IKdaDefinition> | null,
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
        const currentFrom = state.fromValue?.value;
        const currentTo = state.toValue?.value;

        const definition = state.definition;
        const updatedState: Partial<KdaState> = {};
        // update from
        if (state.fromValue && currentFrom === undefined && fromValue !== undefined) {
            updatedState.fromValue = {
                ...state.fromValue,
                value: fromValue,
            };
        }
        // update to
        if (state.toValue && currentTo === undefined && toValue !== undefined) {
            updatedState.toValue = {
                ...state.toValue,
                value: toValue,
            };
        }

        return {
            items,
            definition,
            ...updatedState,
            selectedItem: "summary",
            itemsStatus: loadingStatus,
            selectedStatus: loadingStatus,
            selectedAttributes: attributes.map((a) => a.defaultDisplayForm.ref),
        };
    }, [
        state.fromValue,
        state.toValue,
        state.definition,
        fromValue,
        toValue,
        items,
        loadingStatus,
        attributes,
    ]);
}

function createKdaItem(
    metric: DeepReadonly<IMeasure>,
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

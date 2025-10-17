// (C) 2025 GoodData Corporation

import { useEffect, useMemo } from "react";

import { ClientFormatterFacade } from "@gooddata/number-formatter";
import { IChangeAnalysisResults, IKeyDriver } from "@gooddata/sdk-backend-spi";
import { ICatalogAttribute, IMeasure, ISeparators, ObjRef, isSimpleMeasure } from "@gooddata/sdk-model";
import { useBackendStrict, useCancelablePromise, useWorkspaceStrict } from "@gooddata/sdk-ui";
import { IUiListboxInteractiveItem } from "@gooddata/sdk-ui-kit";

import { useAttribute } from "../../hooks/useAttribute.js";
import { useDateAttribute } from "../../hooks/useDateAttribute.js";
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

    const results = useChangeAnalysisResults(definition, attributes);
    const list = useKdaStateWithList(results, definition);

    useEffect(() => {
        setState(list);
    }, [list, setState]);
}

function useChangeAnalysisResults(definition: IKdaDefinition | null, attributes: ObjRef[]) {
    const backend = useBackendStrict();
    const workspace = useWorkspaceStrict();

    const from = definition?.range[0].date;
    const to = definition?.range[1].date;
    const dateAttributeFinder = useDateAttribute();

    return useCancelablePromise<IChangeAnalysisResults | undefined>(
        {
            promise: () => {
                const dateAttribute = dateAttributeFinder(definition?.dateAttribute);

                if (!definition || !dateAttribute) {
                    return Promise.resolve(undefined);
                }

                const granularity = dateAttribute.granularity;

                //TODO: This is hack: Replace this code for metric definition not only id
                const ref = isSimpleMeasure(definition.metric)
                    ? definition.metric.measure.definition.measureDefinition.item
                    : null;
                if (!ref) {
                    return Promise.resolve(undefined);
                }

                return backend
                    .workspace(workspace)
                    .keyDriverAnalysis()
                    .computeChangeAnalysis(
                        {
                            dateAttribute: definition.dateAttribute,
                            from: from ?? "",
                            to: to ?? "",
                            granularity,
                        },
                        ref,
                        attributes,
                    );
            },
        },
        [backend, definition, attributes, workspace, from, to],
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

    const { items, attributes } = useMemo(() => {
        const attributes: ICatalogAttribute[] = [];

        function mapKeyDrive(keyDriver: IKeyDriver, i: number) {
            const ref = keyDriver.displayForm;
            const attribute = attributeFinder(ref);

            if (attribute && !attributes.includes(attribute)) {
                attributes.push(attribute);
            }
            if (attribute && metric && from && to) {
                return createKdaItem(metric, attribute, keyDriver, i, from, to, separators);
            }
            return null;
        }

        const list = result?.keyDrivers.map(mapKeyDrive) ?? [];
        const items = list.filter(Boolean) as IUiListboxInteractiveItem<KdaItem>[];

        return {
            items,
            attributes,
        };
    }, [attributeFinder, from, metric, result?.keyDrivers, separators, to]);

    return useMemo(() => {
        return {
            items,
            selectedItem: "summary",
            itemsStatus: loadingStatus,
            selectedStatus: loadingStatus,
            selectedAttributes: attributes.map((a) => a.defaultDisplayForm.ref),
        };
    }, [items, loadingStatus, attributes]);
}

function createKdaItem(
    metric: IMeasure,
    attribute: ICatalogAttribute,
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

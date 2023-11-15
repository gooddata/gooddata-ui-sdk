// (C) 2022-2023 GoodData Corporation
import { useCallback, useMemo } from "react";
import { defineMessages } from "react-intl";
import { invariant } from "ts-invariant";
import { useToastMessage } from "@gooddata/sdk-ui-kit";
import { IAvailableDrillTargets } from "@gooddata/sdk-ui";
import {
    idRef,
    IDrillDownReference,
    InsightDrillDefinition,
    isInsightWidget,
    localIdRef,
    ObjRef,
} from "@gooddata/sdk-model";

import {
    modifyDrillsForInsightWidget,
    removeDrillDownForInsightWidget,
    removeDrillsForInsightWidget,
    selectAllowMultipleInteractionsPerAttributeAndMeasure,
    selectDrillTargetsByWidgetRef,
    selectEnableAttributeHierarchies,
    selectGlobalDrillsDownAttributeHierarchyByWidgetRef,
    selectInvalidUrlDrillParameterDrillLocalIdsByWidgetRef,
    selectSettings,
    selectWidgetByRef,
    useDashboardDispatch,
    useDashboardSelector,
    addDrillDownForInsightWidget,
} from "../../../../../model/index.js";
import { getGlobalDrillDownMappedConfigForWidget, getMappedConfigForWidget } from "./drillConfigMapper.js";
import {
    DRILL_TARGET_TYPE,
    IDrillConfigItem,
    IDrillDownAttributeHierarchyConfig,
} from "../../../../drill/types.js";
import { useIncompleteItems } from "./useDrillConfigIncompleteItems.js";

const messages = defineMessages({
    added: { id: "messages.drill.InteractionConfiguredSuccess" },
    modified: { id: "messages.drill.InteractionUpdatedSuccess" },
});

const mergeDrillConfigItems = (
    drillConfigItems: IDrillConfigItem[],
    globalDrillDownItems: IDrillConfigItem[],
    incompleteItems: IDrillConfigItem[],
): IDrillConfigItem[] => {
    return incompleteItems.reduce(
        (acc: IDrillConfigItem[], incompleteItem: IDrillConfigItem) => {
            const found = acc.findIndex((item) => item.localIdentifier === incompleteItem.localIdentifier);
            if (found !== -1) {
                if (!incompleteItem.complete) {
                    acc[found] = incompleteItem;
                }
            } else {
                acc.push(incompleteItem);
            }
            return acc;
        },
        [...(globalDrillDownItems ?? []), ...(drillConfigItems ?? [])],
    );
};

const getUnusedDrillTargets = (
    availableDrillTargets: IAvailableDrillTargets | undefined,
    mergedItems: IDrillConfigItem[],
    allowMultipleInteractionsPerAttributeAndMeasure: boolean,
    enableAttributeHierarchies: boolean,
) => {
    if (allowMultipleInteractionsPerAttributeAndMeasure && enableAttributeHierarchies) {
        return {
            measures: availableDrillTargets?.measures,
            attributes: availableDrillTargets?.attributes,
        };
    }

    const availableDrillTargetMeasures = availableDrillTargets?.measures?.filter(
        (measure) =>
            !mergedItems.some(
                (item) =>
                    item.type === "measure" &&
                    item.originLocalIdentifier === measure.measure.measureHeaderItem.localIdentifier,
            ),
    );
    const availableDrillTargetAttributes = availableDrillTargets?.attributes?.filter(
        (attribute) =>
            !mergedItems.some(
                (item) =>
                    item.type === "attribute" &&
                    item.originLocalIdentifier === attribute.attribute.attributeHeader.localIdentifier,
            ),
    );

    return {
        measures: availableDrillTargetMeasures,
        attributes: availableDrillTargetAttributes,
    };
};

/**
 * @internal
 */
export interface IUseDrillConfigPanelProps {
    widgetRef: ObjRef;
}

/**
 * hook for DrillConfigPanel component
 * @internal
 */
export const useInsightDrillConfigPanel = (props: IUseDrillConfigPanelProps) => {
    const { widgetRef } = props;
    const widget = useDashboardSelector(selectWidgetByRef(widgetRef));
    invariant(isInsightWidget(widget), "must be insight widget");

    const { drills: widgetDrills } = widget;
    const { incompleteItems, deleteIncompleteItem, onChangeItem, onOriginSelect, completeItem, isItemNew } =
        useIncompleteItems({ widgetDrills });

    const { addSuccess } = useToastMessage();
    const dispatch = useDashboardDispatch();

    const enableAttributeHierarchies = useDashboardSelector(selectEnableAttributeHierarchies);
    const allowMultipleInteractionsPerAttributeAndMeasure = useDashboardSelector(
        selectAllowMultipleInteractionsPerAttributeAndMeasure,
    );
    const widgetGlobalDrillDowns = useDashboardSelector(
        selectGlobalDrillsDownAttributeHierarchyByWidgetRef(widgetRef),
    );

    const configItems = useDashboardSelector(selectDrillTargetsByWidgetRef(widgetRef));
    const invalidCustomUrlDrillLocalIds = useDashboardSelector(
        selectInvalidUrlDrillParameterDrillLocalIdsByWidgetRef(widgetRef),
    );
    const settings = useDashboardSelector(selectSettings);

    const { enableKDZooming } = settings;
    const availableDrillTargets = configItems?.availableDrillTargets;

    const drillItems = useMemo(() => {
        return availableDrillTargets
            ? getMappedConfigForWidget(
                  widgetDrills,
                  availableDrillTargets,
                  invalidCustomUrlDrillLocalIds,
                  widgetRef,
              )
            : [];
    }, [availableDrillTargets, widgetDrills, invalidCustomUrlDrillLocalIds]);

    const globalDrillDownItems = useMemo(() => {
        return availableDrillTargets
            ? getGlobalDrillDownMappedConfigForWidget(
                  widgetGlobalDrillDowns,
                  availableDrillTargets,
                  widgetRef,
              )
            : [];
    }, [widgetGlobalDrillDowns, availableDrillTargets]);

    const mergedItems = useMemo(
        () => mergeDrillConfigItems(drillItems, globalDrillDownItems, incompleteItems),
        [drillItems, globalDrillDownItems, incompleteItems],
    );

    const originSelectorItems = useMemo(
        () =>
            getUnusedDrillTargets(
                availableDrillTargets,
                mergedItems,
                allowMultipleInteractionsPerAttributeAndMeasure,
                enableAttributeHierarchies,
            ),
        [
            availableDrillTargets,
            mergedItems,
            allowMultipleInteractionsPerAttributeAndMeasure,
            enableAttributeHierarchies,
        ],
    );

    const onSetupItem = useCallback(
        (drill: InsightDrillDefinition | undefined, changedItem: IDrillConfigItem) => {
            const isNew = isItemNew(changedItem);
            if (drill) {
                dispatch(modifyDrillsForInsightWidget(widgetRef, [drill]));
            }

            // we are not able remove incomplete items directly,it will change items in panel while command is processing
            // and this will not keep correct scroll.
            // we mark item complete and remove is done in useIncompleteItems when widget drills changed
            completeItem(changedItem);

            if (changedItem.drillTargetType === DRILL_TARGET_TYPE.DRILL_DOWN) {
                const attributeDescriptor = changedItem.attributes.find(
                    (attr) => attr.attributeHeader.localIdentifier === changedItem.originLocalIdentifier,
                );
                dispatch(
                    addDrillDownForInsightWidget(
                        widgetRef,
                        idRef(attributeDescriptor!.attributeHeader.identifier, "displayForm"),
                        (changedItem as IDrillDownAttributeHierarchyConfig).attributeHierarchyRef,
                    ),
                );
                deleteIncompleteItem(changedItem);
            }
            addSuccess(isNew ? messages.added : messages.modified, { duration: 3000 });
        },
        [widgetRef, completeItem, addSuccess, isItemNew, dispatch],
    );

    const onDeleteItem = useCallback(
        (item: IDrillConfigItem) => {
            if (item.complete) {
                item.drillTargetType === DRILL_TARGET_TYPE.DRILL_DOWN
                    ? dispatch(
                          removeDrillDownForInsightWidget(
                              widgetRef,
                              buildBlacklistHierarchies(item as IDrillDownAttributeHierarchyConfig),
                          ),
                      )
                    : dispatch(removeDrillsForInsightWidget(widgetRef, [localIdRef(item.localIdentifier!)]));
            }
            deleteIncompleteItem(item);
        },
        [widgetRef, dispatch, deleteIncompleteItem],
    );

    return {
        widget,
        enableKDZooming,
        drillConfigItems: mergedItems,
        originSelectorItems,
        isOriginSelectorVisible: !!configItems?.availableDrillTargets,
        isLoaded: !!configItems,
        onChangeItem,
        onOriginSelect,
        onSetupItem,
        onDeleteItem,
    };
};

function buildBlacklistHierarchies(item: IDrillDownAttributeHierarchyConfig): IDrillDownReference[] {
    const attributeDescriptor = item.attributes.find(
        (attr) => attr.attributeHeader.localIdentifier === item.originLocalIdentifier,
    );
    if (!attributeDescriptor) {
        return [];
    }
    const isDateAttribute = !!attributeDescriptor.attributeHeader.granularity;
    if (isDateAttribute) {
        return [
            {
                type: "dateHierarchyReference",
                dateHierarchyTemplate: item.attributeHierarchyRef,
                dateDatasetAttribute: idRef(attributeDescriptor.attributeHeader.identifier, "displayForm"),
            },
        ];
    }
    return [
        {
            type: "attributeHierarchyReference",
            attributeHierarchy: item.attributeHierarchyRef,
            label: idRef(attributeDescriptor.attributeHeader.identifier, "displayForm"),
        },
    ];
}

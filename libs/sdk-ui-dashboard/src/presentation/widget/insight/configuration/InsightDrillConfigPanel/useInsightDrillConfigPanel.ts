// (C) 2022-2023 GoodData Corporation
import { InsightDrillDefinition, isInsightWidget, ObjRef } from "@gooddata/sdk-model";
import { useCallback, useMemo } from "react";
import { defineMessages } from "react-intl";
import { useToastMessage } from "@gooddata/sdk-ui-kit";

import {
    modifyDrillsForInsightWidget,
    removeDrillsForInsightWidget,
    selectDrillTargetsByWidgetRef,
    selectInvalidUrlDrillParameterDrillLocalIdsByWidgetRef,
    selectSettings,
    selectWidgetByRef,
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../../../model/index.js";
import { invariant } from "ts-invariant";
import { getMappedConfigForWidget } from "./drillConfigMapper.js";
import { IDrillConfigItem } from "../../../../drill/types.js";
import { IAvailableDrillTargets } from "@gooddata/sdk-ui";
import { useIncompleteItems } from "./useDrillConfigIncompleteItems.js";

const messages = defineMessages({
    added: { id: "messages.drill.InteractionConfiguredSuccess" },
    modified: { id: "messages.drill.InteractionUpdatedSuccess" },
});

const mergeDrillConfigItems = (
    drillConfigItems: IDrillConfigItem[],
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
        [...drillConfigItems],
    );
};

const getUnusedDrillTargets = (
    availableDrillTargets: IAvailableDrillTargets | undefined,
    mergedItems: IDrillConfigItem[],
) => {
    const availableDrillTargetMeasures = availableDrillTargets?.measures?.filter(
        (measure) =>
            !mergedItems.some(
                (item) =>
                    item.type === "measure" &&
                    item.localIdentifier === measure.measure.measureHeaderItem.localIdentifier,
            ),
    );
    const availableDrillTargetAttributes = availableDrillTargets?.attributes?.filter(
        (attribute) =>
            !mergedItems.some(
                (item) =>
                    item.type === "attribute" &&
                    item.localIdentifier === attribute.attribute.attributeHeader.localIdentifier,
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

    const configItems = useDashboardSelector(selectDrillTargetsByWidgetRef(widgetRef));
    const invalidCustomUrlDrillLocalIds = useDashboardSelector(
        selectInvalidUrlDrillParameterDrillLocalIdsByWidgetRef(widgetRef),
    );
    const settings = useDashboardSelector(selectSettings);

    const { enableKDZooming } = settings;
    const availableDrillTargets = configItems?.availableDrillTargets;

    const drillItems = useMemo(() => {
        return availableDrillTargets
            ? getMappedConfigForWidget(widgetDrills, availableDrillTargets, invalidCustomUrlDrillLocalIds)
            : [];
    }, [availableDrillTargets, widgetDrills, invalidCustomUrlDrillLocalIds]);

    const mergedItems = useMemo(
        () => mergeDrillConfigItems(drillItems, incompleteItems),
        [drillItems, incompleteItems],
    );

    const originSelectorItems = useMemo(
        () => getUnusedDrillTargets(availableDrillTargets, mergedItems),
        [availableDrillTargets, mergedItems],
    );

    const onSetupItem = useCallback(
        (drill: InsightDrillDefinition, changedItem: IDrillConfigItem) => {
            const isNew = isItemNew(changedItem);
            dispatch(modifyDrillsForInsightWidget(widgetRef, [drill]));

            // we are not able remove incomplete items directly,it will change items in panel while command is processing
            // and this will not keep correct scroll.
            // we mark item complete and remove is done in useIncompleteItems when widget drills changed
            completeItem(changedItem);
            addSuccess(isNew ? messages.added : messages.modified, { duration: 3000 });
        },
        [widgetRef, completeItem, addSuccess, isItemNew, dispatch],
    );

    const onDeleteItem = useCallback(
        (item: IDrillConfigItem) => {
            if (item.complete) {
                dispatch(removeDrillsForInsightWidget(widgetRef, [item]));
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

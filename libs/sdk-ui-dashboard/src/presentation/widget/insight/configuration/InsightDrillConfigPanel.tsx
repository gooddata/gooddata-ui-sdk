// (C) 2019-2022 GoodData Corporation
import { InsightDrillDefinition, isInsightWidget, ObjRef } from "@gooddata/sdk-model";
import React, { useState } from "react";
import { FormattedMessage } from "react-intl";
import { Typography } from "@gooddata/sdk-ui-kit";
import { InsightDrillConfigList } from "./InsightDrillConfigList";
import {
    modifyDrillsForInsightWidget,
    selectDrillTargetsByWidgetRef,
    selectSettings,
    selectWidgetByRef,
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../../model";
import { DrillOriginSelector } from "./DrillOriginSelector/DrillOriginSelector";
import invariant from "ts-invariant";
import { getMappedConfigForWidget } from "./getMappedConfigForWidget";
import { useDrillTargetTypeItems } from "./useDrillTargetTypeItems";
import { IDrillConfigItem, isAvailableDrillTargetMeasure } from "../../../drill/types";
import { IAvailableDrillTargetItem } from "../../../drill/DrillSelect/types";
import { IAvailableDrillTargets } from "@gooddata/sdk-ui";
import { ZoomInsightConfiguration } from "./ZoomInsightConfiguration";

const mergeDrillConfigItems = (
    drillConfigItems: IDrillConfigItem[],
    incompleteItems: IDrillConfigItem[],
): IDrillConfigItem[] => {
    return incompleteItems.reduce(
        (acc: IDrillConfigItem[], incompleteItem: IDrillConfigItem) => {
            const found = acc.findIndex((item) => item.localIdentifier === incompleteItem.localIdentifier);
            if (found !== -1) {
                acc[found] = incompleteItem;
            } else {
                acc.push(incompleteItem);
            }
            return acc;
        },
        [...drillConfigItems],
    );
};
const addOrUpdateDrillConfigItem = (drillConfigItems: IDrillConfigItem[], newItem: IDrillConfigItem) => {
    const found = drillConfigItems.findIndex(
        (drillConfigItem) => drillConfigItem.localIdentifier === newItem.localIdentifier,
    );
    if (found !== -1) {
        const incompleteItemsUpdated = [...drillConfigItems];
        incompleteItemsUpdated[found] = newItem;
        return incompleteItemsUpdated;
    } else {
        return [...drillConfigItems, newItem];
    }
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

export interface IDrillConfigPanelProps {
    widgetRef: ObjRef;
}

export const InsightDrillConfigPanel: React.FunctionComponent<IDrillConfigPanelProps> = ({ widgetRef }) => {
    const [incompleteItems, updateIncompleteItems] = useState<IDrillConfigItem[]>([]);
    const enabledDrillTargetTypeItems = useDrillTargetTypeItems();

    const addIncompleteItem = (item: IDrillConfigItem) => {
        updateIncompleteItems(addOrUpdateDrillConfigItem(incompleteItems, item));
    };

    const deleteIncompleteItem = (item: IDrillConfigItem) => {
        const incompleteItemsUpdated = incompleteItems.filter(
            (incompleteItem) => incompleteItem.localIdentifier !== item.localIdentifier,
        );
        updateIncompleteItems(incompleteItemsUpdated);
    };

    const onChangeItem = (changedItem: IDrillConfigItem) => {
        const incompleteItem: IDrillConfigItem = {
            ...changedItem,
            complete: false,
        };
        addIncompleteItem(incompleteItem);
    };

    const onOriginSelect = (selectedItem: IAvailableDrillTargetItem) => {
        if (isAvailableDrillTargetMeasure(selectedItem)) {
            const incompleteMeasureItem: IDrillConfigItem = {
                type: "measure",
                localIdentifier: selectedItem.measure.measureHeaderItem.localIdentifier,
                title: selectedItem.measure.measureHeaderItem.name,
                attributes: selectedItem.attributes,
                drillTargetType: undefined,
                complete: false,
            };

            addIncompleteItem(incompleteMeasureItem);
        } else {
            const incompleteAttributeItem: IDrillConfigItem = {
                type: "attribute",
                localIdentifier: selectedItem.attribute.attributeHeader.localIdentifier,
                title: selectedItem.attribute.attributeHeader.formOf.name,
                attributes: selectedItem.intersectionAttributes,
                drillTargetType: undefined,
                complete: false,
            };

            addIncompleteItem(incompleteAttributeItem);
        }
    };

    const configItems = useDashboardSelector(selectDrillTargetsByWidgetRef(widgetRef));
    const widget = useDashboardSelector(selectWidgetByRef(widgetRef));

    invariant(isInsightWidget(widget), "must be insight widget");

    const drillItems = configItems?.availableDrillTargets
        ? getMappedConfigForWidget(widget.drills, configItems?.availableDrillTargets)
        : [];

    const dispatch = useDashboardDispatch();
    const mergedItems = mergeDrillConfigItems(drillItems, incompleteItems);

    const settings = useDashboardSelector(selectSettings);

    return (
        <>
            {settings.enableKDZooming && <ZoomInsightConfiguration widget={widget} />}
            <div className="configuration-category s-drill-config-panel">
            <Typography tagName="h3">
                <span>
                    <FormattedMessage id="configurationPanel.drillConfig.interactions" />
                </span>
            </Typography>
            <InsightDrillConfigList
                drillConfigItems={mergedItems}
                // onDelete={onDeleteItem}
                onSetup={(drill: InsightDrillDefinition, changedItem: IDrillConfigItem) => {
                    dispatch(modifyDrillsForInsightWidget(widgetRef, [drill]));
                    deleteIncompleteItem(changedItem);
                }}
                onIncompleteChange={onChangeItem}
                enabledDrillTargetTypeItems={enabledDrillTargetTypeItems}
            />
            {configItems?.availableDrillTargets && (
                <DrillOriginSelector
                    items={getUnusedDrillTargets(configItems?.availableDrillTargets, mergedItems)}
                    onSelect={onOriginSelect}
                />
            )}
        </div>
        </>
    );
};

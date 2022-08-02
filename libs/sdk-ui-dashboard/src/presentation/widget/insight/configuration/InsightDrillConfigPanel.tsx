// (C) 2019-2022 GoodData Corporation
import { InsightDrillDefinition, isInsightWidget, ObjRef } from "@gooddata/sdk-model";
import React from "react";
import { FormattedMessage } from "react-intl";
// import { connect } from "react-redux";
// import { IAvailableDrillTargetMeasure } from "@gooddata/sdk-ui";
// import { IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import { Typography } from "@gooddata/sdk-ui-kit";
import { InsightDrillConfigList } from "./InsightDrillConfigList";
import {
    modifyDrillsForInsightWidget,
    selectDrillTargetsByWidgetRef,
    selectWidgetByRef,
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../../model";
import { IAvailableDrillTargetItem } from "../../../drill/DrillSelect/types";
import { DrillOriginSelector } from "./DrillOriginSelector/DrillOriginSelector";
import invariant from "ts-invariant";
import { getMappedConfigForWidget } from "./getMappedConfigForWidget";
import { useDrillTargetTypeItems } from "./useDrillTargetTypeItems";

// import { AppState } from "../../../modules/Core/typings/state";
// import {
//     createDrillAddedAction,
//     createDrillRemovedAction,
//     getUnusedDrillConfig,
//     getUsedDrillConfig,
//     DrillActionTarget,
//     getDrillTargetTypeItems,
//     mergeDrillConfigItems,
//     addOrUpdateDrillConfigItem,
//     IDrillConfigItem,
// } from "../../../modules/Drilling";
// import { getSelectedWidgetRef } from "../../../modules/Core/services/DashboardService";
// import { getConfigs } from "../../../modules/Configs";
//
// import DrillMeasureSelector from "./DrillMeasureSelector/DrillMeasureSelector";
// import { DrillConfigList } from "./DrillConfig/DrillConfigList";

export interface IDrillConfigPanelProps {
    widgetRef: ObjRef;
}

export const InsightDrillConfigPanel: React.FunctionComponent<IDrillConfigPanelProps> = ({ widgetRef }) => {
    // const [incompleteItems, updateIncompleteItems] = React.useState<IDrillConfigItem[]>([]);

    // const configItems = mergeDrillConfigItems(props.drillConfigItems, incompleteItems);
    //
    // const selectorItems = props.supportedItems.filter(
    //     (supportedItem: IAvailableDrillTargetMeasure) =>
    //         !incompleteItems
    //             .map((incompleteItem) => incompleteItem.localIdentifier)
    //             .includes(supportedItem.measure.measureHeaderItem.localIdentifier),
    // );
    //
    // const deleteIncompleteItem = (item: IDrillConfigItem) => {
    //     const incompleteItemsUpdated = incompleteItems.filter(
    //         (incompleteItem) => incompleteItem.localIdentifier !== item.localIdentifier,
    //     );
    //     updateIncompleteItems(incompleteItemsUpdated);
    // };
    //
    // const addIncompleteItem = (item: IDrillConfigItem) => {
    //     updateIncompleteItems(addOrUpdateDrillConfigItem(incompleteItems, item));
    // };
    //
    // const onAddItem = (item: IDrillConfigItem, target: DrillActionTarget) => {
    //     props.onAddItem(item, props.widgetRef, target);
    //     deleteIncompleteItem(item);
    // };
    //
    // const onDeleteItem = (item: IDrillConfigItem) => {
    //     props.onDeleteItem(item, props.widgetRef);
    //     if (!item.complete) {
    //         deleteIncompleteItem(item);
    //     }
    // };
    //
    // const onMeasureSelect = (selectedItem: IAvailableDrillTargetMeasure) => {
    //     console.log(selectedItem);
    //     // const incompleteItem: IDrillConfigItem = {
    //     //     type: "measure",
    //     //     localIdentifier: selectedItem.measure.measureHeaderItem.localIdentifier,
    //     //     title: selectedItem.measure.measureHeaderItem.name,
    //     //     attributes: selectedItem.attributes,
    //     //     drillTargetType: undefined,
    //     //     complete: false,
    //     // };
    //     // addIncompleteItem(incompleteItem);
    // };
    //
    // const onChangeItem = (changedItem: IDrillConfigItem) => {
    //     const incompleteItem: IDrillConfigItem = {
    //         ...changedItem,
    //         complete: false,
    //     };
    //     addIncompleteItem(incompleteItem);
    // };
    //
    // const shouldShowPanel = configItems.length || selectorItems.length;
    //
    // if (!shouldShowPanel) {
    //     return null;
    // }

    const enabledDrillTargetTypeItems = useDrillTargetTypeItems();

    const onOriginSelect = (selectedItem: IAvailableDrillTargetItem) => {
        console.log(selectedItem);
        // if (isAvailableDrillTargetMeasure(selectedItem)) {
        //     const incompleteMeasureItem: IDrillConfigItem = {
        //         type: "measure",
        //         localIdentifier: selectedItem.measure.measureHeaderItem.localIdentifier,
        //         title: selectedItem.measure.measureHeaderItem.name,
        //         attributes: selectedItem.attributes,
        //         drillTargetType: undefined,
        //         complete: false,
        //     };
        //
        //     addIncompleteItem(incompleteMeasureItem);
        // } else {
        //     const incompleteAttributeItem: IDrillConfigItem = {
        //         type: "attribute",
        //         localIdentifier: selectedItem.attribute.attributeHeader.localIdentifier,
        //         title: selectedItem.attribute.attributeHeader.formOf.name,
        //         attributes: selectedItem.intersectionAttributes,
        //         drillTargetType: undefined,
        //         complete: false,
        //     };
        //
        //     addIncompleteItem(incompleteAttributeItem);
        // }
    };

    const configItems = useDashboardSelector(selectDrillTargetsByWidgetRef(widgetRef));
    const widget = useDashboardSelector(selectWidgetByRef(widgetRef));

    invariant(isInsightWidget(widget), "must be insight widget");

    const drillItems = configItems?.availableDrillTargets
        ? getMappedConfigForWidget(widget.drills, configItems?.availableDrillTargets)
        : [];
    console.log(widget.drills);

    const dispatch = useDashboardDispatch();

    return (
        <div className="configuration-category s-drill-config-panel">
            <Typography tagName="h3">
                <span>
                    <FormattedMessage id="configurationPanel.drillConfig.interactions" />
                </span>
            </Typography>
            <InsightDrillConfigList
                drillConfigItems={drillItems}
                // onDelete={onDeleteItem}
                onSetup={(drill: InsightDrillDefinition) =>
                    dispatch(modifyDrillsForInsightWidget(widgetRef, [drill]))
                }
                // onIncompleteChange={onChangeItem}
                enabledDrillTargetTypeItems={enabledDrillTargetTypeItems}
            />
            {configItems?.availableDrillTargets?.measures && (
                <DrillOriginSelector items={configItems?.availableDrillTargets} onSelect={onOriginSelect} />
            )}
        </div>
    );
};

// const mapStateToProps = (appState: AppState): IDrillConfigPanelStateProps => {
//     const widgetRef = getSelectedWidgetRef(appState);
//
//     return {
//         widgetRef,
//         drillConfigItems: getUsedDrillConfig(appState, widgetRef),
//         supportedItems: getUnusedDrillConfig(appState, widgetRef),
//         featureFlags: getConfigs(appState),
//     };
// };
//
// const mapDispatchToProps: IDrillConfigPanelDispatchProps = {
//     onAddItem: (item: IDrillConfigItem, widgetRef: ObjRef, target: DrillActionTarget) =>
//         createDrillAddedAction(item.localIdentifier, widgetRef, target),
//     onDeleteItem: (item: IDrillConfigItem, widgetRef: ObjRef) =>
//         createDrillRemovedAction(item.localIdentifier, widgetRef),
// };
//
// export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(DrillConfigPanel));

// (C) 2007-2022 GoodData Corporation
import { isInsightWidget } from "@gooddata/sdk-model";
import React, { useState } from "react";

import {
    selectSelectedWidgetRef,
    selectWidgetByRef,
    useDashboardSelector,
    useDashboardDispatch,
    uiActions,
} from "../../../../model";
import { SelectedItemType } from "../../common/configuration/types";
import { InsightConfiguration } from "./InsightConfiguration";
import InsightConfigurationItems from "./InsightConfigurationItems";
import invariant from "ts-invariant";

export interface IConfigurationPanelProps {
    handleSetConfigMenuDisplay?: (value: boolean) => void;
}

export default function InsightConfigurationPanel(props: IConfigurationPanelProps) {
    const widgetRef = useDashboardSelector(selectSelectedWidgetRef);
    const widget = useDashboardSelector(selectWidgetByRef(widgetRef));

    invariant(widget && isInsightWidget(widget), "must have insight widget selected");

    const dispatch = useDashboardDispatch();
    const [selectedItemType, setSelectedItemType] = useState<SelectedItemType>();

    const selectInsightMenuItem = (menuItemType?: SelectedItemType) => {
        props.handleSetConfigMenuDisplay?.(menuItemType === undefined);
        setSelectedItemType(menuItemType);
    };

    const onCloseButtonClick = () => {
        dispatch(uiActions.setConfigurationPanelOpened(false));
    };

    if (selectedItemType === "configuration" || selectedItemType === "interactions") {
        return (
            <InsightConfiguration
                widget={widget}
                selectedItemType={selectedItemType}
                handleConfigurationHeaderClick={selectInsightMenuItem}
                onCloseButtonClick={onCloseButtonClick}
            />
        );
    } else {
        // const isDrillingEnabled = [
        //     this.props.isEnableKPIDashboardDrillToDashboard,
        //     this.props.isEnableKPIDashboardDrillToInsight,
        //     this.props.isEnableKPIDashboardDrillToUrl,
        // ].some((isEnabled) => isEnabled === true);

        return (
            <InsightConfigurationItems
                onCloseButtonClick={onCloseButtonClick}
                // onWidgetDelete={onWidgetDelete}
                selectedWidget={widget}
                // handleInteractionsItemClick={this.onInteractionsItemClick}// TODO other interactions
                handleConfigurationItemClick={() => selectInsightMenuItem("configuration")}
                // handleRenderInsightConfiguration={handleSetConfigMenuDisplay}
                // showInteractionItem={isDrillingEnabled && hasSupportedDrillItems}
                // isHidingOfWidgetTitleEnabled={isHidingOfWidgetTitleEnabled}
            />
        );
    }
    //
    // private onInteractionsItemClick = () => {
    //     this.selectInsightMenuItem(INTERACTIONS);
    // };
    //
    // private isEnableDrilling() {
    //     return (
    //         this.props.isEnableKPIDashboardDrillToInsight ||
    //         this.props.isEnableKPIDashboardDrillToDashboard ||
    //         this.props.isEnableKPIDashboardDrillToUrl
    //     );
    // }
    //
    //
    // private renderInteractionSection() {
    //     const { isEnableKDZooming, widgetRef } = this.props;
    //     return (
    //         <React.Fragment>
    //             {isEnableKDZooming && <ZoomInsightConfiguration widgetRef={widgetRef} />}
    //             {this.isEnableDrilling() && <DrillConfigPanel />}
    //         </React.Fragment>
    //     );
    // }
}

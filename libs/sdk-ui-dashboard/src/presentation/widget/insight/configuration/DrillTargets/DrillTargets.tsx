// (C) 2020-2022 GoodData Corporation
import React from "react";
import { IDrillToInsight, IInsight, InsightDrillDefinition } from "@gooddata/sdk-model";
import { DRILL_TARGET_TYPE, IDrillConfigItem, isDrillToInsightConfig } from "../../../../drill/types";
import { DrillTargetInsightItem } from "./DrillTargetInsightItem";

export interface IDrillTargetsProps {
    item: IDrillConfigItem;
    onSetup: (drill: InsightDrillDefinition) => void;
}

export const DrillTargets: React.FunctionComponent<IDrillTargetsProps> = (props) => {
    const { item } = props;
    const onInsightTargetSelect = (targetItem: IInsight) => {
        const drillConfigItem: IDrillToInsight = {
            transition: "pop-up",
            origin: {
                type: "drillFromMeasure",
                measure: { localIdentifier: item.localIdentifier },
            },
            type: "drillToInsight",
            target: targetItem.insight.ref,
        };
        props.onSetup(drillConfigItem);
    };
    //
    // const onDashboardTargetSelect = (targetItem: IDashboardsListItem) => {
    //     const dashboard = idRef(targetItem.id, "analyticalDashboard");
    //     const drillConfigItem: IDrillToDashboardConfig = {
    //         ...props.item,
    //         drillTargetType: DRILL_TARGET_TYPE.DRILL_TO_DASHBOARD,
    //         dashboard,
    //         complete: true,
    //     };
    //     props.onSetup(drillConfigItem, { dashboard });
    // };
    //
    // const onCustomUrlTargetSelect = (selectedUrlDrillTarget: UrlDrillTarget) => {
    //     const drillConfigItem: IDrillToUrlConfig = {
    //         ...props.item,
    //         drillTargetType: DRILL_TARGET_TYPE.DRILL_TO_URL,
    //         urlDrillTarget: selectedUrlDrillTarget,
    //         complete: true,
    //     };
    //     props.onSetup(drillConfigItem, { urlDrillTarget: selectedUrlDrillTarget });
    // };

    switch (props.item.drillTargetType) {
        case DRILL_TARGET_TYPE.DRILL_TO_DASHBOARD:
            // return (
            //     <DrillTargetDashboardItem
            //         selected={isDrillToDashboardConfig(item) ? item.dashboard : undefined}
            //         onSelect={onDashboardTargetSelect}
            //     />
            // );
            return null;
        case DRILL_TARGET_TYPE.DRILL_TO_INSIGHT:
            return (
                <>
                    {isDrillToInsightConfig(item) && (
                        <DrillTargetInsightItem insight={item} onSelect={onInsightTargetSelect} />
                    )}
                </>
            );
        case DRILL_TARGET_TYPE.DRILL_TO_URL:
            // return (
            // <DrillTargetUrlItem
            //     urlDrillTarget={isDrillToUrlConfig(item) ? item.urlDrillTarget : undefined}
            //     attributes={item.attributes}
            //     onSelect={onCustomUrlTargetSelect}
            // />
            // );
            return null;
        case undefined:
            return null;
        default:
            unknownDrillTargetTypeReceived(props.item.drillTargetType);
    }

    function unknownDrillTargetTypeReceived(targetType: never) {
        throw new Error(`unknown drill target type: ${targetType}`);
    }

    return null;
};

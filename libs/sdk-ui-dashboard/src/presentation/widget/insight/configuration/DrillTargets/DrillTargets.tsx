// (C) 2020-2022 GoodData Corporation
import React from "react";
import {
    idRef,
    IDrillToDashboard,
    IDrillToInsight,
    IInsight,
    InsightDrillDefinition,
    IDrillToCustomUrl,
    IDrillToAttributeUrl,
    DrillOrigin,
} from "@gooddata/sdk-model";
import {
    DRILL_TARGET_TYPE,
    IDrillConfigItem,
    isDrillToDashboardConfig,
    isDrillToUrlConfig,
    UrlDrillTarget,
    isDrillToCustomUrlConfig,
    isDrillToAttributeUrlConfig,
} from "../../../../drill/types.js";
import { DrillTargetInsightItem } from "./DrillTargetInsightItem.js";
import { DrillTargetUrlItem } from "./DrillTargetUrlItem.js";
import { DrillTargetDashboardItem } from "./DrillTargetDashboardItem.js";
import { IDrillableDashboardListItem } from "../../../../dashboardList/index.js";

export interface IDrillTargetsProps {
    item: IDrillConfigItem;
    onSetup: (drill: InsightDrillDefinition, changedItem: IDrillConfigItem) => void;
}

export const DrillTargets: React.FunctionComponent<IDrillTargetsProps> = (props) => {
    const { item } = props;
    const onInsightTargetSelect = (targetItem: IInsight) => {
        const drillConfigItem: IDrillToInsight = {
            transition: "pop-up",
            origin: getOrigin(item),
            type: "drillToInsight",
            target: targetItem.insight.ref,
        };
        props.onSetup(drillConfigItem, { ...item, insightRef: targetItem.insight.ref });
    };

    const onDashboardTargetSelect = (targetItem: IDrillableDashboardListItem) => {
        const dashboard = idRef(targetItem.identifier, "analyticalDashboard");
        const drillConfigItem: IDrillToDashboard = {
            transition: "in-place",
            origin: getOrigin(item),
            type: "drillToDashboard",
            target: dashboard,
        };
        props.onSetup(drillConfigItem, { ...item, dashboard });
    };

    const onCustomUrlTargetSelect = (urlDrillTarget: UrlDrillTarget) => {
        if (isDrillToCustomUrlConfig(urlDrillTarget)) {
            const drillConfigItem: IDrillToCustomUrl = {
                transition: "new-window",
                origin: getOrigin(item),
                type: "drillToCustomUrl",
                target: {
                    url: urlDrillTarget.customUrl,
                },
            };
            props.onSetup(drillConfigItem, { ...item, urlDrillTarget });
        }
        if (isDrillToAttributeUrlConfig(urlDrillTarget)) {
            const drillConfigItem: IDrillToAttributeUrl = {
                transition: "new-window",
                origin: getOrigin(item),
                type: "drillToAttributeUrl",
                target: {
                    hyperlinkDisplayForm: urlDrillTarget.drillToAttributeDisplayForm,
                    displayForm: urlDrillTarget.insightAttributeDisplayForm,
                },
            };
            props.onSetup(drillConfigItem, { ...item, urlDrillTarget });
        }
    };

    switch (props.item.drillTargetType) {
        case DRILL_TARGET_TYPE.DRILL_TO_DASHBOARD:
            return (
                <DrillTargetDashboardItem
                    selected={isDrillToDashboardConfig(item) ? item.dashboard : undefined}
                    onSelect={onDashboardTargetSelect}
                />
            );
        case DRILL_TARGET_TYPE.DRILL_TO_INSIGHT:
            return <DrillTargetInsightItem insight={item} onSelect={onInsightTargetSelect} />;
        case DRILL_TARGET_TYPE.DRILL_TO_URL:
            return (
                <DrillTargetUrlItem
                    urlDrillTarget={isDrillToUrlConfig(item) ? item.urlDrillTarget : undefined}
                    attributes={item.attributes}
                    onSelect={onCustomUrlTargetSelect}
                />
            );
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

function getOrigin(item: IDrillConfigItem): DrillOrigin {
    return item.type === "attribute"
        ? {
              type: "drillFromAttribute",
              attribute: { localIdentifier: item.localIdentifier },
          }
        : {
              type: "drillFromMeasure",
              measure: { localIdentifier: item.localIdentifier },
          };
}

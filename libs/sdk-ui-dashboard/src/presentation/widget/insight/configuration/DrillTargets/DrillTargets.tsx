// (C) 2020-2025 GoodData Corporation

import {
    DrillOrigin,
    ICatalogAttributeHierarchy,
    ICatalogDateAttributeHierarchy,
    IDrillToAttributeUrl,
    IDrillToCustomUrl,
    IDrillToDashboard,
    IDrillToInsight,
    IInsight,
    InsightDrillDefinition,
    getHierarchyRef,
    idRef,
} from "@gooddata/sdk-model";

import DrillTargetAttributeHierarchyItem from "./DrillTargetAttributeHierarchyItem.js";
import { DrillTargetDashboardItem } from "./DrillTargetDashboardItem.js";
import { DrillTargetInsightItem } from "./DrillTargetInsightItem.js";
import { DrillTargetUrlItem } from "./DrillTargetUrlItem.js";
import { IDrillableDashboardListItem } from "../../../../dashboardList/index.js";
import {
    DRILL_TARGET_TYPE,
    IDrillConfigItem,
    IDrillDownAttributeHierarchyConfig,
    IDrillDownAttributeHierarchyDefinition,
    UrlDrillTarget,
    isDrillToAttributeUrlConfig,
    isDrillToCustomUrlConfig,
    isDrillToDashboardConfig,
    isDrillToUrlConfig,
} from "../../../../drill/types.js";

export interface IDrillTargetsProps {
    item: IDrillConfigItem;
    onSetup: (
        drill: InsightDrillDefinition | IDrillDownAttributeHierarchyDefinition,
        changedItem: IDrillConfigItem,
    ) => void;
    onDeleteInteraction: () => void;
}

export function DrillTargets(props: IDrillTargetsProps) {
    const { item, onDeleteInteraction } = props;
    const onDrillDownTargetSelect = (
        targetItem: ICatalogAttributeHierarchy | ICatalogDateAttributeHierarchy,
    ) => {
        const hierarchyRef = getHierarchyRef(targetItem);

        const drillDownItem: IDrillDownAttributeHierarchyDefinition = {
            attributeHierarchyRef: (item as IDrillDownAttributeHierarchyConfig).attributeHierarchyRef,
            type: "drillDownAttributeHierarchy",
            attributes: item.attributes,
            originLocalIdentifier: item.originLocalIdentifier,
            drillIntersectionIgnoredAttributes: item.drillIntersectionIgnoredAttributes ?? [],
        };

        props.onSetup(drillDownItem, { ...item, attributeHierarchyRef: hierarchyRef } as IDrillConfigItem);
    };
    const onInsightTargetSelect = (targetItem: IInsight) => {
        const drillConfigItem: IDrillToInsight = {
            localIdentifier: item.localIdentifier,
            transition: "pop-up",
            origin: getOrigin(item),
            type: "drillToInsight",
            target: targetItem.insight.ref,
            drillIntersectionIgnoredAttributes: item.drillIntersectionIgnoredAttributes,
        };
        props.onSetup(drillConfigItem, { ...item, insightRef: targetItem.insight.ref });
    };

    const onDashboardTargetSelect = (targetItem: IDrillableDashboardListItem, selectedTab?: string) => {
        const dashboard = idRef(targetItem.identifier, "analyticalDashboard");
        const drillConfigItem: IDrillToDashboard = {
            localIdentifier: item.localIdentifier,
            transition: "in-place",
            origin: getOrigin(item),
            type: "drillToDashboard",
            target: dashboard,
            targetTabLocalIdentifier: selectedTab,
            drillIntersectionIgnoredAttributes: item.drillIntersectionIgnoredAttributes,
        };
        props.onSetup(drillConfigItem, { ...item, dashboard, dashboardTab: selectedTab });
    };

    const onCustomUrlTargetSelect = (urlDrillTarget: UrlDrillTarget) => {
        if (isDrillToCustomUrlConfig(urlDrillTarget)) {
            const drillConfigItem: IDrillToCustomUrl = {
                localIdentifier: item.localIdentifier,
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
                localIdentifier: item.localIdentifier,
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
                    selectedTab={isDrillToDashboardConfig(item) ? item.dashboardTab : undefined}
                    onSelect={onDashboardTargetSelect}
                />
            );
        case DRILL_TARGET_TYPE.DRILL_TO_INSIGHT:
            return <DrillTargetInsightItem insight={item} onSelect={onInsightTargetSelect} />;
        case DRILL_TARGET_TYPE.DRILL_TO_URL:
            return (
                <DrillTargetUrlItem
                    widgetRef={item.widgetRef}
                    urlDrillTarget={isDrillToUrlConfig(item) ? item.urlDrillTarget : undefined}
                    attributes={item.attributes}
                    onSelect={onCustomUrlTargetSelect}
                />
            );
        case DRILL_TARGET_TYPE.DRILL_DOWN:
            return (
                <DrillTargetAttributeHierarchyItem
                    onSelect={onDrillDownTargetSelect}
                    onDeleteInteraction={onDeleteInteraction}
                    config={item as IDrillDownAttributeHierarchyConfig}
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
}

function getOrigin(item: IDrillConfigItem): DrillOrigin {
    return item.type === "attribute"
        ? {
              type: "drillFromAttribute",
              attribute: { localIdentifier: item.originLocalIdentifier },
          }
        : {
              type: "drillFromMeasure",
              measure: { localIdentifier: item.originLocalIdentifier },
          };
}

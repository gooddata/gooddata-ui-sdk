// (C) 2022 GoodData Corporation
import {
    IDrillToDashboard,
    IDrillToInsight,
    InsightDrillDefinition,
    isDrillFromAttribute,
    isDrillToAttributeUrl,
    isDrillToCustomUrl,
    isDrillToDashboard,
    isDrillToInsight,
    ObjRef,
    objRefToString,
} from "@gooddata/sdk-model";
import { IAvailableDrillTargets } from "@gooddata/sdk-ui";
import { defineMessage } from "react-intl";
import {
    getDrillOriginLocalIdentifier,
    getLocalIdentifierOrDie,
    getValidDrillOriginAttributes,
} from "../../../../../_staging/drills/drillingUtils.js";
import {
    DRILL_TARGET_TYPE,
    IDrillConfigItem,
    IDrillConfigItemBase,
    IDrillDownAttributeHierarchyConfig,
    IDrillToDashboardConfig,
    IDrillToInsightConfig,
    IDrillToUrl,
    IDrillToUrlConfig,
    isDrillToUrl,
    UrlDrillTarget,
} from "../../../../drill/types.js";
import { IGlobalDrillDownAttributeHierarchyDefinition } from "../../../../../types.js";

function getTitleFromDrillableItemPushData(items: IAvailableDrillTargets, itemId: string): string {
    const measureItems = items.measures || [];
    const measureResult = measureItems.find(
        (measureResult) => measureResult.measure.measureHeaderItem.localIdentifier === itemId,
    );

    if (measureResult) {
        return measureResult.measure.measureHeaderItem.name;
    }

    const attributeItems = items.attributes || [];
    const attributeResult = attributeItems.find(
        (attributeItem) => attributeItem.attribute.attributeHeader.localIdentifier === itemId,
    );

    return attributeResult ? attributeResult.attribute.attributeHeader.formOf.name : "";
}

const buildUrlDrillTarget = (drillData: IDrillToUrl): UrlDrillTarget => {
    if (isDrillToCustomUrl(drillData)) {
        const customUrl = drillData.target.url;
        return {
            customUrl,
        };
    }
    if (isDrillToAttributeUrl(drillData)) {
        const {
            displayForm: insightAttributeDisplayForm,
            hyperlinkDisplayForm: drillToAttributeDisplayForm,
        } = drillData.target;

        return {
            insightAttributeDisplayForm,
            drillToAttributeDisplayForm,
        };
    }
    throw new Error("Unsupported URL drill type!");
};

const createInsightConfig = (
    drillData: IDrillToInsight,
    supportedItemsForWidget: IAvailableDrillTargets,
    widgetRef: ObjRef,
): IDrillToInsightConfig => {
    const originLocalIdentifier = isDrillFromAttribute(drillData.origin)
        ? getLocalIdentifierOrDie(drillData.origin?.attribute)
        : getLocalIdentifierOrDie(drillData.origin?.measure);

    return {
        type: isDrillFromAttribute(drillData.origin) ? "attribute" : "measure",
        originLocalIdentifier,
        title: getTitleFromDrillableItemPushData(supportedItemsForWidget, originLocalIdentifier),
        attributes: getValidDrillOriginAttributes(supportedItemsForWidget, originLocalIdentifier),
        localIdentifier: drillData.localIdentifier!,
        drillTargetType: DRILL_TARGET_TYPE.DRILL_TO_INSIGHT,
        insightRef: drillData.target,
        complete: true,
        widgetRef: widgetRef,
    };
};

const createDashboardConfig = (
    drillData: IDrillToDashboard,
    supportedItemsForWidget: IAvailableDrillTargets,
    widgetRef: ObjRef,
): IDrillToDashboardConfig => {
    const originLocalIdentifier = isDrillFromAttribute(drillData.origin)
        ? getLocalIdentifierOrDie(drillData.origin?.attribute)
        : getLocalIdentifierOrDie(drillData.origin?.measure);

    return {
        type: isDrillFromAttribute(drillData.origin) ? "attribute" : "measure",
        originLocalIdentifier,
        title: getTitleFromDrillableItemPushData(supportedItemsForWidget, originLocalIdentifier),
        attributes: getValidDrillOriginAttributes(supportedItemsForWidget, originLocalIdentifier),
        localIdentifier: drillData.localIdentifier!,
        drillTargetType: DRILL_TARGET_TYPE.DRILL_TO_DASHBOARD,
        dashboard: drillData.target,
        complete: true,
        widgetRef: widgetRef,
    };
};

const invalidUrlMessage = defineMessage({
    id: "configurationPanel.drillConfig.drillIntoUrl.invalidCustomUrl",
});

const createUrlConfig = (
    drillData: IDrillToUrl,
    supportedItemsForWidget: IAvailableDrillTargets,
    invalidCustomUrlDrillLocalIds: string[],
    widgetRef: ObjRef,
): IDrillToUrlConfig => {
    const originLocalIdentifier = getDrillOriginLocalIdentifier(drillData);

    const hasWarning = invalidCustomUrlDrillLocalIds.includes(originLocalIdentifier);

    return {
        type: isDrillFromAttribute(drillData.origin) ? "attribute" : "measure",
        originLocalIdentifier,
        title: getTitleFromDrillableItemPushData(supportedItemsForWidget, originLocalIdentifier),
        attributes: getValidDrillOriginAttributes(supportedItemsForWidget, originLocalIdentifier),
        localIdentifier: drillData.localIdentifier!,
        drillTargetType: DRILL_TARGET_TYPE.DRILL_TO_URL,
        urlDrillTarget: buildUrlDrillTarget(drillData),
        complete: true,
        warning: hasWarning ? invalidUrlMessage.id : undefined,
        widgetRef: widgetRef,
    };
};

const createImplicitConfig = (): IDrillConfigItemBase => {
    return null as unknown as IDrillConfigItemBase;
};

const createConfig = (
    drillData: InsightDrillDefinition,
    supportedItemsForWidget: IAvailableDrillTargets,
    invalidCustomUrlDrillLocalIds: string[],
    widgetRef: ObjRef,
) => {
    if (isDrillToInsight(drillData)) {
        return createInsightConfig(drillData, supportedItemsForWidget, widgetRef);
    }

    if (isDrillToDashboard(drillData)) {
        return createDashboardConfig(drillData, supportedItemsForWidget, widgetRef);
    }

    if (isDrillToUrl(drillData)) {
        return createUrlConfig(drillData, supportedItemsForWidget, invalidCustomUrlDrillLocalIds, widgetRef);
    }

    return createImplicitConfig();
};

/**
 * @internal
 */
export const getMappedConfigForWidget = (
    configForWidget: InsightDrillDefinition[],
    supportedItemsForWidget: IAvailableDrillTargets,
    invalidCustomUrlDrillLocalIds: string[],
    widgetRef: ObjRef,
): IDrillConfigItem[] => {
    return configForWidget.map((item) =>
        createConfig(item, supportedItemsForWidget, invalidCustomUrlDrillLocalIds, widgetRef),
    );
};

/**
 * @internal
 */
export const getGlobalDrillDownMappedConfigForWidget = (
    widgetGlobalDrillDowns: IGlobalDrillDownAttributeHierarchyDefinition[],
    supportedItemsForWidget: IAvailableDrillTargets,
    widgetRef: ObjRef,
): IDrillDownAttributeHierarchyConfig[] => {
    return widgetGlobalDrillDowns.map((globalDrillDown) => {
        const originLocalIdentifier = getDrillOriginLocalIdentifier(globalDrillDown);
        const localIdentifier = `${originLocalIdentifier}_${objRefToString(globalDrillDown.target)}`;

        return {
            type: "attribute",
            drillTargetType: DRILL_TARGET_TYPE.DRILL_DOWN,
            attributeHierarchyRef: globalDrillDown.target,
            originLocalIdentifier: originLocalIdentifier,
            title: getTitleFromDrillableItemPushData(supportedItemsForWidget, originLocalIdentifier),
            attributes: getValidDrillOriginAttributes(supportedItemsForWidget, originLocalIdentifier),
            localIdentifier,
            complete: true,
            widgetRef: widgetRef,
        };
    });
};

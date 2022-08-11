// (C) 2022 GoodData Corporation

import {
    IAttributeDescriptor,
    IDrillToDashboard,
    IDrillToInsight,
    InsightDrillDefinition,
    isDrillFromAttribute,
    isDrillToAttributeUrl,
    isDrillToCustomUrl,
    isDrillToDashboard,
    isDrillToInsight,
    isLocalIdRef,
    ObjRefInScope,
} from "@gooddata/sdk-model";
import {
    IAvailableDrillTargetAttribute,
    IAvailableDrillTargetMeasure,
    IAvailableDrillTargets,
} from "@gooddata/sdk-ui";
import {
    DRILL_TARGET_TYPE,
    IDrillConfigItem,
    IDrillConfigItemBase,
    IDrillToDashboardConfig,
    IDrillToInsightConfig,
    IDrillToUrl,
    IDrillToUrlConfig,
    isDrillToUrl,
    UrlDrillTarget,
} from "../../../drill/types";

const localIdOrDie = (ref: ObjRefInScope): string => {
    if (isLocalIdRef(ref)) {
        return ref.localIdentifier;
    }

    throw new Error("invalid invariant");
};

const getTitleFromDrillableItemPushData = (items: IAvailableDrillTargets, itemId: string): string => {
    const measureItems = items.measures || [];
    const measureResult = measureItems.find(
        (measureResult: IAvailableDrillTargetMeasure) =>
            measureResult.measure.measureHeaderItem.localIdentifier === itemId,
    );

    if (!measureResult) {
        const attributeItems = items.attributes || [];
        const attributeResult = attributeItems.find(
            (attributeItem: IAvailableDrillTargetAttribute) =>
                attributeItem.attribute.attributeHeader.localIdentifier === itemId,
        );

        return attributeResult ? attributeResult.attribute.attributeHeader.formOf.name : "";
    }

    return measureResult.measure.measureHeaderItem.name;
};

const getAttributes = (
    supportedItemsForWidget: IAvailableDrillTargets,
    localIdentifier: string,
): IAttributeDescriptor[] => {
    const measureItems: IAvailableDrillTargetMeasure[] = supportedItemsForWidget.measures || [];
    const supportedItems = measureItems.find(
        (item) => item.measure.measureHeaderItem.localIdentifier === localIdentifier,
    );
    return supportedItems ? supportedItems.attributes : [];
};

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
): IDrillToInsightConfig => {
    const localIdentifier = isDrillFromAttribute(drillData.origin)
        ? localIdOrDie(drillData.origin?.attribute)
        : localIdOrDie(drillData.origin?.measure);

    return {
        type: isDrillFromAttribute(drillData.origin) ? "attribute" : "measure",
        localIdentifier,
        title: getTitleFromDrillableItemPushData(supportedItemsForWidget, localIdentifier),
        attributes: getAttributes(supportedItemsForWidget, localIdentifier),
        drillTargetType: DRILL_TARGET_TYPE.DRILL_TO_INSIGHT,
        insightRef: drillData.target,
        complete: true,
    };
};

const createDashboardConfig = (
    drillData: IDrillToDashboard,
    supportedItemsForWidget: IAvailableDrillTargets,
): IDrillToDashboardConfig => {
    const localIdentifier = isDrillFromAttribute(drillData.origin)
        ? localIdOrDie(drillData.origin?.attribute)
        : localIdOrDie(drillData.origin?.measure);

    return {
        type: isDrillFromAttribute(drillData.origin) ? "attribute" : "measure",
        localIdentifier,
        title: getTitleFromDrillableItemPushData(supportedItemsForWidget, localIdentifier),
        attributes: getAttributes(supportedItemsForWidget, localIdentifier),
        drillTargetType: DRILL_TARGET_TYPE.DRILL_TO_DASHBOARD,
        dashboard: drillData.target,
        complete: true,
    };
};

const createUrlConfig = (
    drillData: IDrillToUrl,
    supportedItemsForWidget: IAvailableDrillTargets,
): IDrillToUrlConfig => {
    const localIdentifier = isDrillFromAttribute(drillData.origin)
        ? localIdOrDie(drillData.origin?.attribute)
        : localIdOrDie(drillData.origin?.measure);

    return {
        type: isDrillFromAttribute(drillData.origin) ? "attribute" : "measure",
        localIdentifier,
        title: getTitleFromDrillableItemPushData(supportedItemsForWidget, localIdentifier),
        attributes: getAttributes(supportedItemsForWidget, localIdentifier),
        drillTargetType: DRILL_TARGET_TYPE.DRILL_TO_URL,
        urlDrillTarget: buildUrlDrillTarget(drillData),
        complete: true,
    };
};

const createImplicitConfig = (): IDrillConfigItemBase => {
    return null as unknown as IDrillConfigItemBase;
};

const createConfig = (drillData: InsightDrillDefinition, supportedItemsForWidget: IAvailableDrillTargets) => {
    if (isDrillToInsight(drillData)) {
        return createInsightConfig(drillData, supportedItemsForWidget);
    }

    if (isDrillToDashboard(drillData)) {
        return createDashboardConfig(drillData, supportedItemsForWidget);
    }

    if (isDrillToUrl(drillData)) {
        return createUrlConfig(drillData, supportedItemsForWidget);
    }

    return createImplicitConfig();
};

export const getMappedConfigForWidget = (
    configForWidget: InsightDrillDefinition[],
    supportedItemsForWidget: IAvailableDrillTargets,
): IDrillConfigItem[] => {
    return configForWidget.map((item) => createConfig(item, supportedItemsForWidget));
};

// (C) 2022-2025 GoodData Corporation

import { defineMessage } from "react-intl";

import {
    type IDrillToDashboard,
    type IDrillToInsight,
    type IInsightWidget,
    type InsightDrillDefinition,
    type ObjRef,
    areObjRefsEqual,
    drillDownReferenceAttributeRef,
    isDrillFromAttribute,
    isDrillToAttributeUrl,
    isDrillToCustomUrl,
    isDrillToDashboard,
    isDrillToInsight,
    objRefToString,
} from "@gooddata/sdk-model";
import { type IAvailableDrillTargets } from "@gooddata/sdk-ui";

import {
    getDrillOriginLocalIdentifier,
    getLocalIdentifierOrDie,
    getValidDrillOriginAttributes,
    isDrillDownIntersectionIgnoredAttributesForHierarchy,
} from "../../../../../_staging/drills/drillingUtils.js";
import {
    type IDrillToUrlAttributeDefinition,
    type IGlobalDrillDownAttributeHierarchyDefinition,
} from "../../../../../types.js";
import {
    DRILL_TARGET_TYPE,
    type IDrillConfigItem,
    type IDrillConfigItemBase,
    type IDrillDownAttributeHierarchyConfig,
    type IDrillToDashboardConfig,
    type IDrillToInsightConfig,
    type IDrillToUrl,
    type IDrillToUrlConfig,
    type UrlDrillTarget,
    isDrillToUrl,
} from "../../../../drill/types.js";

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
        drillIntersectionIgnoredAttributes: drillData.drillIntersectionIgnoredAttributes,
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
        dashboardTab: drillData.targetTabLocalIdentifier,
        complete: true,
        widgetRef: widgetRef,
        drillIntersectionIgnoredAttributes: drillData.drillIntersectionIgnoredAttributes,
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
    widget: IInsightWidget,
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
            drillIntersectionIgnoredAttributes: getIntersectionIgnoredAttributeLocalIdentifiersForDrillDown(
                widget,
                globalDrillDown,
                supportedItemsForWidget,
            ),
            localIdentifier,
            complete: true,
            widgetRef: widget.ref,
        };
    });
};

/**
 * @internal
 */
export const getDrillToUrlMappedConfigForWidget = (
    widgetDrillToUrls: IDrillToUrlAttributeDefinition[],
    supportedItemsForWidget: IAvailableDrillTargets,
    widget: IInsightWidget,
): IDrillToUrlConfig[] => {
    return widgetDrillToUrls.map((drillToUrl): IDrillToUrlConfig => {
        const originLocalIdentifier = getDrillOriginLocalIdentifier(drillToUrl);
        const localIdentifier = `${originLocalIdentifier}_${objRefToString(drillToUrl.target)}`;
        const insightAttributeDisplayForm = supportedItemsForWidget.attributes?.find(
            (attribute) => attribute.attribute.attributeHeader.localIdentifier === originLocalIdentifier,
        )?.attribute.attributeHeader.ref;

        if (!insightAttributeDisplayForm) {
            throw new Error(
                `Insight attribute display form not found for origin local identifier: ${originLocalIdentifier}`,
            );
        }

        return {
            type: "attribute",
            drillTargetType: DRILL_TARGET_TYPE.DRILL_TO_URL,
            originLocalIdentifier: originLocalIdentifier,
            title: getTitleFromDrillableItemPushData(supportedItemsForWidget, originLocalIdentifier),
            attributes: getValidDrillOriginAttributes(supportedItemsForWidget, originLocalIdentifier),
            localIdentifier,
            complete: true,
            widgetRef: widget.ref,
            urlDrillTarget: {
                insightAttributeDisplayForm,
                drillToAttributeDisplayForm: drillToUrl.target,
                implicit: true,
            },
        };
    });
};

function getIntersectionIgnoredAttributeLocalIdentifiersForDrillDown(
    widget: IInsightWidget,
    globalDrillDownDefinition: IGlobalDrillDownAttributeHierarchyDefinition,
    supportedItemsForWidget: IAvailableDrillTargets,
): string[] {
    const attributeOriginLocalIdentifier = getDrillOriginLocalIdentifier(globalDrillDownDefinition);
    const attribute = supportedItemsForWidget.attributes?.find(
        (attribute) => attribute.attribute.attributeHeader.localIdentifier === attributeOriginLocalIdentifier,
    );

    const drillIntersectionIgnoredAttributes = attribute
        ? widget.drillDownIntersectionIgnoredAttributes?.find((drillDownIgnoredDrillIntersection) => {
              const attributeRef = drillDownReferenceAttributeRef(
                  drillDownIgnoredDrillIntersection.drillDownReference,
              );

              return (
                  areObjRefsEqual(attributeRef, attribute.attribute.attributeHeader.formOf.ref) &&
                  isDrillDownIntersectionIgnoredAttributesForHierarchy(
                      drillDownIgnoredDrillIntersection,
                      globalDrillDownDefinition.target,
                  )
              );
          })
        : undefined;

    return drillIntersectionIgnoredAttributes?.ignoredAttributes ?? [];
}

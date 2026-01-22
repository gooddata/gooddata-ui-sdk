// (C) 2022-2026 GoodData Corporation

import { useCallback, useMemo } from "react";

import { defineMessages } from "react-intl";
import { invariant } from "ts-invariant";

import {
    type ICatalogAttributeHierarchy,
    type ICatalogDateAttributeHierarchy,
    type IDrillDownReference,
    type InsightDrillDefinition,
    type ObjRef,
    areObjRefsEqual,
    getHierarchyRef,
    idRef,
    isCatalogDateAttributeHierarchy,
    isInsightWidget,
    localIdRef,
} from "@gooddata/sdk-model";
import { type IAvailableDrillTargets } from "@gooddata/sdk-ui";
import { useToastMessage } from "@gooddata/sdk-ui-kit";

import {
    getDrillToUrlMappedConfigForWidget,
    getGlobalDrillDownMappedConfigForWidget,
    getMappedConfigForWidget,
} from "./drillConfigMapper.js";
import { useIncompleteItems } from "./useDrillConfigIncompleteItems.js";
import {
    addDrillDownForInsightWidget,
    modifyDrillDownForInsightWidget,
    modifyDrillsForInsightWidget,
    removeDrillDownForInsightWidget,
    removeDrillToUrlForInsightWidget,
    removeDrillsForInsightWidget,
} from "../../../../../model/commands/insight.js";
import {
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../../../model/react/DashboardStoreProvider.js";
import {
    selectAllowMultipleInteractionsPerAttributeAndMeasure,
    selectSupportsAttributeHierarchies,
} from "../../../../../model/store/backendCapabilities/backendCapabilitiesSelectors.js";
import { selectAllCatalogAttributeHierarchies } from "../../../../../model/store/catalog/catalogSelectors.js";
import { selectEnableImplicitDrillToUrl } from "../../../../../model/store/config/configSelectors.js";
import { selectDrillTargetsByWidgetRef } from "../../../../../model/store/drillTargets/drillTargetsSelectors.js";
import { selectInsightByRef } from "../../../../../model/store/insights/insightsSelectors.js";
import { selectWidgetByRef } from "../../../../../model/store/tabs/layout/layoutSelectors.js";
import { selectInvalidUrlDrillParameterDrillLocalIdsByWidgetRef } from "../../../../../model/store/ui/uiSelectors.js";
import {
    selectDrillsToUrlAttributeByWidgetRef,
    selectGlobalDrillsDownAttributeHierarchyByWidgetRef,
} from "../../../../../model/store/widgetDrills/widgetDrillSelectors.js";
import {
    DRILL_TARGET_TYPE,
    type IDrillConfigItem,
    type IDrillDownAttributeHierarchyConfig,
    type IDrillDownAttributeHierarchyDefinition,
    isDrillDownToAttributeHierarchyConfig,
    isDrillDownToAttributeHierarchyDefinition,
    isDrillToAttributeUrlConfig,
    isDrillToUrlConfig,
} from "../../../../drill/types.js";

const messages = defineMessages({
    added: { id: "messages.drill.InteractionConfiguredSuccess" },
    modified: { id: "messages.drill.InteractionUpdatedSuccess" },
});

const mergeDrillConfigItems = (
    drillConfigItems: IDrillConfigItem[],
    globalDrillDownItems: IDrillConfigItem[],
    drillToUrlItems: IDrillConfigItem[],
    incompleteItems: IDrillConfigItem[],
    enableImplicitDrillToUrl: boolean,
): IDrillConfigItem[] => {
    return incompleteItems.reduce(
        (acc: IDrillConfigItem[], incompleteItem: IDrillConfigItem) => {
            const found = acc.findIndex((item) => item.localIdentifier === incompleteItem.localIdentifier);
            if (found === -1) {
                acc.push(incompleteItem);
            } else {
                if (!incompleteItem.complete) {
                    acc[found] = incompleteItem;
                }
            }
            return acc;
        },
        [
            ...(globalDrillDownItems ?? []),
            ...(enableImplicitDrillToUrl ? (drillToUrlItems ?? []) : []),
            ...(drillConfigItems ?? []),
        ],
    );
};

const getUnusedDrillTargets = (
    availableDrillTargets: IAvailableDrillTargets | undefined,
    mergedItems: IDrillConfigItem[],
    allowMultipleInteractionsPerAttributeAndMeasure: boolean,
    supportsAttributeHierarchies: boolean,
) => {
    if (allowMultipleInteractionsPerAttributeAndMeasure && supportsAttributeHierarchies) {
        return {
            measures: availableDrillTargets?.measures,
            attributes: availableDrillTargets?.attributes,
        };
    }

    const availableDrillTargetMeasures = availableDrillTargets?.measures?.filter(
        (measure) =>
            !mergedItems.some(
                (item) =>
                    item.type === "measure" &&
                    item.originLocalIdentifier === measure.measure.measureHeaderItem.localIdentifier,
            ),
    );
    const availableDrillTargetAttributes = availableDrillTargets?.attributes?.filter(
        (attribute) =>
            !mergedItems.some(
                (item) =>
                    item.type === "attribute" &&
                    item.originLocalIdentifier === attribute.attribute.attributeHeader.localIdentifier,
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
    const insight = useDashboardSelector(selectInsightByRef(widget.insight));
    const enableImplicitDrillToUrl = useDashboardSelector(selectEnableImplicitDrillToUrl);
    const { drills: widgetDrills } = widget;
    const { incompleteItems, deleteIncompleteItem, onChangeItem, onOriginSelect, completeItem, isItemNew } =
        useIncompleteItems({ widgetDrills });

    const { addSuccess } = useToastMessage();
    const dispatch = useDashboardDispatch();

    const supportsAttributeHierarchies = useDashboardSelector(selectSupportsAttributeHierarchies);
    const allowMultipleInteractionsPerAttributeAndMeasure = useDashboardSelector(
        selectAllowMultipleInteractionsPerAttributeAndMeasure,
    );
    const widgetGlobalDrillDowns = useDashboardSelector(
        selectGlobalDrillsDownAttributeHierarchyByWidgetRef(widgetRef),
    );
    const widgetDrillToUrls = useDashboardSelector(selectDrillsToUrlAttributeByWidgetRef(widgetRef));

    const configItems = useDashboardSelector(selectDrillTargetsByWidgetRef(widgetRef));
    const invalidCustomUrlDrillLocalIds = useDashboardSelector(
        selectInvalidUrlDrillParameterDrillLocalIdsByWidgetRef(widgetRef),
    );

    const availableDrillTargets = configItems?.availableDrillTargets;

    const attributeHierarchies = useDashboardSelector(selectAllCatalogAttributeHierarchies);

    const drillItems = useMemo(() => {
        return availableDrillTargets
            ? getMappedConfigForWidget(
                  widgetDrills,
                  availableDrillTargets,
                  invalidCustomUrlDrillLocalIds,
                  widgetRef,
              )
            : [];
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [availableDrillTargets, widgetDrills, invalidCustomUrlDrillLocalIds]);

    const globalDrillDownItems = useMemo(() => {
        return availableDrillTargets
            ? getGlobalDrillDownMappedConfigForWidget(widgetGlobalDrillDowns, availableDrillTargets, widget)
            : [];
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [widgetGlobalDrillDowns, availableDrillTargets]);

    const drillToUrlItems = useMemo(() => {
        return availableDrillTargets
            ? getDrillToUrlMappedConfigForWidget(widgetDrillToUrls, availableDrillTargets, widget)
            : [];
    }, [widgetDrillToUrls, availableDrillTargets, widget]);

    const mergedItems = useMemo(() => {
        return mergeDrillConfigItems(
            drillItems,
            globalDrillDownItems,
            drillToUrlItems,
            incompleteItems,
            enableImplicitDrillToUrl,
        );
    }, [drillItems, globalDrillDownItems, drillToUrlItems, incompleteItems, enableImplicitDrillToUrl]);

    const originSelectorItems = useMemo(
        () =>
            getUnusedDrillTargets(
                availableDrillTargets,
                mergedItems,
                allowMultipleInteractionsPerAttributeAndMeasure,
                supportsAttributeHierarchies,
            ),
        [
            availableDrillTargets,
            mergedItems,
            allowMultipleInteractionsPerAttributeAndMeasure,
            supportsAttributeHierarchies,
        ],
    );

    const onSetupItem = useCallback(
        (
            drill: InsightDrillDefinition | IDrillDownAttributeHierarchyDefinition,
            changedItem: IDrillConfigItem,
            isIgnoredDrillDownInteresectionAttributesChange?: boolean,
        ) => {
            const isNew = isItemNew(changedItem);
            if (!isDrillDownToAttributeHierarchyDefinition(drill)) {
                const blacklistHierarchiesToUpdate = isDrillDownToAttributeHierarchyConfig(changedItem)
                    ? buildBlacklistHierarchies(changedItem, attributeHierarchies)
                    : [];
                dispatch(modifyDrillsForInsightWidget(widgetRef, [drill], blacklistHierarchiesToUpdate));
            }

            // we are not able remove incomplete items directly,it will change items in panel while command is processing
            // and this will not keep correct scroll.
            // we mark item complete and remove is done in useIncompleteItems when widget drills changed
            completeItem(changedItem);

            if (changedItem.drillTargetType === DRILL_TARGET_TYPE.DRILL_DOWN) {
                const attributeDescriptor = changedItem.attributes.find(
                    (attr) => attr.attributeHeader.localIdentifier === changedItem.originLocalIdentifier,
                );

                if (changedItem.complete) {
                    const blacklistHierarchies = buildBlacklistHierarchies(
                        drill as IDrillDownAttributeHierarchyDefinition,
                        attributeHierarchies,
                    );

                    dispatch(
                        modifyDrillDownForInsightWidget(
                            widgetRef,
                            attributeDescriptor!.attributeHeader.formOf.ref,
                            (changedItem as IDrillDownAttributeHierarchyConfig).attributeHierarchyRef,
                            isIgnoredDrillDownInteresectionAttributesChange ? [] : blacklistHierarchies,
                            changedItem.drillIntersectionIgnoredAttributes ?? [],
                        ),
                    );
                } else {
                    dispatch(
                        addDrillDownForInsightWidget(
                            widgetRef,
                            attributeDescriptor!.attributeHeader.formOf.ref,
                            changedItem.localIdentifier,
                            (changedItem as IDrillDownAttributeHierarchyConfig).attributeHierarchyRef,
                            changedItem.drillIntersectionIgnoredAttributes ?? [],
                        ),
                    );
                }

                deleteIncompleteItem(changedItem);
            }
            addSuccess(isNew ? messages.added : messages.modified, { duration: 3000 });
        },
        [
            widgetRef,
            completeItem,
            addSuccess,
            isItemNew,
            dispatch,
            attributeHierarchies,
            deleteIncompleteItem,
        ],
    );

    const onDeleteItem = useCallback(
        (item: IDrillConfigItem) => {
            if (item.complete) {
                if (isDrillDownToAttributeHierarchyConfig(item)) {
                    dispatch(
                        removeDrillDownForInsightWidget(
                            widgetRef,
                            buildBlacklistHierarchies(item, attributeHierarchies),
                        ),
                    );
                } else if (
                    isDrillToUrlConfig(item) &&
                    isDrillToAttributeUrlConfig(item.urlDrillTarget) &&
                    item.urlDrillTarget.implicit
                ) {
                    const displayForm = item.urlDrillTarget.insightAttributeDisplayForm;
                    dispatch(removeDrillToUrlForInsightWidget(widgetRef, [displayForm]));
                } else {
                    dispatch(removeDrillsForInsightWidget(widgetRef, [localIdRef(item.localIdentifier)]));
                }
            }
            deleteIncompleteItem(item);
        },
        [widgetRef, dispatch, deleteIncompleteItem, attributeHierarchies],
    );

    return {
        widget,
        insight,
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

export function buildBlacklistHierarchies(
    item: IDrillDownAttributeHierarchyDefinition | IDrillDownAttributeHierarchyConfig,
    attributeHierarchies: (ICatalogAttributeHierarchy | ICatalogDateAttributeHierarchy)[],
): IDrillDownReference[] {
    const attributeDescriptor = item.attributes.find(
        (attr) => attr.attributeHeader.localIdentifier === item.originLocalIdentifier,
    );
    if (!attributeDescriptor) {
        return [];
    }
    const isDateAttribute = !!attributeDescriptor.attributeHeader.granularity;
    if (isDateAttribute) {
        const dateHierarchy = attributeHierarchies.find((hierarchy) =>
            areObjRefsEqual(getHierarchyRef(hierarchy), item.attributeHierarchyRef),
        );
        // date attribute may reference either adhoc date hierarchy or std attribute hierarchy
        if (isCatalogDateAttributeHierarchy(dateHierarchy)) {
            return [
                {
                    type: "dateHierarchyReference",
                    dateHierarchyTemplate: idRef(dateHierarchy.templateId, "dateHierarchyTemplate"),
                    dateDatasetAttribute: attributeDescriptor.attributeHeader.formOf.ref,
                },
            ];
        } else {
            return [
                {
                    type: "attributeHierarchyReference",
                    attributeHierarchy: item.attributeHierarchyRef,
                    attribute: attributeDescriptor.attributeHeader.formOf.ref,
                },
            ];
        }
    }
    return [
        {
            type: "attributeHierarchyReference",
            attributeHierarchy: item.attributeHierarchyRef,
            attribute: attributeDescriptor.attributeHeader.formOf.ref,
        },
    ];
}

// (C) 2021-2023 GoodData Corporation

import { createSelector } from "@reduxjs/toolkit";
import { areObjRefsEqual, ObjRef, objRefToString } from "@gooddata/sdk-model";
import union from "lodash/union.js";
import filter from "lodash/filter.js";
import { selectWidgetsMap } from "../layout/layoutSelectors.js";
import { DashboardSelector, DashboardState } from "../types.js";
import { createMemoizedSelector } from "../_infra/selectors.js";
import { IDashboardWidgetOverlay } from "../../types/commonTypes.js";
import { ObjRefMap } from "../../../_staging/metadata/objRefMap.js";
import { ILayoutCoordinates, IMenuButtonItemsVisibility } from "../../../types.js";
import { DraggableLayoutItem } from "../../../presentation/dragAndDrop/types.js";
import { InvalidCustomUrlDrillParameterInfo } from "./uiState.js";

const selectSelf = createSelector(
    (state: DashboardState) => state,
    (state) => state.ui,
);

/**
 * @alpha
 */
export const selectIsScheduleEmailDialogOpen: DashboardSelector<boolean> = createSelector(
    selectSelf,
    (state) => state.scheduleEmailDialog.open,
);

/**
 * @alpha
 */
export const selectScheduleEmailDialogDefaultAttachment: DashboardSelector<ObjRef | undefined> =
    createSelector(selectSelf, (state) => state.scheduleEmailDialog.defaultAttachmentRef ?? undefined);

/**
 * @alpha
 */
export const selectIsScheduleEmailManagementDialogOpen: DashboardSelector<boolean> = createSelector(
    selectSelf,
    (state) => state.scheduleEmailManagementDialog.open,
);

/**
 * @alpha
 */
export const selectIsSaveAsDialogOpen: DashboardSelector<boolean> = createSelector(
    selectSelf,
    (state) => state.saveAsDialog.open,
);

/**
 * @alpha
 */
export const selectIsShareDialogOpen: DashboardSelector<boolean> = createSelector(
    selectSelf,
    (state) => state.shareDialog.open,
);

/**
 * @internal
 */
export const selectIsDeleteDialogOpen: DashboardSelector<boolean> = createSelector(
    selectSelf,
    (state) => state.deleteDialog.open,
);

/**
 * @internal
 */
export const selectIsKpiDeleteDialogOpen: DashboardSelector<boolean> = createSelector(
    selectSelf,
    (state) => !!state.kpiDeleteDialog.widgetCoordinates,
);

/**
 * @internal
 */
export const selectIsCancelEditModeDialogOpen: DashboardSelector<boolean> = createSelector(
    selectSelf,
    (state) => !!state.cancelEditModeDialog.open,
);

/**
 * @internal
 */
export const selectKpiDeleteDialogWidgetCoordinates: DashboardSelector<ILayoutCoordinates | undefined> =
    createSelector(selectSelf, (state) => state.kpiDeleteDialog.widgetCoordinates);

/**
 * @alpha
 */
export const selectFilterBarExpanded: DashboardSelector<boolean> = createSelector(
    selectSelf,
    (state) => state.filterBar.expanded,
);

const selectHighlightedKpiWidgetRef = createSelector(
    selectSelf,
    (state) => state.kpiAlerts.highlightedWidgetRef,
);

const selectOpenedKpiWidgetRef = createSelector(
    selectSelf,
    (state) => state.kpiAlerts.openedWidgetRef ?? undefined,
);

/**
 * @alpha
 */
export const selectIsKpiAlertOpenedByWidgetRef = createMemoizedSelector(
    (ref: ObjRef | undefined): ((state: DashboardState) => boolean) => {
        return createSelector(selectWidgetsMap, selectOpenedKpiWidgetRef, (widgets, openedWidgetRef) => {
            if (!ref) {
                return false;
            }

            const openedWidget = openedWidgetRef && widgets.get(openedWidgetRef);
            if (!openedWidget) {
                return false;
            }

            const targetWidget = widgets.get(ref);
            if (!targetWidget) {
                return false;
            }

            return targetWidget.identifier === openedWidget.identifier;
        });
    },
);

/**
 * @alpha
 */
export const selectIsKpiAlertHighlightedByWidgetRef = createMemoizedSelector(
    (ref: ObjRef | undefined): ((state: DashboardState) => boolean) => {
        return createSelector(
            selectWidgetsMap,
            selectHighlightedKpiWidgetRef,
            (widgets, highlightedWidgetRef) => {
                if (!ref) {
                    return false;
                }

                const highlightedWidget = highlightedWidgetRef && widgets.get(highlightedWidgetRef);
                if (!highlightedWidget) {
                    return false;
                }

                const targetWidget = widgets.get(ref);
                if (!targetWidget) {
                    return false;
                }

                return targetWidget.identifier === highlightedWidget.identifier;
            },
        );
    },
);

/**
 * @alpha
 */
export const selectMenuButtonItemsVisibility: DashboardSelector<IMenuButtonItemsVisibility> = createSelector(
    selectSelf,
    (state) => state.menuButton.itemsVisibility ?? {},
);

/**
 * @internal
 */
export const selectSelectedWidgetRef: DashboardSelector<ObjRef | undefined> = createSelector(
    selectSelf,
    (state) => state.selectedWidgetRef,
);

/**
 * @internal
 */
export const selectConfigurationPanelOpened: DashboardSelector<boolean> = createSelector(
    selectSelf,
    (state) => state.configurationPanelOpened,
);

/**
 * @internal
 */
export const selectWidgetDateDatasetAutoSelect: DashboardSelector<boolean> = createSelector(
    selectSelf,
    (state) => state.widgetDateDatasetAutoSelect,
);

/**
 * @internal
 */
export const selectInsightListLastUpdateRequested: DashboardSelector<number> = createSelector(
    selectSelf,
    (state) => state.insightListLastUpdateRequested,
);

const selectWidgetsLoadingAdditionalData: DashboardSelector<ObjRef[]> = createSelector(
    selectSelf,
    (state) => state.widgetsLoadingAdditionalData,
);

/**
 * @internal
 */
export const selectIsWidgetLoadingAdditionalDataByWidgetRef: (refs: ObjRef) => DashboardSelector<boolean> =
    createMemoizedSelector((ref: ObjRef) =>
        createSelector(selectWidgetsLoadingAdditionalData, (widgetsLoading) => {
            return widgetsLoading.some((loadingRef) => areObjRefsEqual(loadingRef, ref));
        }),
    );

/**
 * @alpha
 */
export const selectIsFilterAttributeSelectionOpen: DashboardSelector<boolean> = createSelector(
    selectSelf,
    (state) => state.filterAttributeSelectionOpen,
);

/**
 * @alpha
 */
export const selectSelectedFilterIndex: DashboardSelector<number | undefined> = createSelector(
    selectSelf,
    (state) => state.selectedFilterIndex,
);

/**
 * @internal
 */
export const selectIsDraggingWidget: DashboardSelector<boolean> = createSelector(
    selectSelf,
    (state) => state.draggingWidgetSource !== undefined,
);

/**
 * @internal
 */
export const selectActiveSectionIndex: DashboardSelector<number | undefined> = createSelector(
    selectSelf,
    (state) => state.activeSectionIndex,
);

/**
 * @internal
 */
export const selectInvalidDrillWidgetRefs: DashboardSelector<ObjRef[]> = createSelector(
    selectSelf,
    (state) => state.drillValidationMessages.invalidDrillWidgetRefs,
);

const selectInvalidCustomUrlDrillParameterWidgets = createSelector(
    selectSelf,
    (state) => state.drillValidationMessages.invalidCustomUrlDrillParameterWidgets,
);

/**
 * @internal
 */
export const selectInvalidUrlDrillParameterWidgetRefs: DashboardSelector<ObjRef[]> = createSelector(
    selectInvalidCustomUrlDrillParameterWidgets,
    (invalidCustomUrlDrillParameterWidgets) => invalidCustomUrlDrillParameterWidgets.map((i) => i.widgetRef),
);

/**
 * @internal
 */
export const selectInvalidUrlDrillParameterWidgetWarnings: DashboardSelector<ObjRef[]> = createSelector(
    selectInvalidCustomUrlDrillParameterWidgets,
    (invalidCustomUrlDrillParameterWidgets) =>
        invalidCustomUrlDrillParameterWidgets.filter((item) => item.showMessage).map((i) => i.widgetRef),
);

const selectInvalidUrlDrillParameterWidgetsMap = createSelector(
    selectInvalidCustomUrlDrillParameterWidgets,
    (invalidCustomUrlDrillParameterWidgets) =>
        new ObjRefMap<InvalidCustomUrlDrillParameterInfo>({
            idExtract: (i) => i.widgetId,
            refExtract: (i) => i.widgetRef,
            uriExtract: (i) => i.widgetUri,
            strictTypeCheck: false,
        }).fromItems(invalidCustomUrlDrillParameterWidgets),
);

/**
 * @internal
 */
export const selectInvalidUrlDrillParameterDrillLocalIdsByWidgetRef: (
    ref: ObjRef,
) => DashboardSelector<string[]> = createMemoizedSelector((ref: ObjRef) =>
    createSelector(
        selectInvalidUrlDrillParameterWidgetsMap,
        (invalidParameterWidgetsMap) =>
            invalidParameterWidgetsMap.get(ref)?.drillsWithInvalidParametersLocalIds ?? [],
    ),
);

/**
 * @internal
 */
export const selectDraggingWidgetSource: DashboardSelector<DraggableLayoutItem | undefined> = createSelector(
    selectSelf,
    (state) => state.draggingWidgetSource,
);

/**
 * @internal
 */
export const selectDraggingWidgetTarget: DashboardSelector<ILayoutCoordinates | undefined> = createSelector(
    selectSelf,
    (state) => state.draggingWidgetTarget,
);

/**
 * @internal
 */
export const selectWidgetsOverlay: DashboardSelector<Record<string, IDashboardWidgetOverlay>> =
    createSelector(selectSelf, (state) => state.widgetsOverlay);

/**
 * @internal
 */
export const selectWidgetsOverlayState: (refs: (ObjRef | undefined)[]) => DashboardSelector<boolean> =
    createMemoizedSelector((refs: (ObjRef | undefined)[]) =>
        createSelector(selectWidgetsOverlay, (overlay): boolean => {
            return refs.every((ref) => {
                return (ref && overlay[objRefToString(ref)]?.showOverlay) ?? false;
            });
        }),
    );

/**
 * @internal
 */
export const selectWidgetsModification: (
    refs: (ObjRef | undefined)[],
) => DashboardSelector<("insertedByPlugin" | "modifiedByPlugin")[]> = createMemoizedSelector(
    (refs: (ObjRef | undefined)[]) =>
        createSelector(
            selectWidgetsOverlay,
            (overlay): Required<IDashboardWidgetOverlay>["modification"][] => {
                return refs.reduce((modification, ref) => {
                    const item = ref && overlay[objRefToString(ref)];
                    if (item?.modification) {
                        return union(modification, [item.modification]);
                    }
                    return modification;
                }, [] as Required<IDashboardWidgetOverlay>["modification"][]);
            },
        ),
);

/**
 * @internal
 */
export const selectSectionModification: (
    refs: (ObjRef | undefined)[],
) => DashboardSelector<("insertedByPlugin" | "modifiedByPlugin")[]> = createMemoizedSelector(
    (refs: (ObjRef | undefined)[]) =>
        createSelector(
            selectWidgetsOverlay,
            (overlay): Required<IDashboardWidgetOverlay>["modification"][] => {
                const modifications = refs.map((ref) => {
                    const item = ref && overlay[objRefToString(ref)];
                    return item?.modification;
                });

                const inserted = filter(modifications, (a) => a === "insertedByPlugin");
                const modified = filter(modifications, (a) => a === "modifiedByPlugin");

                return [
                    ...(inserted.length === refs.length ? ["insertedByPlugin"] : []),
                    ...(modified.length === refs.length ? ["modifiedByPlugin"] : []),
                ] as Required<IDashboardWidgetOverlay>["modification"][];
            },
        ),
);

/**
 * @internal
 */
export const selectIsSectionInsertedByPlugin: (refs: (ObjRef | undefined)[]) => DashboardSelector<boolean> =
    createMemoizedSelector((refs: (ObjRef | undefined)[]) =>
        createSelector(
            selectSectionModification(refs),
            // When all the widgets in the section were inserted by the plugin,
            // the section was added by the plugin as well (empty section(s) cannot be added)
            (modifications) =>
                modifications.length > 0 && modifications.every((m) => m === "insertedByPlugin"),
        ),
    );

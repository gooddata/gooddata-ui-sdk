// (C) 2021-2023 GoodData Corporation
import { createSelector } from "@reduxjs/toolkit";
import { IBackendCapabilities } from "@gooddata/sdk-backend-spi";
import { DashboardSelector, DashboardState } from "../types.js";
import { invariant } from "ts-invariant";

const selectSelf = createSelector(
    (state: DashboardState) => state,
    (state) => state.backendCapabilities,
);

/**
 * This selector returns capabilities of the backend with which the dashboard works.
 *
 * @public
 */
export const selectBackendCapabilities: DashboardSelector<IBackendCapabilities> = createSelector(
    selectSelf,
    (state) => {
        invariant(state.backendCapabilities, "attempting to access uninitialized backend capabilities");

        return state.backendCapabilities!;
    },
);

/**
 * This selector returns capability if parent child filtering is enabled.
 *
 * @public
 */
export const selectSupportsElementsQueryParentFiltering: DashboardSelector<boolean> = createSelector(
    selectBackendCapabilities,
    (capabilities) => capabilities.supportsElementsQueryParentFiltering ?? false,
);

/**
 * Selector for {@link @gooddata/sdk-backend-spi#IBackendCapabilities.supportsKpiWidget}
 *
 * @internal
 */
export const selectSupportsKpiWidgetCapability: DashboardSelector<boolean> = createSelector(
    selectBackendCapabilities,
    (capabilities) => capabilities.supportsKpiWidget ?? false,
);

/**
 * Selector for {@link @gooddata/sdk-backend-spi#IBackendCapabilities.supportsAccessControl}
 *
 * @internal
 */
export const selectSupportsAccessControlCapability: DashboardSelector<boolean> = createSelector(
    selectBackendCapabilities,
    (capabilities) => capabilities.supportsAccessControl ?? false,
);

/**
 * Selector for {@link @gooddata/sdk-backend-spi#IBackendCapabilities.supportsHierarchicalWorkspaces}
 *
 * @internal
 */
export const selectSupportsHierarchicalWorkspacesCapability: DashboardSelector<boolean> = createSelector(
    selectBackendCapabilities,
    (capabilities) => capabilities.supportsHierarchicalWorkspaces ?? false,
);

/**
 * Selector for {@link @gooddata/sdk-backend-spi#IBackendCapabilities.supportsElementUris}
 *
 * @internal
 */
export const selectSupportsElementUris: DashboardSelector<boolean> = createSelector(
    selectBackendCapabilities,
    (capabilities) => capabilities.supportsElementUris ?? false,
);

/**
 * Selector for {@link @gooddata/sdk-backend-spi#IBackendCapabilities.canExportCsv}
 *
 * @internal
 */
export const selectSupportsExportToCsv: DashboardSelector<boolean> = createSelector(
    selectBackendCapabilities,
    (capabilities) => capabilities.canExportCsv ?? false,
);

/**
 * Selector for {@link @gooddata/sdk-backend-spi#IBackendCapabilities.canExportXlsx}
 *
 * @internal
 */
export const selectSupportsExportToXlsx: DashboardSelector<boolean> = createSelector(
    selectBackendCapabilities,
    (capabilities) => capabilities.canExportXlsx ?? false,
);

/**
 * Selector for {@link @gooddata/sdk-backend-spi#IBackendCapabilities.supportsObjectUris}
 *
 * @internal
 */
export const selectSupportsObjectUris: DashboardSelector<boolean> = createSelector(
    selectBackendCapabilities,
    (capabilities) => capabilities.supportsObjectUris ?? false,
);

/**
 * Selector for {@link @gooddata/sdk-backend-spi#IBackendCapabilities.supportsSettingConnectingAttributes}
 *
 * @internal
 */
export const selectSupportsSettingConnectingAttributes: DashboardSelector<boolean> = createSelector(
    selectBackendCapabilities,
    (capabilities) => capabilities.supportsSettingConnectingAttributes ?? false,
);

/**
 * Selector for {@link @gooddata/sdk-backend-spi#IBackendCapabilities.supportsKeepingDependentFiltersSelection}
 *
 * @internal
 */
export const selectSupportsKeepingDependentFiltersSelection: DashboardSelector<boolean> = createSelector(
    selectBackendCapabilities,
    (capabilities) => capabilities.supportsKeepingDependentFiltersSelection ?? false,
);

/**
 * Selector for {@link @gooddata/sdk-backend-spi#IBackendCapabilities.supportsCircularDependencyInFilters}
 *
 * @internal
 */
export const selectSupportsCircularDependencyInFilters: DashboardSelector<boolean> = createSelector(
    selectBackendCapabilities,
    (capabilities) => capabilities.supportsCircularDependencyInFilters ?? false,
);

/**
 * Selector for {@link @gooddata/sdk-backend-spi#IBackendCapabilities.allowMultipleInteractionsPerAttributeAndMeasure}
 *
 * @internal
 */
export const selectAllowMultipleInteractionsPerAttributeAndMeasure: DashboardSelector<boolean> =
    createSelector(
        selectBackendCapabilities,
        (capabilities) => capabilities.allowMultipleInteractionsPerAttributeAndMeasure ?? false,
    );

/**
 * Selector for {@link @gooddata/sdk-backend-spi#IBackendCapabilities.selectSupportsAttributeHierarchies}
 *
 * @internal
 */
export const selectSupportsAttributeHierarchies: DashboardSelector<boolean> = createSelector(
    selectBackendCapabilities,
    (capabilities) => capabilities.supportsAttributeHierarchies ?? false,
);

/**
 * Selector for {@link @gooddata/sdk-backend-spi#IBackendCapabilities.supportsSingleSelectDependentFilters}
 *
 * @internal
 */
export const selectSupportsSingleSelectDependentFilters: DashboardSelector<boolean> = createSelector(
    selectBackendCapabilities,
    (capabilities) => capabilities.supportsSingleSelectDependentFilters ?? false,
);

/**
 * Selector for {@link @gooddata/sdk-backend-spi#IBackendCapabilities.supportsCrossFiltering}
 *
 * @internal
 */
export const selectSupportsCrossFiltering: DashboardSelector<boolean> = createSelector(
    selectBackendCapabilities,
    (capabilities) => capabilities.supportsCrossFiltering ?? false,
);

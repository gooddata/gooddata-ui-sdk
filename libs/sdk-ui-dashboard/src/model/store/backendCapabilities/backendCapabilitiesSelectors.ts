// (C) 2021-2022 GoodData Corporation
import { createSelector } from "@reduxjs/toolkit";
import { DashboardState } from "../types";
import invariant from "ts-invariant";

const selectSelf = createSelector(
    (state: DashboardState) => state,
    (state) => state.backendCapabilities,
);

/**
 * This selector returns capabilities of the backend with which the dashboard works.
 *
 * @public
 */
export const selectBackendCapabilities = createSelector(selectSelf, (state) => {
    invariant(state.backendCapabilities, "attempting to access uninitialized backend capabilities");

    return state.backendCapabilities!;
});

/**
 * This selector returns capability if parent child filtering is enabled.
 *
 * @public
 */
export const selectSupportsElementsQueryParentFiltering = createSelector(
    selectBackendCapabilities,
    (capabilities) => capabilities.supportsElementsQueryParentFiltering ?? false,
);

/**
 * Selector for {@link @gooddata/sdk-backend-spi#IBackendCapabilities.supportsKpiWidget}
 *
 * @internal
 */
export const selectSupportsKpiWidgetCapability = createSelector(
    selectBackendCapabilities,
    (capabilities) => capabilities.supportsKpiWidget ?? false,
);

/**
 * Selector for {@link @gooddata/sdk-backend-spi#IBackendCapabilities.supportsAccessControl}
 *
 * @internal
 */
export const selectSupportsAccessControlCapability = createSelector(
    selectBackendCapabilities,
    (capabilities) => capabilities.supportsAccessControl ?? false,
);

/**
 * Selector for {@link @gooddata/sdk-backend-spi#IBackendCapabilities.supportsHierarchicalWorkspaces}
 *
 * @internal
 */
export const selectSupportsHierarchicalWorkspacesCapability = createSelector(
    selectBackendCapabilities,
    (capabilities) => capabilities.supportsHierarchicalWorkspaces ?? false,
);

/**
 * Selector for {@link @gooddata/sdk-backend-spi#IBackendCapabilities.supportsElementUris}
 *
 * @internal
 */
export const selectSupportsElementUris = createSelector(
    selectBackendCapabilities,
    (capabilities) => capabilities.supportsElementUris ?? false,
);

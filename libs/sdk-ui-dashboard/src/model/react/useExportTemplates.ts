// (C) 2026 GoodData Corporation

import { type IExportTemplate } from "@gooddata/sdk-model";
import { useBackendStrict, useCancelablePromise } from "@gooddata/sdk-ui";

import { selectEnableExportTemplateSelection } from "../store/config/configSelectors.js";
import { useDashboardSelector } from "./DashboardStoreProvider.js";

/**
 * Fetches export templates when the feature flag is enabled.
 * Returns an empty array when disabled or while loading.
 *
 * Fetches via the organization service — templates are organization-level, not workspace-scoped.
 * The backend caching layer ensures redundant calls across hook instances are deduplicated.
 *
 * @internal
 */
export function useExportTemplates(): IExportTemplate[] {
    const backend = useBackendStrict();
    const isEnabled = useDashboardSelector(selectEnableExportTemplateSelection);

    const { result } = useCancelablePromise(
        {
            promise: isEnabled
                ? async () => {
                      const org = await backend.organizations().getCurrentOrganization();
                      return org.exportTemplates().getExportTemplates();
                  }
                : () => Promise.resolve([] as IExportTemplate[]),
        },
        [backend, isEnabled],
    );

    return result ?? [];
}

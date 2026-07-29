// (C) 2026 GoodData Corporation

import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { useCancelablePromise } from "@gooddata/sdk-ui";
import {
    type IDateFilterOptionsByType,
    convertDateFilterConfigToDateFilterOptions,
    defaultDateFilterConfig,
    flattenDateFilterOptions,
} from "@gooddata/sdk-ui-filters";

// Must match the catalog the dashboard degrades to (the rich default config), not sdk-ui-filters'
// slim defaultDateFilterOptions — else this picker and the dashboard would show different presets.
const FALLBACK_DATE_FILTER_OPTIONS = convertDateFilterConfigToDateFilterOptions(defaultDateFilterConfig);

/**
 * The workspace date-filter preset catalog for date-condition value pickers — the same catalog the
 * dashboard date filter consumes. Undefined while loading (the picker degrades to its static form);
 * falls back to platform defaults when backend/workspace is absent, the workspace has no custom
 * config, the query fails, or the config yields nothing visible.
 */
export function useCfDateFilterOptions(
    backend: IAnalyticalBackend | undefined,
    workspace: string | undefined,
    /** False = no consumer in sight (no date-eligible target) — skip the backend query entirely. */
    enabled: boolean,
): IDateFilterOptionsByType | undefined {
    const { result } = useCancelablePromise(
        {
            promise: enabled
                ? async () => {
                      if (!backend || !workspace) {
                          return FALLBACK_DATE_FILTER_OPTIONS;
                      }
                      try {
                          const custom = await backend
                              .workspace(workspace)
                              .dateFilterConfigs()
                              .withLimit(1)
                              .queryCustomDateFilterConfig();
                          const config = custom.items[0];
                          if (config) {
                              const options = convertDateFilterConfigToDateFilterOptions(config);
                              if (flattenDateFilterOptions(options).some((option) => option.visible)) {
                                  return options;
                              }
                          }
                      } catch (error) {
                          console.warn(
                              "Loading the workspace date filter config failed; date conditions fall back to the default preset catalog.",
                              error,
                          );
                      }
                      return FALLBACK_DATE_FILTER_OPTIONS;
                  }
                : null,
        },
        [backend, workspace, enabled],
    );
    return result;
}

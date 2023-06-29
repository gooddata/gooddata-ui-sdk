// (C) 2019-2022 GoodData Corporation
import flow from "lodash/flow.js";
import uniqBy from "lodash/uniqBy.js";
import stringify from "json-stable-stringify";
import {
    IAbsoluteDateFilterPreset,
    IRelativeDateFilterPreset,
    IDateFilterConfig,
    IDashboardDateFilterConfig,
} from "@gooddata/sdk-model";

import { sanitizeDateFilterOption } from "./sanitization.js";

type NonArrayFilterOptionKey = "absoluteForm" | "relativeForm" | "allTime";

type DashboardConfigMerger = (
    dashboardConfig: IDashboardDateFilterConfig,
) => (projectConfig: IDateFilterConfig) => IDateFilterConfig;

/**
 * Merges presets so that presets that are semantically unique are de-duplicated.
 */
const mergePresets = <T extends IAbsoluteDateFilterPreset | IRelativeDateFilterPreset>(
    projectPresets: T[],
    dashboardPresets: T[],
): T[] => {
    const merged = [...(projectPresets || []), ...(dashboardPresets || [])].map(sanitizeDateFilterOption);

    return uniqBy(merged, stringify);
};

const addPresets: DashboardConfigMerger = (dashboardConfig) => (projectConfig) => {
    if (!dashboardConfig.addPresets) {
        return projectConfig;
    }

    const absolutePresets = mergePresets(
        projectConfig?.absolutePresets ?? [],
        dashboardConfig.addPresets?.absolutePresets ?? [],
    );
    const relativePresets = mergePresets(
        projectConfig?.relativePresets ?? [],
        dashboardConfig.addPresets?.relativePresets ?? [],
    );

    return {
        ...projectConfig,
        ...(absolutePresets.length ? { absolutePresets } : null),
        ...(relativePresets.length ? { relativePresets } : null),
    };
};

const hideNonArrayOptionType =
    (key: NonArrayFilterOptionKey): DashboardConfigMerger =>
    (dashboardConfig) =>
    (projectConfig) => {
        const configKey = projectConfig[key];

        if (!configKey) {
            return projectConfig;
        }

        if (!configKey.visible || !dashboardConfig.hideOptions) {
            return projectConfig;
        }

        return dashboardConfig.hideOptions?.includes(configKey.localIdentifier)
            ? {
                  ...projectConfig,
                  [key]: {
                      ...projectConfig[key],
                      visible: false,
                  },
              }
            : projectConfig;
    };

const hideAllTime = hideNonArrayOptionType("allTime");

const hideAbsoluteForm = hideNonArrayOptionType("absoluteForm");

const hideRelativeForm = hideNonArrayOptionType("relativeForm");

const shouldHideRelativePreset = (
    preset: IRelativeDateFilterPreset,
    dashboardConfig: IDashboardDateFilterConfig,
): boolean => {
    const hideForGranularity = dashboardConfig.hideGranularities?.includes(preset.granularity);
    const hideForId = dashboardConfig.hideOptions?.includes(preset.localIdentifier);

    return hideForGranularity || hideForId || false;
};

const hideAbsolutePresets: DashboardConfigMerger = (dashboardConfig) => (projectConfig) => {
    if (!projectConfig.absolutePresets?.length || !dashboardConfig.hideOptions) {
        return projectConfig;
    }

    const absolutePresets = projectConfig.absolutePresets.map((preset) =>
        dashboardConfig.hideOptions?.includes(preset.localIdentifier)
            ? {
                  ...preset,
                  visible: false,
              }
            : preset,
    );

    return {
        ...projectConfig,
        absolutePresets,
    };
};

const hideRelativePresets: DashboardConfigMerger = (dashboardConfig) => (projectConfig) => {
    const canDashboardConfigHideRelativePreset =
        dashboardConfig.hideOptions || dashboardConfig.hideGranularities;

    if (!projectConfig.relativePresets?.length || !canDashboardConfigHideRelativePreset) {
        return projectConfig;
    }

    const relativePresets = projectConfig.relativePresets.map((preset) =>
        shouldHideRelativePreset(preset, dashboardConfig)
            ? {
                  ...preset,
                  visible: false,
              }
            : preset,
    );

    return {
        ...projectConfig,
        relativePresets,
    };
};

const hideRelativeFormGranularities: DashboardConfigMerger = (dashboardConfig) => (projectConfig) => {
    if (!projectConfig.relativeForm?.visible || !dashboardConfig.hideGranularities) {
        return projectConfig;
    }

    const granularities = projectConfig.relativeForm.availableGranularities.filter(
        (granularity) => !(dashboardConfig.hideGranularities?.includes(granularity) ?? false),
    );

    const { relativeForm, ...projectConfigWithoutRelativeForm } = projectConfig;

    return granularities.length > 0
        ? {
              ...projectConfig,
              relativeForm: {
                  ...relativeForm,
                  availableGranularities: granularities,
              },
          }
        : projectConfigWithoutRelativeForm;
};

/**
 * Merges the date filter config with the dashboard-level overrides. The overrides may hide some presets
 * or add custom presets. This function addresses all that and returns the final merged Date Filter Config.
 *
 * @param config - date filter config
 * @param dashboardOverrides - dashboard-level overrides.
 */
export function mergeDateFilterConfigs(
    config: IDateFilterConfig,
    dashboardOverrides: IDashboardDateFilterConfig,
): IDateFilterConfig {
    const pipeline = flow(
        addPresets(dashboardOverrides),
        hideAllTime(dashboardOverrides),
        hideAbsoluteForm(dashboardOverrides),
        hideRelativeForm(dashboardOverrides),
        hideRelativeFormGranularities(dashboardOverrides),
        hideAbsolutePresets(dashboardOverrides),
        hideRelativePresets(dashboardOverrides),
    );

    return pipeline(config);
}

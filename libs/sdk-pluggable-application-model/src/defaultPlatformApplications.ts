// (C) 2026 GoodData Corporation

/**
 * The object contains constants with IDs of default platform applications.
 * These IDs are used to identify application in the platform registry.
 *
 * They are documented in public documentation and can be used by customers in their manifests to override
 * the default application behavior (for example, to disable it, move it in the navigation menu, etc.).
 *
 * @alpha
 */
export const DefaultApplicationId = {
    HOME_UI: "gdc-home-ui",
    DASHBOARDS: "gdc-dashboards",
    ANALYTICAL_DESIGNER: "gdc-analytical-designer",
    METRIC_EDITOR: "gdc-metric-editor",
    LDM_MODELER: "gdc-ldm-modeler",
    WORKSPACE_CATALOG: "gdc-workspace-catalog",
};

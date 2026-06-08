// (C) 2024-2026 GoodData Corporation

/**
 * Types of objects that we can navigate to in UI.
 * @internal
 */
export type UIPathObjectTypes =
    | "dashboard"
    | "dashboardVisualization"
    | "visualization"
    | "metric"
    | "dataset"
    | "date"
    | "fact"
    | "attribute"
    | "label";

export type UIPathOptions = {
    useHostedMetricEditor?: boolean;
    useHostedAnalyticalDesigner?: boolean;
    useHostedLdmModeler?: boolean;
};

/**
 * Get the UI path for the given object type, object ID, and workspace ID.
 * TODO - this logic should live in gdc-ui repo, would require refactoring of the sdk-ui-semantic-search
 *  - ui components need URL right away to be able to render native anchor tags
 *  - gdc-ui would need to inject the URL between the data is loaded and the render
 * @internal
 */
export const getUIPath = (
    objectType: UIPathObjectTypes,
    objectId: string,
    workspaceId: string,
    visualizationId?: string,
    options: UIPathOptions = {},
): string => {
    switch (objectType) {
        case "dashboard":
            return `/dashboards/#/workspace/${workspaceId}/dashboard/${objectId}`;
        case "dashboardVisualization":
            return `/dashboards/#/workspace/${workspaceId}/dashboard/${objectId}?visualizationId=${visualizationId}`;
        case "visualization":
            if (options.useHostedAnalyticalDesigner) {
                return `/workspace/${workspaceId}/analyze/#/${objectId}/edit`;
            }
            return `/analyze/#/${workspaceId}/${objectId}/edit`;
        case "metric":
            if (options.useHostedMetricEditor) {
                return `/workspace/${workspaceId}/metrics/metric/${objectId}`;
            }
            return `/metrics/#/${workspaceId}/metric/${objectId}`;
        // TODO - deep links into the modeler (no pluggable deep-route support yet)
        case "dataset":
        case "attribute":
        case "label":
        case "fact":
        case "date":
            if (options.useHostedLdmModeler) {
                return `/workspace/${workspaceId}/modeler`;
            }
            return `/modeler/#/${workspaceId}`;
        default:
            return exhaustiveCheck(objectType);
    }
};

/**
 * Ensure exhaustive switch to prevent missing cases.
 */
const exhaustiveCheck = (x: never): never => {
    throw new Error(`Unknown item type ${x}`);
};

// (C) 2024-2025 GoodData Corporation

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
): string => {
    switch (objectType) {
        case "dashboard":
            return `/dashboards/#/workspace/${workspaceId}/dashboard/${objectId}`;
        case "dashboardVisualization":
            return `/dashboards/#/workspace/${workspaceId}/dashboard/${objectId}?visualizationId=${visualizationId}`;
        case "visualization":
            return `/analyze/#/${workspaceId}/${objectId}/edit`;
        case "metric":
            return `/metrics/#/${workspaceId}/metric/${objectId}`;
        case "dataset":
            return `/modeler/#/${workspaceId}`; // TODO - deep links
        case "attribute":
            return `/modeler/#/${workspaceId}`; // TODO - deep links
        case "label":
            return `/modeler/#/${workspaceId}`; // TODO - deep links
        case "fact":
            return `/modeler/#/${workspaceId}`; // TODO - deep links
        case "date":
            return `/modeler/#/${workspaceId}`; // TODO - deep links
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

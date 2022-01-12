// (C) 2007-2018 GoodData Corporation
import catalogItemsResponse from "./loadItems.json";
import getObjectsResponse from "./getObjects.json";
import getObjectsByQueryResponse from "./getObjectsByQuery.json";
import getVisualizationsResponse from "./getVisualizations.json";
import getAnalyticalDashboards from "./getAnalyticalDashboards.json";

export default {
    catalogue: {
        loadItems() {
            return Promise.resolve(catalogItemsResponse);
        },
    },
    md: {
        getObjectsByQuery() {
            return Promise.resolve(getObjectsByQueryResponse);
        },
        getObjects() {
            return Promise.resolve(getObjectsResponse);
        },
        getVisualizations() {
            return Promise.resolve(getVisualizationsResponse);
        },
        getAnalyticalDashboards() {
            return Promise.resolve(getAnalyticalDashboards);
        },
    },
};

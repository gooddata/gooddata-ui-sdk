// (C) 2007-2018 GoodData Corporation
import catalogItemsResponse from "./loadItems.json";
import getObjectsResponse from "./getObjects.json";
import getObjectsByQueryResponse from "./getObjectsByQuery.json";
import getVisualizationsResponse from "./getVisualizations.json";

export default {
    catalogue: {
        loadItems() {
            return new Promise((resolve) => resolve(catalogItemsResponse));
        },
    },
    md: {
        getObjectsByQuery() {
            return new Promise((resolve) => resolve(getObjectsByQueryResponse));
        },
        getObjects() {
            return new Promise((resolve) => resolve(getObjectsResponse));
        },
        getVisualizations() {
            return new Promise((resolve) => resolve(getVisualizationsResponse));
        },
    },
};

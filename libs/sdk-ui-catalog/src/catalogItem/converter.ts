// (C) 2025 GoodData Corporation

import {
    type IAttributeMetadataObject,
    type IFactMetadataObject,
    type IInsight,
    type IListedDashboard,
    type IMeasureMetadataObject,
    type IUser,
    isAttributeMetadataObject,
    isFactMetadataObject,
    isInsight,
    isListedDashboard,
    isMeasureMetadataObject,
} from "@gooddata/sdk-model";

import type { ICatalogItem } from "./types.js";
import { parseBackendDate } from "../utils/date.js";

export function convertEntityToCatalogItem(
    entity:
        | IInsight
        | IListedDashboard
        | IMeasureMetadataObject
        | IFactMetadataObject
        | IAttributeMetadataObject
        | undefined,
): ICatalogItem {
    if (isInsight(entity)) {
        return convertInsightToCatalogItem(entity);
    }
    if (isListedDashboard(entity)) {
        return convertDashboardToCatalogItem(entity);
    }
    if (isMeasureMetadataObject(entity)) {
        return convertMeasureToCatalogItem(entity);
    }
    if (isFactMetadataObject(entity)) {
        return convertFactToCatalogItem(entity);
    }
    if (isAttributeMetadataObject(entity)) {
        return convertAttributeToCatalogItem(entity);
    }
    throw new Error("Unknown entity type");
}

export function convertDashboardToCatalogItem(dashboard: IListedDashboard): ICatalogItem {
    const updatedAt = dashboard.updated || dashboard.created;
    return {
        id: dashboard.identifier,
        type: "dashboard",
        title: dashboard.title,
        tags: dashboard.tags ?? [],
        createdBy: getDisplayName(dashboard.createdBy),
        updatedAt: updatedAt ? parseBackendDate(updatedAt) : null,
    };
}

export function convertInsightToCatalogItem({ insight }: IInsight): ICatalogItem {
    const updatedAt = insight.updated || insight.created;
    return {
        id: insight.identifier,
        type: "visualization",
        title: insight.title,
        tags: insight.tags ?? [],
        createdBy: getDisplayName(insight.createdBy),
        updatedAt: updatedAt ? parseBackendDate(updatedAt) : null,
    };
}

export function convertMeasureToCatalogItem(measure: IMeasureMetadataObject): ICatalogItem {
    return {
        id: measure.id,
        type: "metric",
        title: measure.title,
        tags: measure.tags ?? [],
        createdBy: getDisplayName(measure.createdBy),
        updatedAt: measure.updated ? parseBackendDate(measure.updated) : null,
    };
}

export function convertFactToCatalogItem(fact: IFactMetadataObject): ICatalogItem {
    return {
        id: fact.id,
        type: "fact",
        title: fact.title,
        tags: fact.tags ?? [],
        createdBy: "", //TODO: Created by not defined
        updatedAt: null,
    };
}

export function convertAttributeToCatalogItem(attribute: IAttributeMetadataObject): ICatalogItem {
    return {
        id: attribute.id,
        type: "attribute",
        title: attribute.title,
        tags: attribute.tags ?? [],
        createdBy: "", //TODO: Created by not defined
        updatedAt: null,
    };
}

function getDisplayName(user?: IUser): string {
    if (user?.fullName) {
        return user.fullName;
    }
    if (user?.firstName && user?.lastName) {
        return `${user.firstName} ${user.lastName}`;
    }
    if (user?.login) {
        return user.login;
    }
    return "";
}

// (C) 2025 GoodData Corporation

import {
    type IAttributeMetadataObject,
    type IDashboard,
    type IFactMetadataObject,
    type IInsight,
    type IListedDashboard,
    type IMeasureMetadataObject,
    type IUser,
    isAttributeMetadataObject,
    isDashboard,
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
    if (isListedDashboard(entity) || isDashboard(entity)) {
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

export function convertDashboardToCatalogItem(dashboard: IDashboard | IListedDashboard): ICatalogItem {
    const updatedAt = dashboard.updated || dashboard.created;
    return {
        identifier: dashboard.identifier,
        type: "analyticalDashboard",
        title: dashboard.title,
        description: dashboard.description,
        tags: dashboard.tags ?? [],
        createdBy: getDisplayName(dashboard.createdBy),
        createdAt: dashboard.created ? parseBackendDate(dashboard.created) : null,
        updatedBy: getDisplayName(dashboard.updatedBy),
        updatedAt: updatedAt ? parseBackendDate(updatedAt) : null,
    };
}

export function convertInsightToCatalogItem({ insight }: IInsight): ICatalogItem {
    const updatedAt = insight.updated || insight.created;
    return {
        identifier: insight.identifier,
        type: "insight",
        title: insight.title,
        description: insight.summary ?? "",
        tags: insight.tags ?? [],
        createdBy: getDisplayName(insight.createdBy),
        createdAt: insight.created ? parseBackendDate(insight.created) : null,
        updatedBy: getDisplayName(insight.updatedBy),
        updatedAt: updatedAt ? parseBackendDate(updatedAt) : null,
    };
}

export function convertMeasureToCatalogItem(measure: IMeasureMetadataObject): ICatalogItem {
    return {
        identifier: measure.id,
        type: "measure",
        title: measure.title,
        description: measure.description,
        tags: measure.tags ?? [],
        createdBy: getDisplayName(measure.createdBy),
        createdAt: measure.created ? parseBackendDate(measure.created) : null,
        updatedBy: getDisplayName(measure.updatedBy),
        updatedAt: measure.updated ? parseBackendDate(measure.updated) : null,
    };
}

export function convertFactToCatalogItem(fact: IFactMetadataObject): ICatalogItem {
    return {
        identifier: fact.id,
        type: "fact",
        title: fact.title,
        description: fact.description,
        tags: fact.tags ?? [],
        createdBy: "", //TODO: Created by not defined
        createdAt: null,
        updatedBy: "", //TODO: Updated by not defined
        updatedAt: null,
    };
}

export function convertAttributeToCatalogItem(attribute: IAttributeMetadataObject): ICatalogItem {
    return {
        identifier: attribute.id,
        type: "attribute",
        title: attribute.title,
        description: attribute.description,
        tags: attribute.tags ?? [],
        createdBy: "", //TODO: Created by not defined
        createdAt: null,
        updatedBy: "", //TODO: Updated by not defined
        updatedAt: null,
    };
}

export function getDisplayName(user?: IUser): string {
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

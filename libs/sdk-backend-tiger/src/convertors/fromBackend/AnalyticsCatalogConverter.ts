// (C) 2025 GoodData Corporation

import { invariant } from "ts-invariant";

import type { AfmAnalyticsCatalogCreatedBy, AfmAnalyticsCatalogUser } from "@gooddata/api-client-tiger";
import type { IAnalyticsCatalogCreatedBy } from "@gooddata/sdk-backend-spi";
import { type IUser, idRef } from "@gooddata/sdk-model";

export function convertAnalyticsCatalogCreatedBy(
    response: AfmAnalyticsCatalogCreatedBy,
): IAnalyticsCatalogCreatedBy {
    const { users = [], reasoning = "" } = response ?? {};

    return {
        users: users.map(convertAnalyticsCatalogCreatedByUser),
        reasoning,
    };
}

function convertAnalyticsCatalogCreatedByUser(user: AfmAnalyticsCatalogUser): IUser {
    invariant(user.userId, "Analytics Catalog creator user is missing userId.");

    const firstName = user.firstname;
    const lastName = user.lastname;

    return {
        ref: idRef(user.userId, "user"),
        login: user.userId,
        firstName,
        lastName,
        fullName: firstName && lastName ? `${firstName} ${lastName}` : undefined,
    };
}

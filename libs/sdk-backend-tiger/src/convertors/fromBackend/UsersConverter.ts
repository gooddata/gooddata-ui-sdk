// (C) 2019-2024 GoodData Corporation
import isEmpty from "lodash/isEmpty.js";
import { IUser, uriRef, idRef } from "@gooddata/sdk-model";
import {
    IUserProfile,
    JsonApiUserIdentifierOutAttributes,
    JsonApiUserIdentifierToOneLinkage,
    JsonApiMetricOutIncludes,
    JsonApiAnalyticalDashboardOutIncludes,
    JsonApiAutomationOutIncludes,
} from "@gooddata/api-client-tiger";

/**
 * To preserve the typing and bootstrap concept, we are using firstName
 * as a container for full name and lastname will be an empty string
 */
export const convertUser = (user: IUserProfile): IUser => {
    const { name, userId, links, organizationName, permissions } = user;

    return {
        ref: uriRef(links!.user!),
        login: userId!,
        fullName: name,
        organizationName: organizationName,
        permissions,
    };
};

export interface IUserIdentifierLinkage {
    data: JsonApiUserIdentifierToOneLinkage | null;
}

function isJsonApiUserIdentifierOutAttributes(
    attributes: unknown,
): attributes is JsonApiUserIdentifierOutAttributes {
    const typedAttributes = attributes as JsonApiUserIdentifierOutAttributes;
    return (
        !isEmpty(typedAttributes) &&
        (typedAttributes.firstname !== undefined ||
            typedAttributes.lastname !== undefined ||
            typedAttributes.email !== undefined)
    );
}

export type IIncludedWithUserIdentifier =
    | JsonApiMetricOutIncludes
    | JsonApiAnalyticalDashboardOutIncludes
    | JsonApiAutomationOutIncludes;

/**
 * Convert user identifier link from relationships.[createdBy/modifiedBy] to {@link IUser} object.
 * @param userIdentifierLinkage - information about user link from relationships data attribute.
 * @param included - included objects to the entity query
 * @returns converted user or undefined if link is empty or does not link to anything in included array
 */
export function convertUserIdentifier(
    userIdentifierLinkage?: IUserIdentifierLinkage,
    included: IIncludedWithUserIdentifier[] = [],
): IUser | undefined {
    if (!userIdentifierLinkage?.data) {
        return undefined;
    }
    const { id, type } = userIdentifierLinkage.data;
    return included
        .filter((user) => user.id === id && user.type === type)
        .map((user) => {
            const userDetails = isJsonApiUserIdentifierOutAttributes(user.attributes)
                ? {
                      email: user.attributes?.email,
                      firstName: user.attributes?.firstname,
                      lastName: user.attributes?.lastname,
                  }
                : {};
            return {
                ref: idRef(user.id),
                login: user.id,
                ...userDetails,
            };
        })[0];
}

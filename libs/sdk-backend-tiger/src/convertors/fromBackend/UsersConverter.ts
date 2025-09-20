// (C) 2019-2025 GoodData Corporation
import { isEmpty } from "lodash-es";

import {
    IUserProfile,
    JsonApiAnalyticalDashboardOutIncludes,
    JsonApiMetricOutIncludes,
    JsonApiUserIdentifierLinkage,
    JsonApiUserIdentifierOutAttributes,
    JsonApiWorkspaceAutomationOut,
    JsonApiWorkspaceAutomationOutWithLinks,
} from "@gooddata/api-client-tiger";
import { IUser, idRef, uriRef } from "@gooddata/sdk-model";

/**
 * To preserve the typing and bootstrap concept, we are using firstName
 * as a container for full name and lastname will be an empty string
 */
export const convertUser = (user: IUserProfile): IUser => {
    const {
        name,
        userId,
        email,
        links,
        organizationName,
        organizationId,
        firstName,
        lastName,
        permissions,
        entitlements,
        deployment,
    } = user;

    return {
        ref: uriRef(links!.user!),
        login: userId!,
        fullName: name,
        email: email,
        firstName: firstName,
        lastName: lastName,
        organizationName: organizationName,
        organizationId: organizationId,
        permissions,
        entitlements,
        deployment,
    };
};

export interface IUserIdentifierLinkage {
    data: JsonApiUserIdentifierLinkage | null;
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
    | JsonApiWorkspaceAutomationOutWithLinks
    | JsonApiAnalyticalDashboardOutIncludes
    | JsonApiWorkspaceAutomationOut;

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

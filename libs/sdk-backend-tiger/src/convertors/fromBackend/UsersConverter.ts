// (C) 2019-2022 GoodData Corporation
import { IUser, uriRef } from "@gooddata/sdk-model";
import { IUserProfile } from "@gooddata/api-client-tiger";

/**
 * To perserve the typing and bootstrap concept, we are using firstName
 * as a container for full name and lastname will be an empty string
 */
export const convertUser = (user: IUserProfile): IUser => {
    const { name, userId, links, organizationName } = user;

    return {
        ref: uriRef(links!.user!),
        login: userId!,
        fullName: name,
        organizationName: organizationName,
    };
};

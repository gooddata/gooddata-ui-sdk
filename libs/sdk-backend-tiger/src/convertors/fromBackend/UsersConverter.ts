// (C) 2019-2021 GoodData Corporation
import { IUser, uriRef } from "@gooddata/sdk-model";

export interface IUserProfile {
    name: string;
    userId: string;
    organizationName: string;
    links: {
        user: string;
        organization: string;
    };
}

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

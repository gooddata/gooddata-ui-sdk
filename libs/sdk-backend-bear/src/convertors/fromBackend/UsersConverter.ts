// (C) 2019-2020 GoodData Corporation
import { IWorkspaceUser } from "@gooddata/sdk-backend-spi";
import { GdcUser } from "@gooddata/api-model-bear";
import { uriRef } from "@gooddata/sdk-model";

export const convertWorkspaceUser = (user: GdcUser.IUserListItem): IWorkspaceUser => {
    const { email, login, uri, firstName, lastName } = user;
    return {
        ref: uriRef(uri),
        email,
        login,
        uri,
        firstName: firstName ?? undefined,
        lastName: lastName ?? undefined,
    };
};

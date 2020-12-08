// (C) 2019-2020 GoodData Corporation
import { IWorkspaceUser, IUser } from "@gooddata/sdk-backend-spi";
import { GdcUser } from "@gooddata/api-model-bear";
import { uriRef } from "@gooddata/sdk-model";

export const convertUser = (user: GdcUser.IAccountSetting): IUser => {
    const { email, login, firstName, lastName, links } = user;
    return {
        ref: uriRef(links!.self!),
        email: email!,
        login: login!,
        firstName,
        lastName,
    };
};

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

// (C) 2019-2021 GoodData Corporation
import { IWorkspaceUser, IUser } from "@gooddata/sdk-backend-spi";
import { GdcUser } from "@gooddata/api-model-bear";
import { uriRef } from "@gooddata/sdk-model";

const getUserFullName = (user: GdcUser.IAccountSetting | GdcUser.IUserListItem): string | undefined => {
    const { firstName, lastName } = user;
    if (!firstName && !lastName) {
        return undefined;
    }

    return [firstName, lastName].filter(Boolean).join(" ");
};

export const convertUser = (user: GdcUser.IAccountSetting): IUser => {
    const { email, login, firstName, lastName, links } = user;
    return {
        ref: uriRef(links!.self!),
        email: email!,
        login: login!,
        firstName,
        lastName,
        fullName: getUserFullName(user),
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
        fullName: getUserFullName(user),
    };
};

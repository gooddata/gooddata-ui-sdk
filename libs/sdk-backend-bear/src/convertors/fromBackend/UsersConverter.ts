// (C) 2019-2022 GoodData Corporation
import { GdcUser } from "@gooddata/api-model-bear";
import { uriRef, IWorkspaceUser, IUser } from "@gooddata/sdk-model";

const getUserFullName = (
    firstName: string | null | undefined,
    lastName: string | null | undefined,
): string | undefined => {
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
        fullName: getUserFullName(firstName, lastName),
    };
};

export const convertWorkspaceUser = (user: GdcUser.IUserListItem): IWorkspaceUser => {
    const getStatusFromState = (
        state: GdcUser.IUserListItem["state"],
    ): IWorkspaceUser["status"] | undefined => {
        switch (state) {
            case "ACTIVE":
                return "ENABLED";
            case "INACTIVE":
                return "DISABLED";
            default:
                return;
        }
    };

    const { email, login, uri, firstName, lastName, state } = user;
    const status = getStatusFromState(state);
    const statusProp = status ? { status } : {};
    return {
        ref: uriRef(uri),
        email,
        login,
        uri,
        firstName: firstName ?? undefined,
        lastName: lastName ?? undefined,
        fullName: getUserFullName(firstName, lastName),
        ...statusProp,
    };
};

export const convertUsersItem = (user: GdcUser.IUsersItem): IWorkspaceUser => {
    const {
        content: { email, login, firstname, lastname, status },
        links,
    } = user;
    const statusProp = status ? { status } : {};
    return {
        ref: uriRef(links!.self!),
        uri: links!.self!,
        email: email!,
        login: login!,
        firstName: firstname,
        lastName: lastname,
        fullName: getUserFullName(firstname, lastname),
        ...statusProp,
    };
};

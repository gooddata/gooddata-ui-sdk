// (C) 2022-2025 GoodData Corporation
import {
    type IAutomationRecipient,
    type IWorkspaceUser,
    isAutomationUserGroupRecipient,
} from "@gooddata/sdk-model";

import { isEmail } from "./validate.js";

export function matchUser(user: IWorkspaceUser, search: string) {
    const lowerCaseSearch = search.toLowerCase();
    const lowerCaseEmail = user.email?.toLowerCase();
    const lowerCaseName = user.fullName?.toLowerCase();
    const lowerCaseId = user.login.toLowerCase();
    return (
        lowerCaseEmail?.includes(lowerCaseSearch) ||
        lowerCaseName?.includes(lowerCaseSearch) ||
        lowerCaseId?.includes(lowerCaseSearch)
    );
}

export function matchRecipient(user: IAutomationRecipient, search: string) {
    if (isAutomationUserGroupRecipient(user)) {
        return false;
    }

    const lowerCaseSearch = search.toLowerCase();
    const lowerCaseEmail = user.email?.toLowerCase();
    const lowerCaseName = user.name?.toLowerCase();
    const lowerCaseId = user.id?.toLowerCase();
    return (
        (lowerCaseEmail?.includes(lowerCaseSearch) ||
            lowerCaseName?.includes(lowerCaseSearch) ||
            lowerCaseId?.includes(lowerCaseSearch)) ??
        false
    );
}

export function createUser(search: string): IAutomationRecipient {
    const hasEmail = isEmail(search);
    return {
        id: search,
        name: search,
        type: hasEmail ? "externalUser" : "unknownUser",
        email: hasEmail ? search : undefined,
    };
}

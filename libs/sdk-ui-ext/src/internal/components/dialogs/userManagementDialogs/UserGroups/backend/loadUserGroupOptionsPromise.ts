// (C) 2023-2025 GoodData Corporation

import { type IntlShape } from "react-intl";

import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";

import { messages } from "../../locales.js";
import { type IGrantedUserGroup, type ISelectErrorOption, type IUserGroupSelectOption } from "../../types.js";
import { extractUserGroupName, sortByName } from "../../utils.js";

const createErrorOption = (intl: IntlShape): ISelectErrorOption[] => {
    return [
        {
            isDisabled: true,
            type: "error",
            label: intl.formatMessage(messages.searchUserGroupError),
        },
    ];
};

export const loadUserGroupOptionsPromise =
    (backend: IAnalyticalBackend, organizationId: string, intl: IntlShape) =>
    async (inputValue: string): Promise<IUserGroupSelectOption[] | ISelectErrorOption[]> => {
        try {
            return await backend
                .organization(organizationId)
                .users()
                .getUserGroups()
                .then((userGroups) =>
                    userGroups.filter(
                        (userGroup) =>
                            inputValue === "" ||
                            extractUserGroupName(userGroup)?.toLowerCase().includes(inputValue.toLowerCase()),
                    ),
                )
                .then((userGroups) =>
                    userGroups
                        .map(
                            (userGroup): IGrantedUserGroup => ({
                                id: userGroup.id,
                                title: extractUserGroupName(userGroup) ?? "",
                            }),
                        )
                        .sort(sortByName),
                )
                .then((matchingUserGroups) =>
                    matchingUserGroups.map((userGroup) => {
                        return {
                            label: userGroup.title,
                            value: userGroup,
                        };
                    }),
                );
        } catch {
            return createErrorOption(intl);
        }
    };

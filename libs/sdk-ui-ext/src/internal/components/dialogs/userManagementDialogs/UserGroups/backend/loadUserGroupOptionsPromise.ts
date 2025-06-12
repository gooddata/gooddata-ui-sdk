// (C) 2023 GoodData Corporation

import { IntlShape } from "react-intl";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";

import { IUserGroupSelectOption, IGrantedUserGroup, ISelectErrorOption } from "../../types.js";
import { sortByName, extractUserGroupName } from "../../utils.js";
import { messages } from "../../locales.js";

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
                            extractUserGroupName(userGroup).toLowerCase().includes(inputValue.toLowerCase()),
                    ),
                )
                .then((userGroups) =>
                    userGroups
                        .map(
                            (userGroup): IGrantedUserGroup => ({
                                id: userGroup.id,
                                title: extractUserGroupName(userGroup),
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

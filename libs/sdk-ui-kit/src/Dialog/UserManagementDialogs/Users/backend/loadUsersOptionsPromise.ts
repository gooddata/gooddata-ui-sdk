// (C) 2023 GoodData Corporation

import { IntlShape } from "react-intl";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";

import { ISelectErrorOption } from "../../../ShareDialog/ShareDialogBase/types.js";
import { IUserSelectOption, IUserMember } from "../../types.js";
import { sortByName, extractUserName } from "../../utils.js";
import { userManagementMessages } from "../../../../locales.js";

const createErrorOption = (intl: IntlShape): ISelectErrorOption[] => {
    return [
        {
            isDisabled: true,
            type: "error",
            label: intl.formatMessage(userManagementMessages.searchUserError),
        },
    ];
};

export const loadUsersOptionsPromise =
    (backend: IAnalyticalBackend, organizationId: string, intl: IntlShape) =>
    async (inputValue: string): Promise<IUserSelectOption[] | ISelectErrorOption[]> => {
        try {
            return await backend
                .organization(organizationId)
                .users()
                .getUsers()
                .then((users) =>
                    users.filter(
                        (user) =>
                            inputValue === "" ||
                            extractUserName(user).toLowerCase().includes(inputValue.toLowerCase()),
                    ),
                )
                .then((users) =>
                    users
                        .map(
                            (user): IUserMember => ({
                                id: user.id,
                                title: extractUserName(user),
                                email: user.email,
                            }),
                        )
                        .sort(sortByName),
                )
                .then((matchingUsers) =>
                    matchingUsers.map((user) => {
                        return {
                            label: user.title,
                            value: user,
                        };
                    }),
                );
        } catch {
            return createErrorOption(intl);
        }
    };

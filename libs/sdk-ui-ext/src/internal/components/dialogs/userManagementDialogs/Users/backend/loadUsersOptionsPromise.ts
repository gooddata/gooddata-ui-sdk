// (C) 2023-2024 GoodData Corporation

import { IntlShape } from "react-intl";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";

import { IUserSelectOption, IUserMember, ISelectErrorOption } from "../../types.js";
import { messages } from "../../locales.js";
import { extractUserName } from "../../utils.js";

const createErrorOption = (intl: IntlShape): ISelectErrorOption[] => {
    return [
        {
            isDisabled: true,
            type: "error",
            label: intl.formatMessage(messages.searchUserError),
        },
    ];
};

export const loadUsersOptionsPromise =
    (backend: IAnalyticalBackend, organizationId: string, intl: IntlShape) =>
    async (
        search: string,
        _options: any,
        { page }: { page: number },
    ): Promise<{
        options: IUserSelectOption[] | ISelectErrorOption[];
        hasMore: boolean;
        additional: {
            page: number;
        };
    }> => {
        try {
            return await backend
                .organization(organizationId)
                .users()
                .getUsersQuery()
                .withFilter({
                    name: search,
                })
                .withPage(page)
                .query()
                .then((result) => {
                    return {
                        options: result.items.map((item) => {
                            const userMember: IUserMember = {
                                id: item.id,
                                title: extractUserName(item),
                                email: item.email,
                            };
                            return {
                                label: item.fullName || item.id,
                                value: userMember,
                            };
                        }),
                        hasMore: result.items.length > 0,
                        additional: {
                            page: page + 1,
                        },
                    };
                });
        } catch {
            return {
                options: createErrorOption(intl),
                hasMore: false,
                additional: {
                    page: 0,
                },
            };
        }
    };

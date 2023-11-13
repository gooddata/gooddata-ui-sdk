// (C) 2023 GoodData Corporation

import { IntlShape, defineMessages } from "react-intl";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";

import { sortByName } from "../../utils.js";
import { ISelectOption, ISelectErrorOption } from "../../types.js";

const messages = defineMessages({
    searchWorkspaceError: { id: "userManagement.workspace.searchError" },
});

const createErrorOption = (intl: IntlShape): ISelectErrorOption[] => {
    return [
        {
            isDisabled: true,
            type: "error",
            label: intl.formatMessage(messages.searchWorkspaceError),
        },
    ];
};

export const loadWorkspaceOptionsPromise =
    (backend: IAnalyticalBackend, intl: IntlShape) =>
    async (inputValue: string): Promise<ISelectOption[] | ISelectErrorOption[]> => {
        try {
            const workspaces = await backend
                .workspaces()
                .forCurrentUser()
                .withSearch(inputValue)
                .query()
                .then(async (query) => {
                    const workspaces = await query.all();
                    return Promise.all(workspaces.map((workspace) => workspace.getDescriptor()));
                });

            return workspaces.sort(sortByName).map((workspace) => ({
                label: workspace.id,
                value: workspace,
            }));
        } catch {
            return createErrorOption(intl);
        }
    };

// (C) 2023 GoodData Corporation

import { IntlShape } from "react-intl";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";

import { ISelectErrorOption, } from "../../../ShareDialog/ShareDialogBase/types.js";
import { sortWorkspacesByName } from '../../utils.js';
import { ISelectOption } from "../../types.js";

const createErrorOption = (intl: IntlShape): ISelectErrorOption[] => {
    return [
        {
            isDisabled: true,
            type: "error",
            label: intl.formatMessage({ id: "userGroupDialog.workspace.searchError" }),
        },
    ];
};

/**
 * @internal
 */
export const loadWorkspaceOptionsPromise = (backend: IAnalyticalBackend, intl: IntlShape) =>
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

            return workspaces
                .sort(sortWorkspacesByName)
                .map((workspace) => ({
                    label: workspace.id,
                    value: workspace,
                }));
        } catch {
            return createErrorOption(intl);
        }
    };

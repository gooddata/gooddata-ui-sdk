// (C) 2023 GoodData Corporation

import { IntlShape } from "react-intl";

import { ISelectErrorOption, } from "../../../ShareDialog/ShareDialogBase/types.js";
import { IGroupSelectOption, IUserEditDialogApi } from "../../types.js";
import { sortGrantedGroupsByName } from "../../utils.js";

const createErrorOption = (intl: IntlShape): ISelectErrorOption[] => {
    return [
        {
            isDisabled: true,
            type: "error",
            label: intl.formatMessage({ id: "userGroupDialog.group.searchError" }),
        },
    ];
};

/**
 * @internal
 */
export const loadGroupOptionsPromise = (api: IUserEditDialogApi, intl: IntlShape) =>
    async (inputValue: string): Promise<IGroupSelectOption[] | ISelectErrorOption[]> => {
        try {
            return await api
                .getUserGroups()
                .then((response) => response.userGroups)
                .then((groups) => groups.filter((group) => {
                    const name = group.name ?? group.groupId;
                    return inputValue === "" || name.includes(inputValue);
                }))
                .then((groups) => groups
                    .map((group) => ({
                        id: group.groupId,
                        title: group.name ?? group.groupId,
                    }))
                    .sort(sortGrantedGroupsByName)
                )
                .then((matchingGroups) => matchingGroups.map((group) => {
                    return ({
                        label: group.title,
                        value: group,
                    });
                }));
        } catch {
            return createErrorOption(intl);
        }
    };

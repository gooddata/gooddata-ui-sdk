// (C) 2021 GoodData Corporation
import {
    IAnalyticalBackend,
    IWorkspaceUserGroupsQueryOptions,
    IWorkspaceUsersQueryOptions,
} from "@gooddata/sdk-backend-spi";
import { IntlShape } from "react-intl";

import { GranteeItem, IGroupedOption, ISelectErrorOption, ISelectOption } from "../types";
import { getGranteeLabel, GranteeGroupAll, hasGroupAll, sortGranteesByName } from "../utils";
import { mapWorkspaceUserGroupToGrantee, mapWorkspaceUserToGrantee } from "../../shareDialogMappers";
import { ObjRef } from "@gooddata/sdk-model";

const createErrorOption = (intl: IntlShape): ISelectErrorOption[] => {
    return [
        {
            isDisabled: true,
            type: "error",
            label: intl.formatMessage({
                id: "shareDialog.share.grantee.add.search.error.message",
            }),
        },
    ];
};

const matchAllGroupQueryString = (query: string, allGroupLabel: string): boolean => {
    return allGroupLabel.toLocaleLowerCase().indexOf(query.toLocaleLowerCase()) > -1;
};

/**
 * @internal
 */
export const loadGranteeOptionsPromise =
    (
        currentUserRef: ObjRef,
        appliedGrantees: GranteeItem[],
        backend: IAnalyticalBackend,
        workspace: string,
        intl: IntlShape,
    ) =>
    async (inputValue: string): Promise<IGroupedOption[] | ISelectErrorOption[]> => {
        let usersOption: IWorkspaceUsersQueryOptions = {};
        let groupsOption: IWorkspaceUserGroupsQueryOptions = {};

        if (inputValue) {
            usersOption = { ...usersOption, search: `%${inputValue}` };
            groupsOption = { ...groupsOption, search: `${inputValue}` };
        }

        try {
            const workspaceUsersQuery = backend.workspace(workspace).users().withOptions(usersOption).query();
            const workspaceGroupsQuery = backend.workspace(workspace).userGroups().query(groupsOption);

            const [workspaceUsers, workspaceGroups] = await Promise.all([
                workspaceUsersQuery,
                workspaceGroupsQuery,
            ]);

            const mappedUsers: ISelectOption[] = workspaceUsers.items
                .map((item) => mapWorkspaceUserToGrantee(item, currentUserRef))
                .sort(sortGranteesByName(intl))
                .map((user) => {
                    return {
                        label: getGranteeLabel(user, intl),
                        value: user,
                    };
                });

            let mappedGroups: ISelectOption[] = workspaceGroups.items
                .map(mapWorkspaceUserGroupToGrantee)
                .sort(sortGranteesByName(intl))
                .map((group) => {
                    return {
                        label: getGranteeLabel(group, intl),
                        value: group,
                    };
                });

            const allGroupLabel = getGranteeLabel(GranteeGroupAll, intl);

            if (!hasGroupAll(appliedGrantees) && matchAllGroupQueryString(inputValue, allGroupLabel)) {
                const groupAllOption: ISelectOption = {
                    label: allGroupLabel,
                    value: GranteeGroupAll,
                };
                mappedGroups = [groupAllOption, ...mappedGroups];
            }

            return [
                {
                    label: "Groups",
                    options: mappedGroups,
                },
                {
                    label: "Users",
                    options: mappedUsers,
                },
            ];
        } catch {
            return createErrorOption(intl);
        }
    };

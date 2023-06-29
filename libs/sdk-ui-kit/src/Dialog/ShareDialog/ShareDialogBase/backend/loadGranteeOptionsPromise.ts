// (C) 2021-2023 GoodData Corporation

import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { IntlShape } from "react-intl";

import { GranteeItem, IGroupedOption, ISelectErrorOption, ISelectOption } from "../types.js";
import { getGranteeLabel, GranteeGroupAll, hasGroupAll, sortGranteesByName } from "../utils.js";
import { mapWorkspaceUserGroupToGrantee, mapWorkspaceUserToGrantee } from "../../shareDialogMappers.js";
import {
    ObjRef,
    isAvailableUserGroupAccessGrantee,
    isAvailableUserAccessGrantee,
    IAvailableAccessGrantee,
    IUser,
} from "@gooddata/sdk-model";

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
        currentUser: IUser,
        sharedObjectRef: ObjRef,
        appliedGrantees: GranteeItem[],
        backend: IAnalyticalBackend,
        workspace: string,
        intl: IntlShape,
        onGranteesLoaded: (numberOfAvailableGrantees: number) => void,
    ) =>
    async (inputValue: string): Promise<IGroupedOption[] | ISelectErrorOption[]> => {
        try {
            const availableGrantees: IAvailableAccessGrantee[] = await backend
                .workspace(workspace)
                .accessControl()
                .getAvailableGrantees(sharedObjectRef, inputValue);

            const mappedUsers: ISelectOption[] = availableGrantees
                .filter(isAvailableUserAccessGrantee)
                .map((availableGrantee) => mapWorkspaceUserToGrantee(availableGrantee, currentUser))
                .sort(sortGranteesByName(intl))
                .map((user) => {
                    return {
                        label: getGranteeLabel(user, intl),
                        value: user,
                    };
                });

            let mappedGroups: ISelectOption[] = availableGrantees
                .filter(isAvailableUserGroupAccessGrantee)
                .map((availableGrantee) => mapWorkspaceUserGroupToGrantee(availableGrantee))
                .sort(sortGranteesByName(intl))
                .map((group) => {
                    return {
                        label: getGranteeLabel(group, intl),
                        value: group,
                    };
                });

            const allGroupLabel = getGranteeLabel(GranteeGroupAll, intl);
            const supportsEveryoneUserGroupForAccessControl =
                backend.capabilities.supportsEveryoneUserGroupForAccessControl;

            if (
                !hasGroupAll(appliedGrantees) &&
                matchAllGroupQueryString(inputValue, allGroupLabel) &&
                supportsEveryoneUserGroupForAccessControl
            ) {
                const groupAllOption: ISelectOption = {
                    label: allGroupLabel,
                    value: GranteeGroupAll,
                };
                mappedGroups = [groupAllOption, ...mappedGroups];
            }

            onGranteesLoaded([...mappedUsers, ...mappedGroups].length);

            return [
                {
                    label: intl.formatMessage({ id: "shareDialog.share.grantee.add.label.group" }),
                    options: mappedGroups,
                },
                {
                    label: intl.formatMessage({ id: "shareDialog.share.grantee.add.label.user" }),
                    options: mappedUsers,
                },
            ];
        } catch {
            return createErrorOption(intl);
        }
    };

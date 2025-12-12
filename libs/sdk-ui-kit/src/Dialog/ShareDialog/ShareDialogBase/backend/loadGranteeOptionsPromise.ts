// (C) 2021-2025 GoodData Corporation

import { type IntlShape } from "react-intl";

import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import {
    type IAvailableAccessGrantee,
    type IUser,
    type ObjRef,
    isAvailableUserAccessGrantee,
    isAvailableUserGroupAccessGrantee,
} from "@gooddata/sdk-model";

import { mapWorkspaceUserGroupToGrantee, mapWorkspaceUserToGrantee } from "../../shareDialogMappers.js";
import {
    type GranteeItem,
    type IGroupedOption,
    type ISelectErrorOption,
    type ISelectOption,
} from "../types.js";
import { GranteeGroupAll, GranteeRules, getGranteeLabel, hasGroupAll, sortGranteesByName } from "../utils.js";

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
                    value: backend.capabilities.supportsGranularAccessControl
                        ? GranteeRules
                        : GranteeGroupAll,
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

// (C) 2023 GoodData Corporation
import React, { KeyboardEventHandler, useCallback, useEffect, useMemo, useRef } from "react";
import debounce from "debounce-promise";
import { useIntl } from "react-intl";
import { OnChangeValue, SelectInstance } from "react-select";
import AsyncSelect from "react-select/async";

import { IUserSelectOption, IUserMember, isUserItem } from "../types.js";

import {
    EmptyRenderer,
    GroupHeadingRenderer,
    InputRendered,
    LoadingMessageRenderer,
    MenuListRendered,
    NoOptionsMessageRenderer,
    OptionRenderer,
} from "./AsyncSelectComponents.js";
import { loadUsersOptionsPromise } from "./backend/loadUsersOptionsPromise.js";
import { useBackendStrict } from "@gooddata/sdk-ui";
import { useOrganizationId } from "../OrganizationIdContext.js";
import { userManagementMessages } from "../../../locales.js";

const SEARCH_INTERVAL = 400;

export interface IAddUserSelectProps {
    onSelect: (user: IUserMember) => void;
    addedUsers: IUserMember[];
    grantedUsers: IUserMember[];
}

export const AddUserSelect: React.FC<IAddUserSelectProps> = ({ addedUsers, grantedUsers, onSelect }) => {
    const intl = useIntl();
    const selectRef = useRef<SelectInstance<any, false>>(null);
    const backend = useBackendStrict();
    const organizationId = useOrganizationId();

    useEffect(() => {
        selectRef.current.focus();
    }, []);

    const onChange = useCallback(
        (value: OnChangeValue<IUserSelectOption, boolean>) => {
            const user = (value as IUserSelectOption).value;

            if (isUserItem(user)) {
                onSelect(user);
            }
        },
        [onSelect],
    );

    const noOptionsMessage = useMemo(
        () => () => intl.formatMessage(userManagementMessages.searchUserNoMatch),
        [intl],
    );

    const loadOptions = useMemo(
        () =>
            debounce(loadUsersOptionsPromise(backend, organizationId, intl), SEARCH_INTERVAL, {
                leading: true,
            }),
        [backend, organizationId, intl],
    );

    const onKeyDownCallback: KeyboardEventHandler<HTMLInputElement> = useCallback((e) => {
        const target = e.target as HTMLInputElement;
        // react-select has default behavior on space and tab key  - open menu / select first option etc.
        // We need disable this behavior for space key by set e.preventDefault when input is empty and for tab key completely

        //space
        if (e.keyCode === 32 && !target.value) {
            e.preventDefault();
        }

        // tab
        if (e.keyCode === 9) {
            e.preventDefault();
        }
    }, []);

    const usedUsers = useMemo(
        () => (grantedUsers ? [...addedUsers, ...grantedUsers] : []),
        [addedUsers, grantedUsers],
    );

    const filterOption = (option: any) => {
        const user = option.value;
        return !usedUsers.some((usedUser) => {
            return usedUser.id === user.id;
        });
    };

    return (
        <div className="gd-share-dialog-content-select s-user-management-user-select">
            <AsyncSelect
                ref={selectRef}
                defaultMenuIsOpen={true}
                classNamePrefix="gd-share-dialog"
                components={{
                    DropdownIndicator: EmptyRenderer,
                    IndicatorSeparator: EmptyRenderer,
                    Input: InputRendered,
                    Option: OptionRenderer,
                    GroupHeading: GroupHeadingRenderer,
                    LoadingMessage: LoadingMessageRenderer,
                    LoadingIndicator: EmptyRenderer,
                    MenuList: MenuListRendered,
                    NoOptionsMessage: NoOptionsMessageRenderer,
                }}
                loadOptions={loadOptions}
                defaultOptions={true}
                placeholder={intl.formatMessage(userManagementMessages.searchUserPlaceholder)}
                onKeyDown={onKeyDownCallback}
                noOptionsMessage={noOptionsMessage}
                onChange={onChange}
                value={null}
                filterOption={filterOption}
            />
        </div>
    );
};

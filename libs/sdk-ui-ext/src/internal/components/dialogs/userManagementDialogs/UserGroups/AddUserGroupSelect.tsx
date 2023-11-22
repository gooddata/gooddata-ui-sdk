// (C) 2023 GoodData Corporation
import React, { KeyboardEventHandler, useCallback, useEffect, useMemo, useRef } from "react";
import debounce from "debounce-promise";
import { useIntl } from "react-intl";
import { OnChangeValue, SelectInstance } from "react-select";
import AsyncSelect from "react-select/async";
import { useBackendStrict } from "@gooddata/sdk-ui";

import { IUserGroupSelectOption, isGrantedUserGroup, IGrantedUserGroup } from "../types.js";
import { messages } from "../locales.js";
import { useOrganizationId } from "../OrganizationIdContext.js";

import {
    EmptyRenderer,
    GroupHeadingRenderer,
    InputRendered,
    LoadingMessageRenderer,
    MenuListRendered,
    NoOptionsMessageRenderer,
    OptionRenderer,
} from "./AsyncSelectComponents.js";
import { loadUserGroupOptionsPromise } from "./backend/loadUserGroupOptionsPromise.js";

const SEARCH_INTERVAL = 400;

export interface IAddUserGroupSelectProps {
    onSelect: (userGroup: IGrantedUserGroup) => void;
    addedUserGroups: IGrantedUserGroup[];
    grantedUserGroups: IGrantedUserGroup[];
}

export const AddUserGroupSelect: React.FC<IAddUserGroupSelectProps> = ({
    addedUserGroups,
    grantedUserGroups,
    onSelect,
}) => {
    const intl = useIntl();
    const selectRef = useRef<SelectInstance<any, false>>(null);
    const backend = useBackendStrict();
    const organizationId = useOrganizationId();

    useEffect(() => {
        selectRef.current.focus();
    }, []);

    const onChange = useCallback(
        (value: OnChangeValue<IUserGroupSelectOption, boolean>) => {
            const userGroup = (value as IUserGroupSelectOption).value;

            if (isGrantedUserGroup(userGroup)) {
                onSelect(userGroup);
            }
        },
        [onSelect],
    );

    const noOptionsMessage = useMemo(() => () => intl.formatMessage(messages.searchUserGroupNoMatch), [intl]);

    const loadOptions = useMemo(
        () =>
            debounce(loadUserGroupOptionsPromise(backend, organizationId, intl), SEARCH_INTERVAL, {
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

    const usedUserGroups = useMemo(
        () => (grantedUserGroups ? [...addedUserGroups, ...grantedUserGroups] : []),
        [addedUserGroups, grantedUserGroups],
    );

    const filterOption = (option: any) => {
        const userGroup = option.value;
        return !usedUserGroups.some((usedGroup) => {
            return usedGroup.id === userGroup.id;
        });
    };

    return (
        <div className="gd-share-dialog-content-select s-user-management-user-group-select">
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
                placeholder={intl.formatMessage(messages.searchUserGroupPlaceholder)}
                onKeyDown={onKeyDownCallback}
                noOptionsMessage={noOptionsMessage}
                onChange={onChange}
                value={null}
                filterOption={filterOption}
            />
        </div>
    );
};

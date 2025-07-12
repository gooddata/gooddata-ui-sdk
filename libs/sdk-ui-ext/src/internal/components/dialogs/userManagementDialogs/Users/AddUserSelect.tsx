// (C) 2023-2025 GoodData Corporation
import { KeyboardEventHandler, useCallback, useMemo } from "react";
import { useIntl } from "react-intl";
import { OnChangeValue } from "react-select";
import { useBackendStrict } from "@gooddata/sdk-ui";
import { AsyncPaginate } from "react-select-async-paginate";

import { IUserSelectOption, IUserMember, isUserItem } from "../types.js";
import { useOrganizationId } from "../OrganizationIdContext.js";
import { messages } from "../locales.js";

import {
    EmptyRenderer,
    GroupHeadingRenderer,
    InputRendered,
    LoadingMessageRenderer,
    MenuListRenderer,
    NoOptionsMessageRenderer,
    OptionRenderer,
} from "./AsyncSelectComponents.js";
import { loadUsersOptionsPromise } from "./backend/loadUsersOptionsPromise.js";

const SEARCH_INTERVAL = 400;

export interface IAddUserSelectProps {
    onSelect: (user: IUserMember) => void;
    addedUsers: IUserMember[];
    grantedUsers: IUserMember[];
}

export function AddUserSelect({ addedUsers, grantedUsers, onSelect }: IAddUserSelectProps) {
    const intl = useIntl();
    const backend = useBackendStrict();
    const organizationId = useOrganizationId();

    const onChange = useCallback(
        (value: OnChangeValue<IUserSelectOption, boolean>) => {
            const user = (value as IUserSelectOption).value;

            if (isUserItem(user)) {
                onSelect(user);
            }
        },
        [onSelect],
    );

    const noOptionsMessage = useMemo(() => () => intl.formatMessage(messages.searchUserNoMatch), [intl]);

    const loadOptions = useMemo(() => {
        return loadUsersOptionsPromise(backend, organizationId, intl);
    }, [backend, organizationId, intl]);

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
            <AsyncPaginate
                autoFocus
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
                    MenuList: MenuListRenderer,
                    NoOptionsMessage: NoOptionsMessageRenderer,
                }}
                loadOptions={loadOptions}
                defaultOptions={true}
                placeholder={intl.formatMessage(messages.searchUserPlaceholder)}
                onKeyDown={onKeyDownCallback}
                noOptionsMessage={noOptionsMessage}
                onChange={onChange}
                value={null}
                filterOption={filterOption}
                additional={{
                    page: 0,
                }}
                debounceTimeout={SEARCH_INTERVAL}
            />
        </div>
    );
}

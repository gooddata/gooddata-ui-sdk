// (C) 2021-2023 GoodData Corporation
import React, { KeyboardEventHandler, useCallback, useEffect, useMemo, useRef } from "react";
import debounce from "debounce-promise";
import { useIntl } from "react-intl";
import { OnChangeValue, SelectInstance } from "react-select";
import AsyncSelect from "react-select/async";

import { IGroupSelectOption, isGroupItem, IGrantedGroup, IUserEditDialogApi } from "../types.js";

import {
    EmptyRenderer,
    GroupHeadingRenderer,
    InputRendered,
    LoadingMessageRenderer,
    MenuListRendered,
    NoOptionsMessageRenderer,
    OptionRenderer,
} from "./AsyncSelectComponents.js";
import { loadGroupOptionsPromise } from './backend/loadGroupOptionsPromise.js';

const SEARCH_INTERVAL = 400;

/**
 * @internal
 */
export interface IAddGroupSelectProps {
    api: IUserEditDialogApi;
    onSelectGroup: (group: IGrantedGroup) => void;
    addedGroups: IGrantedGroup[];
    grantedGroups: IGrantedGroup[];
}

/**
 * @internal
 */
export const AddGroupSelect: React.FC<IAddGroupSelectProps> = ({ api, addedGroups, grantedGroups, onSelectGroup }) => {
    const intl = useIntl();
    const selectRef = useRef<SelectInstance<any, false>>(null);

    useEffect(() => {
        selectRef.current.focus();
    }, []);

    const onSelect = useCallback(
        (value: OnChangeValue<IGroupSelectOption, boolean>) => {
            const group = (value as IGroupSelectOption).value;

            if (isGroupItem(group)) {
                onSelectGroup(group);
            }
        },
        [onSelectGroup],
    );

    const noOptionsMessage = useMemo(
        () => () => intl.formatMessage({ id: "userGroupDialog.group.noMatchingItems" }),
        [intl],
    );

    const loadOptions = useMemo(
        () => debounce(
            loadGroupOptionsPromise(api, intl),
            SEARCH_INTERVAL,
            { leading: true },
        ),
        [api, intl],
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

    const usedGroups = useMemo(() => ([...addedGroups, ...grantedGroups]),[addedGroups, grantedGroups])

    const filterOption = (option: any) => {
        const group = option.value;
        return !usedGroups.some((usedGroup) => {
            return usedGroup.id === group.id;
        });
    };

    return (
        <div className="gd-share-dialog-content-select">
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
                placeholder={intl.formatMessage({
                    id: "userGroupDialog.group.searchPlaceholder",
                })}
                onKeyDown={onKeyDownCallback}
                noOptionsMessage={noOptionsMessage}
                onChange={onSelect}
                value={null}
                filterOption={filterOption}
            />
        </div>
    );
};

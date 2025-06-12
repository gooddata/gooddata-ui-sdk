// (C) 2021-2023 GoodData Corporation
import React, { KeyboardEventHandler, useCallback, useEffect, useMemo, useRef } from "react";
import debounce from "debounce-promise";
import { useIntl } from "react-intl";
import { OnChangeValue, SelectInstance } from "react-select";
import AsyncSelect from "react-select/async";
import { useBackendStrict } from "@gooddata/sdk-ui";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";

import { ISelectOption, IAddWorkspaceSelectProps, isWorkspaceItem } from "../types.js";
import { messages } from "../locales.js";

import {
    EmptyRenderer,
    GroupHeadingRenderer,
    InputRendered,
    LoadingMessageRenderer,
    MenuListRendered,
    NoOptionsMessageRenderer,
    OptionRenderer,
} from "./AsyncSelectComponents.js";
import { loadWorkspaceOptionsPromise } from "./backend/loadWorkspaceOptionsPromise.js";

const SEARCH_INTERVAL = 400;

export const AddWorkspaceSelect: React.FC<IAddWorkspaceSelectProps> = ({
    addedWorkspaces,
    grantedWorkspaces,
    onSelectWorkspace,
}) => {
    const backend: IAnalyticalBackend = useBackendStrict();

    const intl = useIntl();
    const selectRef = useRef<SelectInstance<any, false>>(null);

    useEffect(() => {
        selectRef.current.focus();
    }, []);

    const onSelect = useCallback(
        (value: OnChangeValue<ISelectOption, boolean>) => {
            const workspace = (value as ISelectOption).value;

            if (isWorkspaceItem(workspace)) {
                onSelectWorkspace(workspace);
            }
        },
        [onSelectWorkspace],
    );

    const noOptionsMessage = useMemo(() => () => intl.formatMessage(messages.searchWorkspaceNoMatch), [intl]);

    const loadOptions = useMemo(
        () => debounce(loadWorkspaceOptionsPromise(backend, intl), SEARCH_INTERVAL, { leading: true }),
        [backend, intl],
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

    const usedWorkspace = useMemo(
        () => (grantedWorkspaces ? [...addedWorkspaces, ...grantedWorkspaces] : []),
        [addedWorkspaces, grantedWorkspaces],
    );

    const filterOption = (option: any) => {
        const workspace = option.value;
        return !usedWorkspace.some((usedWorkspace) => {
            return usedWorkspace.id === workspace.id;
        });
    };

    return (
        <div className="gd-share-dialog-content-select s-user-management-workspace-select">
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
                placeholder={intl.formatMessage(messages.searchWorkspacePlaceholder)}
                onKeyDown={onKeyDownCallback}
                noOptionsMessage={noOptionsMessage}
                onChange={onSelect}
                value={null}
                filterOption={filterOption}
            />
        </div>
    );
};

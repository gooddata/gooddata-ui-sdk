// (C) 2021-2025 GoodData Corporation

import { KeyboardEventHandler, useCallback, useEffect, useMemo, useRef } from "react";

import debounce from "debounce-promise";
import { useIntl } from "react-intl";
import { OnChangeValue, SelectInstance } from "react-select";
import AsyncSelect from "react-select/async";

import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { useBackendStrict } from "@gooddata/sdk-ui";

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
import { messages } from "../locales.js";
import {
    IAddWorkspaceSelectProps,
    ISelectErrorOption,
    ISelectOption,
    isSelectErrorOption,
    isWorkspaceItem,
} from "../types.js";

const SEARCH_INTERVAL = 400;

export function AddWorkspaceSelect({
    addedWorkspaces,
    grantedWorkspaces,
    onSelectWorkspace,
}: IAddWorkspaceSelectProps) {
    const backend: IAnalyticalBackend = useBackendStrict();

    const intl = useIntl();
    const selectRef = useRef<SelectInstance<ISelectOption | ISelectErrorOption, false>>(null);

    useEffect(() => {
        selectRef.current.focus();
    }, []);

    const onSelect = useCallback(
        (value: OnChangeValue<ISelectOption | ISelectErrorOption, boolean>) => {
            if (!isSelectErrorOption(value)) {
                const workspace = (value as ISelectOption).value;

                if (isWorkspaceItem(workspace)) {
                    onSelectWorkspace(workspace);
                }
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
            <AsyncSelect<ISelectOption | ISelectErrorOption>
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
}

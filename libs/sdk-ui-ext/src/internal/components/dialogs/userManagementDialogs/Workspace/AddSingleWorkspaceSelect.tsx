// (C) 2024-2025 GoodData Corporation

import { KeyboardEventHandler, useCallback, useMemo } from "react";

import { useIntl } from "react-intl";
import { GroupBase, OnChangeValue } from "react-select";
import { AsyncPaginate } from "react-select-async-paginate";

import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { useBackendStrict } from "@gooddata/sdk-ui";

import {
    EmptyRenderer,
    GroupHeadingRenderer,
    LoadingMessageRenderer,
    NoOptionsMessageRenderer,
    OptionRenderer,
    SingleValueInputRenderer,
    SingleValueRenderer,
    WrappedMenuListRenderer,
} from "./AsyncSelectComponents.js";
import { loadPaginatedWorkspaceOptionsPromise } from "./backend/loadWorkspaceOptionsPromise.js";
import { messages } from "../locales.js";
import {
    IAddSingleWorkspaceSelectProps,
    ISelectErrorOption,
    ISelectOption,
    isSelectErrorOption,
    isWorkspaceItem,
} from "../types.js";

const SEARCH_INTERVAL = 400;

export function AddSingleWorkspaceSelect({
    addedWorkspace,
    grantedWorkspaces,
    onSelectWorkspace,
    mode = "EDIT",
}: IAddSingleWorkspaceSelectProps) {
    const backend: IAnalyticalBackend = useBackendStrict();
    const intl = useIntl();
    const isEditMode = mode === "EDIT";

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

    const loadOptions = useMemo(() => {
        return isEditMode && loadPaginatedWorkspaceOptionsPromise(backend, intl);
    }, [backend, intl, isEditMode]);

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
        () => (addedWorkspace ? [addedWorkspace, ...grantedWorkspaces] : grantedWorkspaces),
        [addedWorkspace, grantedWorkspaces],
    );

    const filterOption = (option: any) => {
        const workspace = option.value;
        return !usedWorkspace.some((usedWorkspace) => {
            return usedWorkspace.id === workspace.id;
        });
    };

    return (
        <div className="gd-share-dialog-content-select s-user-management-workspace-select">
            <AsyncPaginate<
                ISelectOption | ISelectErrorOption,
                GroupBase<ISelectOption | ISelectErrorOption>,
                any,
                false
            >
                autoFocus
                defaultMenuIsOpen={isEditMode}
                classNamePrefix="gd-share-dialog"
                components={{
                    IndicatorSeparator: EmptyRenderer,
                    Input: SingleValueInputRenderer,
                    Option: OptionRenderer,
                    GroupHeading: GroupHeadingRenderer,
                    LoadingMessage: LoadingMessageRenderer,
                    LoadingIndicator: EmptyRenderer,
                    MenuList: WrappedMenuListRenderer,
                    NoOptionsMessage: NoOptionsMessageRenderer,
                    SingleValue: SingleValueRenderer,
                }}
                styles={{
                    dropdownIndicator: (base) => ({
                        ...base,
                        padding: "0",
                        marginRight: "-6px",
                        svg: { height: "14px" },
                    }),
                }}
                loadOptions={loadOptions}
                defaultOptions={true}
                placeholder={intl.formatMessage(messages.searchWorkspacePlaceholder)}
                onKeyDown={onKeyDownCallback}
                noOptionsMessage={noOptionsMessage}
                onChange={onSelect}
                filterOption={filterOption}
                isMulti={false}
                isDisabled={!isEditMode}
                value={
                    addedWorkspace
                        ? ({
                              label: addedWorkspace.title,
                              value: { id: addedWorkspace.id, title: addedWorkspace.title },
                          } as ISelectOption)
                        : null
                }
                additional={{
                    page: 0,
                }}
                debounceTimeout={SEARCH_INTERVAL}
            />
        </div>
    );
}

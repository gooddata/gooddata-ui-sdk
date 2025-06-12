// (C) 2024 GoodData Corporation
import React, { KeyboardEventHandler, useCallback, useMemo } from "react";
import { useIntl } from "react-intl";
import { OnChangeValue } from "react-select";
import { AsyncPaginate } from "react-select-async-paginate";
import { useBackendStrict } from "@gooddata/sdk-ui";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";

import { ISelectOption, isWorkspaceItem, IAddSingleWorkspaceSelectProps } from "../types.js";
import { messages } from "../locales.js";

import {
    EmptyRenderer,
    GroupHeadingRenderer,
    LoadingMessageRenderer,
    WrappedMenuListRenderer,
    NoOptionsMessageRenderer,
    OptionRenderer,
    SingleValueInputRenderer,
} from "./AsyncSelectComponents.js";
import { loadPaginatedWorkspaceOptionsPromise } from "./backend/loadWorkspaceOptionsPromise.js";

const SEARCH_INTERVAL = 400;

export const AddSingleWorkspaceSelect: React.FC<IAddSingleWorkspaceSelectProps> = ({
    addedWorkspace,
    grantedWorkspaces,
    onSelectWorkspace,
    mode = "EDIT",
}) => {
    const backend: IAnalyticalBackend = useBackendStrict();
    const intl = useIntl();
    const isEditMode = mode === "EDIT";

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
            <AsyncPaginate
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
                    SingleValue: OptionRenderer,
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
                value={addedWorkspace ? { label: addedWorkspace.title } : null}
                additional={{
                    page: 0,
                }}
                debounceTimeout={SEARCH_INTERVAL}
            />
        </div>
    );
};

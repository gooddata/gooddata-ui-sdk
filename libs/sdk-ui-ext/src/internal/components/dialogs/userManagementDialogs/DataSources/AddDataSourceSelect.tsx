// (C) 2021-2025 GoodData Corporation

import React, { KeyboardEventHandler, useCallback, useEffect, useMemo, useRef } from "react";

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
import { loadUserDataSourceOptionsPromise } from "./backend/loadUserDataSourceOptionsPromise.js";
import { messages } from "../locales.js";
import {
    IAddDataSourceSelectProps,
    IDataSourceSelectOption,
    ISelectErrorOption,
    isDataSourceItem,
    isSelectErrorOption,
} from "../types.js";

const SEARCH_INTERVAL = 400;

export function AddDataSourceSelect({
    addedDataSources,
    grantedDataSources,
    onSelectDataSource,
}: IAddDataSourceSelectProps) {
    const backend: IAnalyticalBackend = useBackendStrict();

    const intl = useIntl();
    const selectRef = useRef<SelectInstance<IDataSourceSelectOption | ISelectErrorOption, false>>(null);

    useEffect(() => {
        selectRef.current.focus();
    }, []);

    const onSelect = useCallback(
        (value: OnChangeValue<IDataSourceSelectOption | ISelectErrorOption, boolean>) => {
            if (!isSelectErrorOption(value)) {
                const dataSource = (value as IDataSourceSelectOption).value;
                if (isDataSourceItem(dataSource)) {
                    onSelectDataSource(dataSource);
                }
            }
        },
        [onSelectDataSource],
    );

    const noOptionsMessage = useMemo(
        () => () => intl.formatMessage(messages.searchDataSourceNoMatch),
        [intl],
    );

    const loadOptions = useMemo(
        () => debounce(loadUserDataSourceOptionsPromise(backend, intl), SEARCH_INTERVAL, { leading: true }),
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

    const usedDataSources = useMemo(
        () => (grantedDataSources ? [...addedDataSources, ...grantedDataSources] : []),
        [addedDataSources, grantedDataSources],
    );

    const filterOption = (option: any) => {
        const dataSource = option.value;
        return !usedDataSources.some((usedDataSource) => {
            return usedDataSource.id === dataSource.id;
        });
    };

    return (
        <div className="gd-share-dialog-content-select s-user-management-data-source-select">
            <AsyncSelect<IDataSourceSelectOption | ISelectErrorOption>
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
                placeholder={intl.formatMessage(messages.searchDataSourcePlaceholder)}
                onKeyDown={onKeyDownCallback}
                noOptionsMessage={noOptionsMessage}
                onChange={onSelect}
                value={null}
                filterOption={filterOption}
            />
        </div>
    );
}

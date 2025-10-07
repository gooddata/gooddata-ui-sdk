// (C) 2021-2025 GoodData Corporation

import { KeyboardEventHandler, useCallback, useEffect, useMemo, useRef, useState } from "react";

import debounce from "debounce-promise";
import { useIntl } from "react-intl";
import { OnChangeValue, SelectInstance } from "react-select";
import AsyncSelect from "react-select/async";

import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { areObjRefsEqual } from "@gooddata/sdk-model";
import { useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";

import {
    EmptyRenderer,
    GroupHeadingRenderer,
    InputRendered,
    LoadingMessageRenderer,
    MenuListRendered,
    NoOptionsMessageRenderer,
    OptionRenderer,
} from "./AsyncSelectComponents.js";
import { loadGranteeOptionsPromise } from "./backend/loadGranteeOptionsPromise.js";
import { useShareDialogInteraction } from "./ComponentInteractionContext.js";
import { IAddGranteeSelectProps, ISelectOption, isGranteeItem } from "./types.js";
import { ADD_GRANTEE_SELECT_ID } from "./utils.js";

const SEARCH_INTERVAL = 400;

/**
 * @internal
 */
export function AddGranteeSelect(props: IAddGranteeSelectProps) {
    const { appliedGrantees, currentUser, sharedObjectRef, onSelectGrantee } = props;
    const [inputValue, setInputValue] = useState<string>("");
    const backend: IAnalyticalBackend = useBackendStrict();
    const workspace: string = useWorkspaceStrict();
    const { availableGranteeListOpenInteraction } = useShareDialogInteraction();

    const intl = useIntl();
    const selectRef = useRef<SelectInstance<any, false>>(null);

    useEffect(() => {
        selectRef.current.focus();
    }, []);

    const onSelect = useCallback(
        (value: OnChangeValue<ISelectOption, boolean>) => {
            const grantee = (value as ISelectOption).value;

            if (isGranteeItem(grantee)) {
                onSelectGrantee(grantee);
            }
        },
        [onSelectGrantee],
    );

    const noOptionsMessage = useMemo(
        () => () => {
            return intl.formatMessage({
                id: "shareDialog.share.grantee.add.search.no.matching.items",
            });
        },
        [intl],
    );

    const loadOptions = useMemo(
        () =>
            debounce(
                loadGranteeOptionsPromise(
                    currentUser,
                    sharedObjectRef,
                    appliedGrantees,
                    backend,
                    workspace,
                    intl,
                    availableGranteeListOpenInteraction,
                ),
                SEARCH_INTERVAL,
                {
                    leading: true,
                },
            ),
        [
            backend,
            workspace,
            intl,
            appliedGrantees,
            currentUser,
            sharedObjectRef,
            availableGranteeListOpenInteraction,
        ],
    );

    const onKeyDownCallback: KeyboardEventHandler<HTMLInputElement> = useCallback((e) => {
        const target = e.target as HTMLInputElement;
        // react-select has default behavior on space and tab key  - open menu / select first option etc.
        // We need disable this behavior for space key by set e.preventDefault when input is empty and for tab key completely

        //space
        if (e.key === " " && !target.value) {
            e.preventDefault();
        }

        // tab
        if (e.key === "Tab") {
            e.preventDefault();
        }

        // escape
        if (e.key === "Escape") {
            e.stopPropagation();
            setInputValue("");
        }
    }, []);

    const filterOption = (option: any) => {
        const grantee = option.value;

        if (isGranteeItem(grantee)) {
            return !appliedGrantees.some((g) => {
                return areObjRefsEqual(g.id, grantee.id);
            });
        }

        return true;
    };

    return (
        <div className="gd-share-dialog-content-select">
            <AsyncSelect
                inputId={ADD_GRANTEE_SELECT_ID}
                ref={selectRef}
                defaultMenuIsOpen
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
                defaultOptions
                placeholder={intl.formatMessage({
                    id: "shareDialog.share.grantee.add.search.placeholder",
                })}
                onKeyDown={onKeyDownCallback}
                noOptionsMessage={noOptionsMessage}
                onChange={onSelect}
                value={null}
                filterOption={filterOption}
                onInputChange={(newValue, actionMeta) => {
                    // Prevent clearing input on blur
                    if (actionMeta.action !== "menu-close" && actionMeta.action !== "input-blur") {
                        setInputValue(newValue);
                    }
                }}
                inputValue={inputValue}
            />
        </div>
    );
}

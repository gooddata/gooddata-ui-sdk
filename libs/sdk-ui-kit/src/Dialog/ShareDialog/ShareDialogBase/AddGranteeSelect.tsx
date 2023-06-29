// (C) 2021-2023 GoodData Corporation
import React, { KeyboardEventHandler, useCallback, useEffect, useMemo, useRef } from "react";
import debounce from "debounce-promise";
import { useIntl } from "react-intl";
import { OnChangeValue, SelectInstance } from "react-select";
import AsyncSelect from "react-select/async";
import { useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { areObjRefsEqual } from "@gooddata/sdk-model";

import { IAddGranteeSelectProps, ISelectOption, isGranteeItem } from "./types.js";

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

const SEARCH_INTERVAL = 400;

/**
 * @internal
 */
export const AddGranteeSelect: React.FC<IAddGranteeSelectProps> = (props) => {
    const { appliedGrantees, currentUser, sharedObjectRef, onSelectGrantee } = props;
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
        if (e.keyCode === 32 && !target.value) {
            e.preventDefault();
        }

        // tab
        if (e.keyCode === 9) {
            e.preventDefault();
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
                    id: "shareDialog.share.grantee.add.search.placeholder",
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

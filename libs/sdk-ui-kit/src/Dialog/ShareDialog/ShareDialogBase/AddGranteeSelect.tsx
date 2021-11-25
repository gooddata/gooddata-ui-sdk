// (C) 2021 GoodData Corporation
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import debounce from "debounce-promise";
import { useIntl } from "react-intl";
import { ValueType } from "react-select";
import AsyncSelect from "react-select/async";
import { useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { areObjRefsEqual } from "@gooddata/sdk-model";

import { IAddGranteeSelectProps, ISelectOption, isGranteeItem } from "./types";

import {
    EmptyRenderer,
    GroupHeadingRenderer,
    InputRendered,
    LoadingMessageRenderer,
    MenuListRendered,
    NoOptionsMessageRenderer,
    OptionRenderer,
} from "./AsyncSelectComponents";
import { loadGranteeOptionsPromise } from "./backend/loadGranteeOptionsPromise";

const SEARCH_INTERVAL = 400;

/**
 * @internal
 */
export const AddGranteeSelect: React.FC<IAddGranteeSelectProps> = (props) => {
    const { appliedGrantees, currentUserRef, onSelectGrantee } = props;

    const backend: IAnalyticalBackend = useBackendStrict();
    const workspace: string = useWorkspaceStrict();

    const intl = useIntl();
    const selectRef = useRef<AsyncSelect<ISelectOption, false>>(null);

    useEffect(() => {
        selectRef.current.focus();
    }, []);

    const onSelect = useCallback(
        (value: ValueType<ISelectOption, boolean>) => {
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
        [],
    );

    const loadOptions = useMemo(
        () =>
            debounce(
                loadGranteeOptionsPromise(currentUserRef, appliedGrantees, backend, workspace, intl),
                SEARCH_INTERVAL,
                {
                    leading: true,
                },
            ),
        [backend, workspace, intl, appliedGrantees],
    );

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
                noOptionsMessage={noOptionsMessage}
                onChange={onSelect}
                value={null}
                filterOption={filterOption}
            />
        </div>
    );
};

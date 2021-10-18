// (C) 2021 GoodData Corporation
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { useIntl } from "react-intl";
import Select, { ValueType, components as ReactSelectComponents, InputProps } from "react-select";
import { IAddGranteeSelectProps, ISelectOption } from "./types";
import { getGranteeItemTestId } from "./utils";

/**
 * @internal
 */
export const AddGranteeSelect: React.FC<IAddGranteeSelectProps> = (props) => {
    const { granteesOption, onSelectGrantee } = props;

    const intl = useIntl();
    const selectRef = useRef(null);

    useEffect(() => {
        selectRef.current.focus();
    }, []);

    const onSelect = useCallback(
        (value: ValueType<ISelectOption, boolean>) => {
            const grantee = (value as ISelectOption).value;
            onSelectGrantee(grantee);
        },
        [onSelectGrantee],
    );

    const onInputChange = useCallback(() => {
        selectRef.current.select.getNextFocusedOption = () => false;
    }, []);

    const noOptionsMessage = useMemo(
        () => () => {
            return intl.formatMessage({
                id: "shareDialog.share.grantee.add.search.no.matching.items",
            });
        },
        [],
    );

    const DropdownIndicator = (): JSX.Element => {
        return null;
    };

    const IndicatorSeparator = (): JSX.Element => {
        return null;
    };

    const InputRendered = (props: InputProps): JSX.Element => {
        return (
            <div className="gd-share-dialog-input s-gd-share-dialog-input">
                <ReactSelectComponents.Input {...props} />
            </div>
        );
    };

    const Option = (props: any): JSX.Element => {
        const { value } = props;
        const idStyle = getGranteeItemTestId(value, "option");

        return (
            <div className={idStyle}>
                <ReactSelectComponents.Option {...props} />
            </div>
        );
    };

    return (
        <div className="gd-share-dialog-content-select">
            <Select
                ref={selectRef}
                onInputChange={onInputChange}
                defaultMenuIsOpen={true}
                classNamePrefix="gd-share-dialog"
                components={{ DropdownIndicator, IndicatorSeparator, Input: InputRendered, Option }}
                options={granteesOption}
                defaultValue={undefined}
                placeholder={intl.formatMessage({
                    id: "shareDialog.share.grantee.add.search.placeholder",
                })}
                noOptionsMessage={noOptionsMessage}
                onChange={onSelect}
                value={null}
            />
        </div>
    );
};

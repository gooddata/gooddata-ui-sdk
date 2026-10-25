// (C) 2007-2026 GoodData Corporation

import { type ReactElement } from "react";

import classNames from "classnames";
import { FormattedMessage } from "react-intl";

import { simplifyText } from "@gooddata/util";

import { type IOperandDropdownItem } from "./model/operand_dropdown_item.js";

export interface IOperandDropdownItemProps {
    onSelect: (source: IOperandDropdownItem) => void;
    onMouseEnter: (localIdentifier: string) => void;
    onMouseLeave: () => void;
    selected: boolean;
    source: IOperandDropdownItem;
}

export function OperandDropdownItem({
    onSelect,
    onMouseEnter,
    onMouseLeave,
    selected,
    source,
}: IOperandDropdownItemProps): ReactElement {
    const getClassNames = (): string => {
        return classNames(
            "gd-list-item",
            "s-ad-operand-item",
            "has-only-visible",
            `s-${simplifyText(getTitle())}`,
            {
                "is-selected": selected,
                "s-is-selected": selected,
            },
        );
    };

    const getTitle = (): string => {
        return source.title;
    };

    const handleSelect = () => {
        onSelect(source);
    };

    const handleOnMouseEnter = () => {
        onMouseEnter(source.localIdentifier);
    };

    const handleOnMouseLeave = () => {
        onMouseLeave();
    };

    const renderTitle = (): ReactElement => {
        const { sequenceNumber } = source;
        return (
            <span>
                <span className="adi-am-selector-name">
                    <FormattedMessage
                        id="bucket.title.measureSequenceNumber"
                        values={{ measureSequenceNumber: sequenceNumber }}
                    />
                </span>
                <span className={"adi-am-selector-subtitle"}> ({getTitle()})</span>
            </span>
        );
    };

    return (
        <div
            className={getClassNames()}
            onClick={handleSelect}
            onMouseEnter={handleOnMouseEnter}
            onMouseLeave={handleOnMouseLeave}
            title={getTitle()}
        >
            {renderTitle()}
        </div>
    );
}

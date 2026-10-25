// (C) 2007-2026 GoodData Corporation

import { type MouseEvent, memo } from "react";

import classNames from "classnames";
import { FormattedMessage } from "react-intl";

import { simplifyText } from "@gooddata/util";

import { type IComparedMeasure } from "./model/compared_measure_typing.js";

export interface IComparedMeasuresDropdownItemProps {
    onOnly?: (source: IComparedMeasure) => void;
    onSelect?: (source: IComparedMeasure) => void;
    selected?: boolean;
    source?: IComparedMeasure;
}

export const ComparedMeasuresDropdownItem = memo(function ComparedMeasuresDropdownItem({
    onOnly = () => {},
    onSelect = () => {},
    selected = false,
    source = null,
}: IComparedMeasuresDropdownItemProps) {
    const getTitle = () => {
        const { alias, title } = source;
        return alias || title;
    };

    const getClassNames = () => {
        return classNames(
            "gd-list-item",
            "has-only-visible",
            "s-compare-measures-list-item",
            `s-${simplifyText(getTitle())}`,
            {
                "is-selected": selected,
                "s-is-selected": selected,
            },
        );
    };

    const handleSelect = () => {
        onSelect(source);
    };

    const handleOnly = (e: MouseEvent<HTMLSpanElement>) => {
        e.stopPropagation();

        onOnly(source);
    };

    const { sequenceNumber } = source;

    return (
        <div className={getClassNames()} onClick={handleSelect} title={getTitle()}>
            <input
                type="checkbox"
                readOnly
                checked={selected}
                className="s-compare-measures-list-item-checkbox"
            />
            <span className="s-compare-measures-list-item-title">
                {getTitle()}
                <span className="adi-compare-measures-list-item-sequence s-compare-measures-list-item-sequence">
                    <FormattedMessage
                        id="bucket.title.measureSequenceNumber"
                        values={{ measureSequenceNumber: sequenceNumber }}
                    />
                </span>
            </span>
            <span className="gd-list-item-only" onClick={handleOnly}>
                <FormattedMessage id="gs.list.only" />
            </span>
        </div>
    );
});

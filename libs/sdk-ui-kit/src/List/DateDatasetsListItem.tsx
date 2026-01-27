// (C) 2007-2026 GoodData Corporation

import { type MouseEvent } from "react";

import cx from "classnames";
import { FormattedMessage } from "react-intl";

import { simplifyText } from "@gooddata/util";

import { ShortenedText } from "../ShortenedText/ShortenedText.js";

/**
 * @internal
 */
export interface IDateDatasetsListItemProps {
    id?: string;
    title?: string;
    isHeader?: boolean;
    isSelected?: boolean;
    isUnrelated?: boolean;
    onClick: (e: MouseEvent<HTMLDivElement>) => void;
}

/**
 * @internal
 */
export function DateDatasetsListItem({
    id,
    title,
    isHeader,
    isSelected,
    isUnrelated,
    onClick,
}: IDateDatasetsListItemProps) {
    if (isHeader) {
        return (
            <div className="gd-list-item gd-list-item-header">
                <FormattedMessage id={title} />
            </div>
        );
    }

    const classNames = cx(
        "gd-list-item",
        "gd-list-item-shortened",
        `s-${id}`,
        `s-${simplifyText(title ?? "")}`,
        {
            "is-selected": isSelected,
            "is-unrelated": isUnrelated,
        },
    );

    const tooltipAlignPoints = [
        { align: "cl cr", offset: { x: -10, y: 0 } },
        { align: "cr cl", offset: { x: 10, y: 0 } },
    ];

    return (
        <div className={classNames} onClick={onClick}>
            <ShortenedText tooltipAlignPoints={tooltipAlignPoints}>{title ?? ""}</ShortenedText>
        </div>
    );
}

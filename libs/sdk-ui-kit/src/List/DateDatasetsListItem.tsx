// (C) 2007-2025 GoodData Corporation
import { MouseEvent } from "react";
import { FormattedMessage } from "react-intl";
import cx from "classnames";
import { stringUtils } from "@gooddata/util";
import { ShortenedText } from "../ShortenedText/index.js";

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
        `s-${stringUtils.simplifyText(title)}`,
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
            <ShortenedText tooltipAlignPoints={tooltipAlignPoints}>{title}</ShortenedText>
        </div>
    );
}

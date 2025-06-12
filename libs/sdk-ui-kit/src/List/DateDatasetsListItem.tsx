// (C) 2007-2020 GoodData Corporation
import React from "react";
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
    onClick: (e: React.MouseEvent<HTMLDivElement>) => void;
}

/**
 * @internal
 */
export const DateDatasetsListItem: React.FC<IDateDatasetsListItemProps> = ({
    id,
    title,
    isHeader,
    isSelected,
    isUnrelated,
    onClick,
}) => {
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
};

// (C) 2007-2026 GoodData Corporation

import { type MouseEvent, useEffect, useRef } from "react";

import cx from "classnames";

import { simplifyText } from "@gooddata/util";

import { ShortenedText } from "../ShortenedText/ShortenedText.js";

/**
 * @internal
 */
export const DATE_DATASET_LIST_ITEM_CLASSNAME = "gd-list-item gd-list-item-shortened";

/**
 * @internal
 */
export interface IDateDatasetsListItemProps {
    id?: string;
    title?: string;
    isHeader?: boolean;
    isSelected?: boolean;
    isUnrelated?: boolean;
    width?: number;
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
    width,
    onClick,
}: IDateDatasetsListItemProps) {
    const shortenedTextRef = useRef<ShortenedText>(null);
    const currentWidthRef = useRef<number | undefined>(width);

    useEffect(() => {
        if (shortenedTextRef.current && currentWidthRef.current !== width) {
            currentWidthRef.current = width;
            shortenedTextRef.current.recomputeShortening();
        }
    }, [width]);

    if (isHeader) {
        return <div className="gd-list-item gd-list-item-header">{title}</div>;
    }

    const classNames = cx(DATE_DATASET_LIST_ITEM_CLASSNAME, `s-${id}`, `s-${simplifyText(title ?? "")}`, {
        "is-selected": isSelected,
        "is-unrelated": isUnrelated,
    });

    const tooltipAlignPoints = [
        { align: "cl cr", offset: { x: -10, y: 0 } },
        { align: "cr cl", offset: { x: 10, y: 0 } },
    ];

    return (
        <div className={classNames} onClick={onClick}>
            <ShortenedText
                ref={shortenedTextRef}
                tooltipAlignPoints={tooltipAlignPoints}
                ellipsisPosition="end"
            >
                {title ?? ""}
            </ShortenedText>
        </div>
    );
}

// (C) 2023-2025 GoodData Corporation
import React, { useMemo } from "react";

import cx from "classnames";

import { ICatalogDateDataset } from "@gooddata/sdk-model";
import { ShortenedText } from "@gooddata/sdk-ui-kit";
import { stringUtils } from "@gooddata/util";

interface IAttributeListItemProps {
    item: ICatalogDateDataset;
    title?: string;
    onClick: () => void;
}

const TOOLTIP_ALIGN_POINT = [
    { align: "cr cl", offset: { x: 10, y: 0 } },
    { align: "cl cr", offset: { x: -10, y: 0 } },
];

function DateAttributeListItem({ item, title, onClick }: IAttributeListItemProps) {
    const classNames = useMemo(() => {
        return cx(`s-${stringUtils.simplifyText(item.dataSet.title)}`, "gd-attribute-list-item", {
            "gd-list-item": true,
            "gd-list-item-shortened": true,
            "type-date": true,
        });
    }, [item]);

    return (
        <div key={item.dataSet.id} className={classNames} onClick={onClick}>
            <ShortenedText tooltipAlignPoints={TOOLTIP_ALIGN_POINT}>
                {getDateAttributeListItemTitle(item, title)}
            </ShortenedText>
        </div>
    );
}

export const getDateAttributeListItemTitle = (item: ICatalogDateDataset, title?: string) => {
    return title ?? item.dataSet.title;
};

export default DateAttributeListItem;

// (C) 2023 GoodData Corporation
import React, { useMemo } from "react";
import { ICatalogDateDataset } from "@gooddata/sdk-model";
import cx from "classnames";
import { stringUtils } from "@gooddata/util";
import { ShortenedText } from "@gooddata/sdk-ui-kit";

interface IAttributeListItemProps {
    item: ICatalogDateDataset;
    onClick: () => void;
}

const TOOLTIP_ALIGN_POINT = [
    { align: "cr cl", offset: { x: 10, y: 0 } },
    { align: "cl cr", offset: { x: -10, y: 0 } },
];

const DateAttributeListItem: React.FC<IAttributeListItemProps> = ({ item, onClick }) => {
    const classNames = useMemo(() => {
        return cx(`s-${stringUtils.simplifyText(item.dataSet.title)}`, "gd-attribute-list-item", {
            "gd-list-item": true,
            "gd-list-item-shortened": true,
            "type-date": true,
        });
    }, [item]);

    return (
        <div key={item.dataSet.id} className={classNames} onClick={onClick}>
            <ShortenedText tooltipAlignPoints={TOOLTIP_ALIGN_POINT}>{item.dataSet.title}</ShortenedText>
        </div>
    );
};

export default DateAttributeListItem;

// (C) 2023-2025 GoodData Corporation
import React, { useMemo } from "react";

import cx from "classnames";
import isEmpty from "lodash/isEmpty.js";

import { ICatalogAttribute } from "@gooddata/sdk-model";
import { ShortenedText } from "@gooddata/sdk-ui-kit";
import { stringUtils } from "@gooddata/util";

import { AttributeListItemTooltip } from "./attributeListItemTooltip/AttributeListItemTooltip.js";

interface IAttributeListItemProps {
    item: ICatalogAttribute;
    title?: string;
    isLocationIconEnabled: boolean;
    onClick: () => void;
}

const TOOLTIP_ALIGN_POINT = [
    { align: "cr cl", offset: { x: 10, y: 0 } },
    { align: "cl cr", offset: { x: -10, y: 0 } },
];

function AttributeListItem({ item, title, isLocationIconEnabled, onClick }: IAttributeListItemProps) {
    const classNames = useMemo(() => {
        const isDisplayLocationIcon = isLocationIconEnabled && !isEmpty(item?.geoPinDisplayForms);
        return cx(`s-${stringUtils.simplifyText(item.attribute.title)}`, "gd-attribute-list-item", {
            "gd-list-item": true,
            "gd-list-item-shortened": true,
            "type-attribute": !isDisplayLocationIcon,
            "type-geo_attribute": isDisplayLocationIcon,
        });
    }, [item, isLocationIconEnabled]);

    return (
        <div key={item.attribute.id} className={classNames} onClick={onClick}>
            <ShortenedText tooltipAlignPoints={TOOLTIP_ALIGN_POINT}>
                {title ?? item.attribute.title}
            </ShortenedText>
            <AttributeListItemTooltip item={item} />
        </div>
    );
}

export default AttributeListItem;

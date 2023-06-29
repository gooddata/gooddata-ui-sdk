// (C) 2021-2022 GoodData Corporation
import React from "react";
import cx from "classnames";
import { IAvailableDrillTargetAttribute } from "@gooddata/sdk-ui";
import { useDashboardSelector, selectCatalogDateDatasets } from "../../../../../model/index.js";
import { areObjRefsEqual } from "@gooddata/sdk-model";

export interface IDrillAttributeSelectorItemStateProps {
    isDateAttribute: boolean;
}

export interface IFilterDrillAttributeSelectorItemProps {
    item: IAvailableDrillTargetAttribute;
    onClick: (item: IAvailableDrillTargetAttribute) => void;
    onCloseDropdown: () => void;
}

export const DrillAttributeSelectorItem: React.FunctionComponent<IFilterDrillAttributeSelectorItemProps> = (
    props,
) => {
    const { item } = props;
    const onClick = () => {
        props.onClick(item);
        props.onCloseDropdown();
    };
    const name = item.attribute.attributeHeader.formOf.name;

    const dateAttributes = useDashboardSelector(selectCatalogDateDatasets);
    const isFromDateAttribute = dateAttributes.some((attribute) =>
        attribute.dateAttributes.some((dateAttribute) =>
            areObjRefsEqual(dateAttribute.attribute.ref, item.attribute.attributeHeader.formOf.ref),
        ),
    );

    return (
        <a
            onClick={onClick}
            className={cx("s-drill-attribute-selector-item", {
                "gd-drill-attribute-selector-list-item": !isFromDateAttribute,
                "gd-drill-attribute-date-selector-list-item": isFromDateAttribute,
            })}
            title={name}
        >
            {name}
        </a>
    );
};

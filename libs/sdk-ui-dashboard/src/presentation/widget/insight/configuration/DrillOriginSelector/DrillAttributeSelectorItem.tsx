// (C) 2021-2025 GoodData Corporation

import cx from "classnames";

import { areObjRefsEqual } from "@gooddata/sdk-model";
import { IAvailableDrillTargetAttribute } from "@gooddata/sdk-ui";

import { selectCatalogDateDatasets, useDashboardSelector } from "../../../../../model/index.js";

export interface IDrillAttributeSelectorItemStateProps {
    isDateAttribute: boolean;
}

export interface IFilterDrillAttributeSelectorItemProps {
    item: IAvailableDrillTargetAttribute;
    onClick: (item: IAvailableDrillTargetAttribute) => void;
    onCloseDropdown: () => void;
}

export function DrillAttributeSelectorItem(props: IFilterDrillAttributeSelectorItemProps) {
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
}

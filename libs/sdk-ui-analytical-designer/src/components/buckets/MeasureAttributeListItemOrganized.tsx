// (C) 2019-2026 GoodData Corporation

import { useCallback, useMemo } from "react";

import classNames from "classnames";

import { type ObjRef } from "@gooddata/sdk-model";

import { getCssClass } from "../../utils/css_class.js";
import { CatalogDetailsBubble } from "../catalog/item/CatalogDetailsBubble.js";

export interface IMeasureAttributeFilterItem {
    title: string;
    identifier: string;
    type: string;
    ref: ObjRef;
    //default label
    dfUri: string;
    dfRef: ObjRef;
    //primary label
    primaryUri: string;
    primaryRef: ObjRef;
    isLocationIconVisible?: boolean;
    /** the attribute's dataset, which the catalog item picker groups by */
    dataset?: { identifier: ObjRef; title: string };
}

interface IMeasureAttributeListItemOrganizedProps {
    disabled: boolean;
    item: IMeasureAttributeFilterItem;
    onClick: (item: IMeasureAttributeFilterItem) => void;
}

export function MeasureAttributeListItemOrganized({
    item,
    disabled,
    onClick,
}: IMeasureAttributeListItemOrganizedProps) {
    const classes = useMemo(
        () =>
            classNames(
                "s-filter-item",
                "adi-filter-item",
                "adi-attr-filter-picker-list-item",
                getCssClass(item.identifier, "s-bubble-id-"),
                getCssClass(item.title, "s-"),
                { "is-disabled": disabled },
            ),
        [item, disabled],
    );

    const onClickEvent = useCallback(() => {
        if (!disabled) {
            onClick(item);
        }
    }, [item, disabled, onClick]);
    const { isLocationIconVisible } = item;
    const fieldIconClassName = classNames({
        "geo-attr-field-icon": isLocationIconVisible,
        "attr-field-icon": !isLocationIconVisible,
    });

    return (
        <div className={classes} onClick={onClickEvent}>
            <span className={fieldIconClassName} />
            <span className="attr-field-name">{item.title}</span>
            <CatalogDetailsBubble item={item} offsetX={0} offsetY={0} />
        </div>
    );
}

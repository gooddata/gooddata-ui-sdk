// (C) 2021-2026 GoodData Corporation

import { useMemo } from "react";

import cx from "classnames";

import { type ICatalogAttribute } from "@gooddata/sdk-model";
import { type IRenderListItemProps } from "@gooddata/sdk-ui-kit";
import { simplifyText } from "@gooddata/util";

export interface IAttributeDropdownListItemProps extends IRenderListItemProps<ICatalogAttribute> {
    selected: boolean;
    onSelect?: (item: ICatalogAttribute) => void;
    onMouseOver?: (item: ICatalogAttribute) => void;
    onMouseOut?: (item: ICatalogAttribute) => void;
}

export function AttributeDropdownListItem(props: IAttributeDropdownListItemProps) {
    const { item, selected, onSelect, onMouseOver, onMouseOut } = props;
    const itemId = useMemo(() => `attr-filter-item-${Math.random().toString(36).slice(2)}`, []);

    const className = cx("gd-list-item", "attribute-filter-item", "has-only-visible", {
        "is-selected": selected,
        [`s-${simplifyText(item.defaultDisplayForm.title)}`]: true,
    });

    function handleSelect() {
        onSelect?.(item);
    }

    function handleMouseOver() {
        onMouseOver?.(item);
    }

    function handleMouseOut() {
        onMouseOut?.(item);
    }

    return (
        <div
            className={className}
            onClick={handleSelect}
            onMouseOver={handleMouseOver}
            onMouseOut={handleMouseOut}
            title={item.defaultDisplayForm.title}
        >
            <label className="input-checkbox-label">
                <input
                    id={itemId}
                    type="checkbox"
                    className="input-checkbox"
                    readOnly
                    checked={props.selected}
                />
                <span className="input-label-text">{item.defaultDisplayForm.title}</span>
            </label>
        </div>
    );
}

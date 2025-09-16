// (C) 2020-2025 GoodData Corporation

import { useCallback } from "react";

import cx from "classnames";

import { IAttributeWithDisplayForm } from "./types.js";

export interface IAttributeUrlSectionItemProps {
    item: IAttributeWithDisplayForm;
    isSelected: boolean;
    onClickHandler?: (item: IAttributeWithDisplayForm) => void;
}

export function AttributeUrlSectionItem({ item, onClickHandler, isSelected }: IAttributeUrlSectionItemProps) {
    const className = cx(
        "gd-list-item gd-menu-item gd-drill-to-attribute-url-option s-drill-to-attribute-url-option gd-icon-hyperlink-warning",
        {
            "is-selected": isSelected,
        },
    );

    const onClick = useCallback(() => {
        if (!onClickHandler) {
            return;
        }

        onClickHandler(item);
    }, [item, onClickHandler]);

    return (
        <div className={className} onClick={onClick}>
            <span className="gd-parameter-title">{item.attribute.title}</span>
            <span className="addon">({item.displayForm.title})</span>
        </div>
    );
}

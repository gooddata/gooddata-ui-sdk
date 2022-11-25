// (C) 2020-2022 GoodData Corporation
import React from "react";
import cx from "classnames";
import { IAttributeWithDisplayForm } from "./types";

export interface IAttributeUrlSectionItemProps {
    item: IAttributeWithDisplayForm;
    isSelected: boolean;
    onClickHandler?: (e: React.SyntheticEvent) => void;
}

export const AttributeUrlSectionItem: React.FC<IAttributeUrlSectionItemProps> = ({
    item,
    onClickHandler,
    isSelected,
}) => {
    const className = cx(
        "gd-list-item gd-menu-item gd-drill-to-attribute-url-option s-drill-to-attribute-url-option gd-icon-hyperlink-warning",
        {
            "is-selected": isSelected,
        },
    );

    return (
        <div className={className} onClick={onClickHandler}>
            <span className="gd-parameter-title">{item.attribute.title}</span>
            <span className="addon">({item.displayForm.title})</span>
        </div>
    );
};

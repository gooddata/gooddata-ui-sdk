// (C) 2020-2022 GoodData Corporation
import React from "react";
import cx from "classnames";
import { isDrillToAttributeUrl } from "@gooddata/sdk-model";
import { DashboardDrillDefinition } from "../../../../types";
import invariant from "ts-invariant";
import { selectAllCatalogDisplayFormsMap, useDashboardSelector } from "../../../../model";

export interface IAttributeUrlSectionItemProps {
    item: DashboardDrillDefinition;
    isSelected: boolean;
    onClickHandler?: (e: React.SyntheticEvent) => void;
}

export const AttributeUrlSectionItem: React.FC<IAttributeUrlSectionItemProps> = ({
    item,
    onClickHandler,
    isSelected,
}) => {
    const className = cx(
        "gd-list-item gd-menu-item gd-drill-to-attribute-url-option s-drill-to-attribute-url-option icon-hyperlink-warning",
        {
            "is-selected": isSelected,
        },
    );

    invariant(isDrillToAttributeUrl(item), "must match");

    const x = useDashboardSelector(selectAllCatalogDisplayFormsMap);
    const displayForm = x.get(item.target.displayForm);
    const hyperlinkDisplayForm = x.get(item.target.hyperlinkDisplayForm);

    return (
        <div className={className} onClick={onClickHandler}>
            <span className="gd-parameter-title">{displayForm?.title}</span>
            <span className="addon">({hyperlinkDisplayForm?.title})</span>
        </div>
    );
};

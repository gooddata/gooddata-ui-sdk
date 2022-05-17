// (C) 2022 GoodData Corporation
import React, { useCallback } from "react";

import { areObjRefsEqual, ObjRef } from "@gooddata/sdk-model";
import { IConfigurationParentItem, ParentFiltersListItem } from "./ParentFiltersListItem";
import { LoadingComponent } from "@gooddata/sdk-ui";

const LOADING_MASK_HEIGHT = 150;

interface IConfigurationParentItemsProps {
    isDependentFiltersEnabled: boolean;
    attributeFilterTitle: string;
    items: IConfigurationParentItem[];
    setItems: (items: IConfigurationParentItem[]) => void;
    numberOfAttributeFilters: number;
}

export const ParentFiltersList: React.FC<IConfigurationParentItemsProps> = (props) => {
    const { items, attributeFilterTitle, setItems, isDependentFiltersEnabled, numberOfAttributeFilters } =
        props;

    const onItemClick = (ref: ObjRef) => {
        const updatedItems = items.map((item) => {
            return areObjRefsEqual(item.ref, ref) ? { ...item, isSelected: !item.isSelected } : item;
        });
        setItems(updatedItems);
    };

    const onConnectingAttributeSelect = useCallback(
        (ref: ObjRef, selectedConnectingAttributeRef: ObjRef) => {
            const updatedItems = items.map((item) =>
                areObjRefsEqual(item.ref, ref) ? { ...item, selectedConnectingAttributeRef } : item,
            );
            setItems(updatedItems);
        },
        [items, setItems],
    );

    if (!isDependentFiltersEnabled || numberOfAttributeFilters <= 1) {
        return null;
    }

    if (!items.length) {
        return (
            <LoadingComponent
                height={LOADING_MASK_HEIGHT}
                className="s-attribute-filter-dropdown-configuration-loading"
            />
        );
    }

    return (
        <div className="gd-infinite-list">
            {items.map((item) => {
                <ParentFiltersListItem
                    item={item}
                    attributeFilterTitle={attributeFilterTitle}
                    onClick={onItemClick}
                    onConnectingAttributeSelect={onConnectingAttributeSelect}
                />;
            })}
        </div>
    );
};

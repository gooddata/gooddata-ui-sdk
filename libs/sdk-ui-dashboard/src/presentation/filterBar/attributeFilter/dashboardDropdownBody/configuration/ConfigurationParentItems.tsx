// (C) 2021 GoodData Corporation
import React, { useCallback } from "react";
import { LoadingMask, Typography } from "@gooddata/sdk-ui-kit";
import { FormattedMessage } from "react-intl";
import { areObjRefsEqual, ObjRef, objRefToString } from "@gooddata/sdk-model";
import { ConfigurationParentItem, IConfigurationParentItem } from "./ConfigurationParentItem";

const LOADING_MASK_HEIGHT = 150;

interface IConfigurationParentItemsProps {
    isDependentFiltersEnabled: boolean;
    attributeFilterTitle: string;
    items: IConfigurationParentItem[];
    setItems: (items: IConfigurationParentItem[]) => void;
    numberOfAttributeFilters: number;
}

export const ConfigurationParentItems: React.FC<IConfigurationParentItemsProps> = (props) => {
    const { items, attributeFilterTitle, setItems, isDependentFiltersEnabled, numberOfAttributeFilters } =
        props;

    const itemClickHandler = useCallback(
        (ref: ObjRef) => {
            const updatedItems = items.map((item) =>
                areObjRefsEqual(item.ref, ref) ? { ...item, isSelected: !item.isSelected } : item,
            );
            setItems(updatedItems);
        },
        [items, setItems],
    );

    const connectingAttributeSelectHandler = useCallback(
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

    return (
        <>
            <div className="configuration-category">
                <Typography tagName="h3">
                    <FormattedMessage id="attributesDropdown.filterBy" />
                </Typography>
            </div>
            {items.length ? (
                <div className="gd-infinite-list">
                    {items.map((item) => (
                        <ConfigurationParentItem
                            attributeFilterTitle={attributeFilterTitle}
                            key={objRefToString(item.ref)}
                            item={item}
                            onClick={itemClickHandler}
                            onConnectingAttributeSelect={connectingAttributeSelectHandler}
                        />
                    ))}
                </div>
            ) : (
                <LoadingMask
                    className="s-attribute-filter-dropdown-configuration-loading"
                    height={LOADING_MASK_HEIGHT}
                />
            )}
        </>
    );
};

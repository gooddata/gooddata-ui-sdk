// (C) 2022 GoodData Corporation
import React from "react";

import { ObjRef } from "@gooddata/sdk-model";
import { ParentFiltersListItem } from "./ParentFiltersListItem";
import { LoadingComponent } from "@gooddata/sdk-ui";
import {
    useDashboardSelector,
    selectSupportsElementsQueryParentFiltering,
    IDashboardAttributeFilterParentItem,
    IConnectingAttribute,
} from "../../../../../../model";

const LOADING_MASK_HEIGHT = 150;

interface IConfigurationParentItemsProps {
    currentFilterLocalId: string;
    parents: IDashboardAttributeFilterParentItem[];
    setParents: (localId: string, isSelected: boolean, overAttributes: ObjRef[]) => void;
    onConnectingAttributeChanged: (localId: string, selectedAttribute: ObjRef) => void;
    connectingAttributes: IConnectingAttribute[][];
}

export const ParentFiltersList: React.FC<IConfigurationParentItemsProps> = (props) => {
    const { parents, currentFilterLocalId, setParents, onConnectingAttributeChanged, connectingAttributes } =
        props;

    const isDependentFiltersEnabled = useDashboardSelector(selectSupportsElementsQueryParentFiltering);

    if (!isDependentFiltersEnabled || parents.length < 1) {
        return null;
    }

    if (!parents.length) {
        return (
            <LoadingComponent
                height={LOADING_MASK_HEIGHT}
                className="s-attribute-filter-dropdown-configuration-loading"
            />
        );
    }

    return (
        <div className="gd-infinite-list">
            {parents.map((item, index) => {
                return (
                    <ParentFiltersListItem
                        key={item.localIdentifier}
                        currentFilterLocalId={currentFilterLocalId}
                        item={item}
                        onClick={setParents}
                        onConnectingAttributeSelect={onConnectingAttributeChanged}
                        connectingAttributes={connectingAttributes[index]}
                    />
                );
            })}
        </div>
    );
};

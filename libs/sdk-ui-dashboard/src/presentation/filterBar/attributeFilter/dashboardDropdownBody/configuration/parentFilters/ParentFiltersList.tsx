// (C) 2022-2023 GoodData Corporation
import React from "react";

import { IAttributeMetadataObject, ObjRef } from "@gooddata/sdk-model";
import { ParentFiltersListItem } from "./ParentFiltersListItem";
import {
    useDashboardSelector,
    selectSupportsElementsQueryParentFiltering,
    IDashboardAttributeFilterParentItem,
    IConnectingAttribute,
    selectSettings,
} from "../../../../../../model";

interface IConfigurationParentItemsProps {
    currentFilterLocalId: string;
    parents: IDashboardAttributeFilterParentItem[];
    setParents: (localId: string, isSelected: boolean, overAttributes: ObjRef[]) => void;
    onConnectingAttributeChanged: (localId: string, selectedAttribute: ObjRef) => void;
    connectingAttributes: IConnectingAttribute[][];
    attributes: IAttributeMetadataObject[];
    disabled: boolean;
}

export const ParentFiltersList: React.FC<IConfigurationParentItemsProps> = (props) => {
    const {
        parents,
        currentFilterLocalId,
        setParents,
        onConnectingAttributeChanged,
        connectingAttributes,
        attributes,
        disabled,
    } = props;

    const { enableKPIAttributeFilterRenaming } = useDashboardSelector(selectSettings);
    const isDependentFiltersEnabled = useDashboardSelector(selectSupportsElementsQueryParentFiltering);

    if (!isDependentFiltersEnabled || parents.length < 1) {
        return null;
    }

    return (
        <div className="gd-infinite-list">
            {parents.map((item, index) => {
                return (
                    <ParentFiltersListItem
                        key={item.localIdentifier}
                        currentFilterLocalId={currentFilterLocalId}
                        item={item}
                        disabled={disabled}
                        onClick={setParents}
                        onConnectingAttributeSelect={onConnectingAttributeChanged}
                        connectingAttributes={connectingAttributes[index]}
                        title={
                            enableKPIAttributeFilterRenaming
                                ? item.title ?? attributes[index].title
                                : attributes[index].title
                        }
                    />
                );
            })}
        </div>
    );
};

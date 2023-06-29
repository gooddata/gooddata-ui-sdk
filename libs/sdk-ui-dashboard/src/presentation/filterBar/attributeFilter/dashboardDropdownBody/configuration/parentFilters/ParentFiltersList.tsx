// (C) 2022-2023 GoodData Corporation
import React from "react";

import { IAttributeMetadataObject, ObjRef } from "@gooddata/sdk-model";
import { ParentFiltersListItem } from "./ParentFiltersListItem.js";
import {
    useDashboardSelector,
    selectSupportsElementsQueryParentFiltering,
    IDashboardAttributeFilterParentItem,
    IConnectingAttribute,
} from "../../../../../../model/index.js";
import { Bubble, BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";

const ARROW_OFFSETS = { "cr cl": [20, 0], "cl cr": [-10, 0] };
const ALIGN_POINTS = [{ align: "cr cl" }, { align: "cl cr" }];

interface IConfigurationParentItemsProps {
    currentFilterLocalId: string;
    parents: IDashboardAttributeFilterParentItem[];
    setParents: (localId: string, isSelected: boolean, overAttributes: ObjRef[]) => void;
    onConnectingAttributeChanged: (localId: string, selectedAttribute: ObjRef) => void;
    connectingAttributes: IConnectingAttribute[][];
    attributes: IAttributeMetadataObject[];
    disabled: boolean;
    disabledTooltip: string;
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
        disabledTooltip,
    } = props;

    const isDependentFiltersEnabled = useDashboardSelector(selectSupportsElementsQueryParentFiltering);

    if (!isDependentFiltersEnabled || parents.length < 1) {
        return null;
    }

    return (
        <BubbleHoverTrigger showDelay={0} hideDelay={0}>
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
                            title={item.title ?? attributes[index].title}
                        />
                    );
                })}
            </div>
            {Boolean(disabled) && (
                <Bubble arrowOffsets={ARROW_OFFSETS} alignPoints={ALIGN_POINTS}>
                    <div>{disabledTooltip}</div>
                </Bubble>
            )}
        </BubbleHoverTrigger>
    );
};

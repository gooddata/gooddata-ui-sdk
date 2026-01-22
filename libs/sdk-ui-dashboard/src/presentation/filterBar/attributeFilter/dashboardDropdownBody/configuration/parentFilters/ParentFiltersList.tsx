// (C) 2022-2026 GoodData Corporation

import { type IAttributeMetadataObject, type ObjRef, areObjRefsEqual } from "@gooddata/sdk-model";
import { Bubble, BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";

import { ParentFiltersListItem } from "./ParentFiltersListItem.js";
import { ParentFiltersListItemWithoutConnectingAttributes } from "./ParentFiltersListItemWithoutConnectingAttributes.js";
import { useDashboardSelector } from "../../../../../../model/react/DashboardStoreProvider.js";
import { selectSupportsSettingConnectingAttributes } from "../../../../../../model/store/backendCapabilities/backendCapabilitiesSelectors.js";
import {
    type IConnectingAttribute,
    type IDashboardAttributeFilterParentItem,
} from "../../../../../../model/types/attributeFilterTypes.js";

const ARROW_OFFSETS = { "cr cl": [20, 0], "cl cr": [-10, 0] };
const ALIGN_POINTS = [{ align: "cr cl" }, { align: "cl cr" }];

interface IConfigurationParentItemsProps {
    currentFilterLocalId: string;
    parents: IDashboardAttributeFilterParentItem[];
    setParents: (localId: string, isSelected: boolean, overAttributes?: ObjRef[]) => void;
    onConnectingAttributeChanged: (localId: string, selectedAttribute: ObjRef) => void;
    connectingAttributes: IConnectingAttribute[][];
    attributes: IAttributeMetadataObject[];
    disabled: boolean;
    disabledTooltip: string;
    /**
     * List of valid parents according to the data model.
     */
    validParents: ObjRef[];
}

export function ParentFiltersList({
    parents,
    currentFilterLocalId,
    setParents,
    onConnectingAttributeChanged,
    connectingAttributes,
    attributes,
    disabled,
    disabledTooltip,
    validParents,
}: IConfigurationParentItemsProps) {
    const supportsSettingConnectingAttributes = useDashboardSelector(
        selectSupportsSettingConnectingAttributes,
    );

    if (parents.length < 1) {
        return null;
    }

    return (
        <BubbleHoverTrigger showDelay={0} hideDelay={0}>
            <div className="gd-infinite-list">
                {parents.map((item, index) => {
                    if (supportsSettingConnectingAttributes) {
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
                    } else {
                        /**
                         * When connecting attributes are not used, we want to validate parent against the list of valid parents.
                         */
                        const isParentValid = validParents.some((validParent) =>
                            areObjRefsEqual(validParent, item.displayForm),
                        );

                        return (
                            <ParentFiltersListItemWithoutConnectingAttributes
                                key={item.localIdentifier}
                                currentFilterLocalId={currentFilterLocalId}
                                item={item}
                                disabled={disabled}
                                onClick={setParents}
                                title={item.title ?? attributes[index].title}
                                isValid={isParentValid}
                            />
                        );
                    }
                })}
            </div>
            {Boolean(disabled) && (
                <Bubble arrowOffsets={ARROW_OFFSETS} alignPoints={ALIGN_POINTS}>
                    <div>{disabledTooltip}</div>
                </Bubble>
            )}
        </BubbleHoverTrigger>
    );
}

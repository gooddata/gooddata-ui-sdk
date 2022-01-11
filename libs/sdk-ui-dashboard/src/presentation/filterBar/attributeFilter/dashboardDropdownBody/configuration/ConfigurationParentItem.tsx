// (C) 2021-2022 GoodData Corporation
import React from "react";
import { ObjRef } from "@gooddata/sdk-model";
import { FormattedMessage } from "react-intl";
import { DisabledConfigurationParentItem } from "./DisabledConfigurationParentItem";
import cx from "classnames";
import { ConnectingAttributesDropdown } from "../connectingAttributesDropdown/ConnectingAttributesDropdown";
import { getTestClassname } from "../../../../../_staging/testUtils/getTestClassname";

export interface IConnectingAttribute {
    ref: ObjRef;
    title: string;
    icon: string;
}

export interface IConfigurationParentItem {
    title: string;
    ref: ObjRef;
    isSelected: boolean;
    isCircularDependency: boolean;
    connectingAttributes: IConnectingAttribute[];
    selectedConnectingAttributeRef: ObjRef;
}

interface IConfigurationParentItemProps {
    attributeFilterTitle: string;
    item: IConfigurationParentItem;
    onClick: (ref: ObjRef) => void;
    onConnectingAttributeSelect: (ref: ObjRef, targetRef: ObjRef) => void;
}

export const ConfigurationParentItem: React.FC<IConfigurationParentItemProps> = ({
    attributeFilterTitle,
    item,
    onClick,
    onConnectingAttributeSelect,
}) => {
    const {
        ref,
        title,
        isSelected,
        connectingAttributes,
        selectedConnectingAttributeRef,
        isCircularDependency,
    } = item;

    const showConnectingAttributeSelect = isSelected && connectingAttributes.length > 1;
    const isDisabled = isCircularDependency || !connectingAttributes.length;

    const itemClassName = cx(
        "gd-list-item attribute-filter-item s-attribute-filter-dropdown-configuration-item",
        getTestClassname(title),
        {
            "is-selected": isSelected,
        },
    );

    return (
        <>
            {isDisabled ? (
                <DisabledConfigurationParentItem
                    attributeFilterTitle={attributeFilterTitle}
                    itemTitle={title}
                    hasConnectingAttributes={!!connectingAttributes.length}
                />
            ) : (
                <div className={itemClassName} onClick={() => onClick(ref)} title={title}>
                    <label className="input-checkbox-label configuration-item-title">
                        <input
                            type="checkbox"
                            className="input-checkbox s-checkbox"
                            readOnly={true}
                            disabled={false}
                            checked={isSelected}
                        />
                        <span className="input-label-text">{title}</span>
                        {showConnectingAttributeSelect && (
                            <span className="addon">
                                &nbsp;
                                <FormattedMessage id="attributesDropdown.attributeNameWithData" />
                            </span>
                        )}
                    </label>
                </div>
            )}
            {showConnectingAttributeSelect && (
                <ConnectingAttributesDropdown
                    objRef={ref}
                    selectedConnectingAttributeRef={selectedConnectingAttributeRef}
                    connectingAttributes={connectingAttributes}
                    onSelect={onConnectingAttributeSelect}
                />
            )}
        </>
    );
};

// (C) 2022 GoodData Corporation
import React from "react";
import cx from "classnames";

import { ObjRef } from "@gooddata/sdk-model";
import { ParentFiltersDisabledItem } from "./ParentFiltersDisabledItem";
import { stringUtils } from "@gooddata/util";
import { FormattedMessage } from "react-intl";

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

export interface IConfigurationParentItemProps {
    attributeFilterTitle: string;
    item: IConfigurationParentItem;
    onClick: (ref: ObjRef) => void;
    onConnectingAttributeSelect: (ref: ObjRef, targetRef: ObjRef) => void;
}

export const ParentFiltersListItem: React.FC<IConfigurationParentItemProps> = (props) => {
    const {
        item: { isCircularDependency, connectingAttributes, title, isSelected, ref },
        attributeFilterTitle,
        onClick,
    } = props;

    const showConnectingAttributeSelect = isSelected && connectingAttributes.length > 1;
    const isDisabled = isCircularDependency || !connectingAttributes.length;

    if (isDisabled) {
        return (
            <ParentFiltersDisabledItem
                hasConnectingAttributes={!!connectingAttributes.length}
                attributeFilterTitle={attributeFilterTitle}
                itemTitle={title}
            />
        );
    }

    const activeItemClasses = cx(
        "gd-list-item attribute-filter-item s-attribute-filter-dropdown-configuration-item",
        `s-${stringUtils.simplifyText(title)}`,
        {
            "is-selected": isSelected,
        },
    );

    return (
        <div className={activeItemClasses} onClick={() => onClick(ref)} title={title}>
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
    );
};

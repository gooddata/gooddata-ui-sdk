// (C) 2022-2023 GoodData Corporation
import React, { useCallback, useMemo } from "react";
import cx from "classnames";
import { FormattedMessage } from "react-intl";

import { ObjRef } from "@gooddata/sdk-model";
import { ParentFiltersDisabledItem } from "./ParentFiltersDisabledItem.js";
import { stringUtils } from "@gooddata/util";
import {
    useDashboardSelector,
    IDashboardAttributeFilterParentItem,
    selectIsCircularDependency,
    IConnectingAttribute,
} from "../../../../../../model/index.js";
import { ConnectingAttributeDropdown } from "../connectingAttribute/ConnectingAttributeDropdown.js";

export interface IConfigurationParentItem {
    localId: string;
    displayForm: ObjRef;
    isSelected: boolean;
}

export interface IConfigurationParentItemProps {
    currentFilterLocalId: string;
    item: IDashboardAttributeFilterParentItem;
    onClick: (localId: string, isSelected: boolean, overAttributes: ObjRef[]) => void;
    onConnectingAttributeSelect: (localIdentifier: string, targetRef: ObjRef) => void;
    connectingAttributes: IConnectingAttribute[];
    title: string;
    disabled: boolean;
}

export const ParentFiltersListItem: React.FC<IConfigurationParentItemProps> = (props) => {
    const {
        item: { isSelected, localIdentifier, selectedConnectingAttribute },
        onClick,
        currentFilterLocalId,
        connectingAttributes,
        onConnectingAttributeSelect,
        title,
        disabled,
    } = props;

    const isCircularDependency = useDashboardSelector(
        selectIsCircularDependency(currentFilterLocalId, localIdentifier),
    );

    const isDisabled = isCircularDependency || !connectingAttributes.length;
    const showConnectingAttributeSelect = isSelected && connectingAttributes.length > 1;

    const activeItemClasses = useMemo(() => {
        return cx(
            "gd-list-item attribute-filter-item s-attribute-filter-dropdown-configuration-item",
            `s-${stringUtils.simplifyText(title)}`,
            {
                "is-selected": isSelected,
            },
        );
    }, [isSelected, title]);

    const onSelect = useCallback(() => {
        const connectingAttributeRefs = connectingAttributes.map((attr) => attr.ref);
        onClick(localIdentifier, !isSelected, connectingAttributeRefs);
    }, [isSelected, localIdentifier, onClick, connectingAttributes]);

    if (isDisabled) {
        return (
            <ParentFiltersDisabledItem
                hasConnectingAttributes={!!connectingAttributes.length}
                itemTitle={title}
                itemLocalId={currentFilterLocalId}
            />
        );
    }

    return (
        <React.Fragment>
            <div className={activeItemClasses} onClick={() => !disabled && onSelect()} title={title}>
                <label className="input-checkbox-label configuration-item-title">
                    <input
                        type="checkbox"
                        className="input-checkbox s-checkbox"
                        checked={isSelected}
                        disabled={disabled}
                        readOnly
                    />
                    <span className="input-label-text">{title}</span>
                    {showConnectingAttributeSelect ? (
                        <span className="addon">
                            &nbsp;
                            <FormattedMessage id="attributesDropdown.attributeNameWithData" />
                        </span>
                    ) : null}
                </label>
            </div>
            {showConnectingAttributeSelect ? (
                <ConnectingAttributeDropdown
                    itemLocalId={localIdentifier}
                    connectingAttributes={connectingAttributes!}
                    selectedConnectingAttributeRef={
                        selectedConnectingAttribute || connectingAttributes[0].ref
                    }
                    onSelect={onConnectingAttributeSelect}
                />
            ) : null}
        </React.Fragment>
    );
};

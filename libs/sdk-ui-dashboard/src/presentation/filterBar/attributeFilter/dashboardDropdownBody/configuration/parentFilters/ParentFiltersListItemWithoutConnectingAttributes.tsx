// (C) 2022-2025 GoodData Corporation

import { useCallback, useMemo } from "react";

import cx from "classnames";

import { type ObjRef } from "@gooddata/sdk-model";
import { stringUtils } from "@gooddata/util";

import { ParentFiltersDisabledItem } from "./ParentFiltersDisabledItem.js";
import { type IDashboardAttributeFilterParentItem } from "../../../../../../model/index.js";

interface IConfigurationParentItemProps {
    currentFilterLocalId: string;
    item: IDashboardAttributeFilterParentItem;
    onClick: (localId: string, isSelected: boolean, overAttributes?: ObjRef[]) => void;
    title: string;
    disabled: boolean;
    isValid: boolean;
}

export function ParentFiltersListItemWithoutConnectingAttributes({
    item: { isSelected, localIdentifier },
    onClick,
    currentFilterLocalId,
    title,
    disabled,
    isValid,
}: IConfigurationParentItemProps) {
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
        onClick(localIdentifier, !isSelected);
    }, [onClick, localIdentifier, isSelected]);

    if (!isValid) {
        return (
            <ParentFiltersDisabledItem
                hasConnectingAttributes={false}
                itemTitle={title}
                itemLocalId={currentFilterLocalId}
            />
        );
    }

    return (
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
            </label>
        </div>
    );
}

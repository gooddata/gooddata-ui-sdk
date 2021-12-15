// (C) 2019-2021 GoodData Corporation
import React from "react";

import { AttributeDropdownList } from "./AttributeDropdownList";
import { AttributeDropdownButtons } from "./AttributeDropdownButtons";
import { AttributeDropdownItemsFilteredBody } from "./AttributeDropdownItemsFilteredBody";
import { AttributeListItem } from "./types";
import { IAttributeElement } from "@gooddata/sdk-backend-spi";
import { ObjRef } from "@gooddata/sdk-model";
import { WrappedComponentProps } from "react-intl";

/**
 * @public
 */
export interface IAttributeDropdownListItemProps extends WrappedComponentProps {
    isLoading?: boolean;
    onMouseOut?: (source: any) => void;
    onMouseOver?: (source: any) => void;
    onOnly?: (source: any) => void;
    onSelect?: (source: any) => void;
    selected?: boolean;
    source?: any;
}

/**
 * @public
 */
export interface IAttributeDropdownBodyProps {
    items: AttributeListItem[];
    totalCount: number;
    selectedItems: Array<IAttributeElement>;
    isInverted: boolean;
    isLoading: boolean;
    isFullWidth?: boolean;
    error?: any;
    applyDisabled?: boolean;

    searchString: string;
    onSearch: (searchString: string) => void;

    onSelect: (selectedItems: IAttributeElement[], isInverted: boolean) => void;
    onRangeChange: (searchString: string, from: number, to: number) => void;
    onApplyButtonClicked: () => void;
    onCloseButtonClicked: () => void;
    parentFilterTitles?: string[];
    showItemsFilteredMessage?: boolean;
}

/**
 * @public
 */
export interface IAttributeDropdownBodyExtendedProps extends IAttributeDropdownBodyProps {
    deleteFilter?: () => void;
    isLoaded?: boolean;
    isElementsLoading?: boolean;
    width?: number;
    listItemClass?: React.ComponentType<IAttributeDropdownListItemProps>;
    maxSelectionSize?: number;
    showConfigurationButton?: boolean;
    onConfigurationChange?: () => void;
    showDeleteButton?: boolean;
    isMobile?: boolean;
    attributeFilterRef?: ObjRef;
}

export const AttributeDropdownBody: React.FC<IAttributeDropdownBodyExtendedProps> = ({
    items,
    totalCount,
    error,
    isLoading,
    selectedItems,
    isInverted,
    applyDisabled,
    onRangeChange,
    onSearch,
    searchString,
    onSelect,
    onApplyButtonClicked,
    onCloseButtonClicked,
    parentFilterTitles,
    showItemsFilteredMessage,
    isMobile,
}) => {
    return (
        <div className="gd-attribute-filter-overlay">
            <AttributeDropdownList
                error={error}
                isLoading={isLoading}
                items={items}
                isInverted={isInverted}
                onRangeChange={onRangeChange}
                selectedItems={selectedItems}
                totalCount={totalCount}
                onSearch={onSearch}
                searchString={searchString}
                onSelect={onSelect}
                isMobile={isMobile}
            />
            <AttributeDropdownItemsFilteredBody
                parentFilterTitles={parentFilterTitles}
                showItemsFilteredMessage={showItemsFilteredMessage}
            />
            <AttributeDropdownButtons
                applyDisabled={applyDisabled}
                onApplyButtonClicked={onApplyButtonClicked}
                onCloseButtonClicked={onCloseButtonClicked}
            />
        </div>
    );
};

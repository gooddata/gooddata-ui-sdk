// (C) 2019-2022 GoodData Corporation
import React from "react";

import { AttributeDropdownList } from "./AttributeDropdownList";
import { AttributeDropdownButtons } from "./AttributeDropdownButtons";
import { AttributeDropdownItemsFiltered } from "./AttributeDropdownItemsFiltered";
import { AttributeListItem, IListItem } from "../types";
import { ObjRef } from "@gooddata/sdk-model";
import { FormattedMessage, WrappedComponentProps } from "react-intl";

const ListError = () => (
    <div className="gd-message error">
        <FormattedMessage id="gs.list.error" />
    </div>
);

/**
 * @internal
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
 * @internal
 */
export interface IAttributeDropdownBodyProps {
    items: AttributeListItem[];
    totalCount: number;
    selectedItems: Array<IListItem>;
    isInverted: boolean;
    isLoading: boolean;
    isFullWidth?: boolean;
    error?: any;
    applyDisabled?: boolean;

    searchString: string;
    onSearch: (searchString: string) => void;

    onSelect: (selectedItems: IListItem[], isInverted: boolean) => void;
    onRangeChange: (searchString: string, from: number, to: number) => void;
    onApplyButtonClicked: () => void;
    onCloseButtonClicked: () => void;
    parentFilterTitles?: string[];
    showItemsFilteredMessage?: boolean;
}

/**
 * @internal
 */
export interface IAttributeDropdownBodyExtendedProps extends IAttributeDropdownBodyProps {
    deleteFilter?: () => void; //TOTO this callback is not needed should be part of customization of dropdown buttons
    isLoaded?: boolean;
    isElementsLoading?: boolean;
    width?: number;
    listItemClass?: React.ComponentType<IAttributeDropdownListItemProps>;
    maxSelectionSize?: number;
    showConfigurationButton?: boolean;
    onConfigurationChange?: () => void; //TODO separate this should be done by customization Dropdown body
    showDeleteButton?: boolean; //TODO separate this should be done by customization dropdown buttons
    attributeFilterRef?: ObjRef; //TODO not sure why this is needed
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
}) => {
    return (
        <div className="gd-attribute-filter-overlay__next">
            {error ? (
                <ListError />
            ) : (
                <AttributeDropdownList
                    isLoading={isLoading}
                    items={items}
                    isInverted={isInverted}
                    onRangeChange={onRangeChange}
                    selectedItems={selectedItems}
                    totalCount={totalCount}
                    onSearch={onSearch}
                    searchString={searchString}
                    onSelect={onSelect}
                />
            )}

            <AttributeDropdownItemsFiltered
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

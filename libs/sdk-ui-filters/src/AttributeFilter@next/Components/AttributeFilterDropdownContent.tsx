// (C) 2019-2022 GoodData Corporation
import React from "react";

import { AttributeDropdownList } from "./AttributeDropdownList";
import { NoData } from "@gooddata/sdk-ui-kit";
import { MessageItemsFiltered } from "./MessageItemsFiltered";
import { AttributeListItem, IListItem } from "../types";
import { ObjRef } from "@gooddata/sdk-model";
import { FormattedMessage, useIntl, WrappedComponentProps } from "react-intl";
import { MessageAllItemsFiltered } from "./MessageAllItemsFiltered";

const ListError = () => (
    <div className="gd-message error">
        <FormattedMessage id="gs.list.error" />
    </div>
);

//TODO this interface will be removed its part of old customization and will be handled in different way
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
export interface IAttributeFilterDropdownContentProps {
    items: AttributeListItem[];
    totalCount: number;
    selectedItems: Array<IListItem>;
    isInverted: boolean;
    isLoading: boolean;
    isFullWidth?: boolean;

    error?: any;
    hasNoMatchingData: boolean; //new added
    hasNoData: boolean; //new added

    searchString: string;
    onSearch: (searchString: string) => void;

    onSelect: (selectedItems: IListItem[], isInverted: boolean) => void;
    onRangeChange: (searchString: string, from: number, to: number) => void;
    parentFilterTitles?: string[];
    showItemsFilteredMessage?: boolean;
}

//TODO this is temporary type
export type IAttributeDropdownBodyPropsNoCallbacks = Omit<
    IAttributeFilterDropdownContentProps,
    "onApplyButtonClicked" | "onCloseButtonClicked"
>;

//TODO this interface will be removed its part of old customization and will be handled in different way
/**
 * @internal
 */
export interface IAttributeDropdownBodyExtendedProps extends IAttributeFilterDropdownContentProps {
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

export const AttributeFilterDropdownContent: React.FC<IAttributeFilterDropdownContentProps> = (props) => {
    const {
        items,
        totalCount,
        error,
        isLoading,
        selectedItems,
        isInverted,
        onRangeChange,
        onSearch,
        searchString,
        onSelect,
        parentFilterTitles,
        showItemsFilteredMessage,

        hasNoMatchingData,
        hasNoData,
    } = props;

    const intl = useIntl();

    return (
        <>
            {error ? (
                <ListError />
            ) : hasNoMatchingData ? (
                <MessageAllItemsFiltered parentFilterTitles={parentFilterTitles} />
            ) : hasNoData ? (
                <NoData noDataLabel={intl.formatMessage({ id: "attributesDropdown.noData" })} />
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

            <MessageItemsFiltered
                parentFilterTitles={parentFilterTitles}
                showItemsFilteredMessage={showItemsFilteredMessage}
            />
        </>
    );
};

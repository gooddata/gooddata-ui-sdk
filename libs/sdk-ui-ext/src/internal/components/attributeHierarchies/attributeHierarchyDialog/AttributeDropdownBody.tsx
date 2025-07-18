// (C) 2023-2025 GoodData Corporation
import { useState } from "react";
import { useIntl } from "react-intl";
import { DropdownList, SingleSelectListItem, ITab } from "@gooddata/sdk-ui-kit";
import { messages } from "@gooddata/sdk-ui";

import { CatalogAttributeDataType, EmptyParamCallback, ICatalogAttributeData } from "./types.js";
import { searchAttributes } from "./utils.js";

const DEFAULT_DROPDOWN_WIDTH = 253;
const DEFAULT_DROPDOWN_MAX_HEIGHT = 270;

interface IAttributeDropdownBodyProps {
    items: ICatalogAttributeData[];
    isLoading: boolean;
    onSelect: (item: ICatalogAttributeData) => void;
    closeDropdown: EmptyParamCallback;
}

const TABS: ITab[] = [
    {
        id: CatalogAttributeDataType.ATTRIBUTE,
        iconOnly: true,
        icon: "gd-icon-attribute",
    },
    {
        id: CatalogAttributeDataType.DATE_ATTRIBUTE,
        iconOnly: true,
        icon: "gd-icon-date",
    },
];

export default function AttributeDropdownBody({
    items,
    isLoading,
    closeDropdown,
    onSelect,
}: IAttributeDropdownBodyProps) {
    const { formatMessage } = useIntl();

    const [selectedTab, setSelectedTab] = useState<string>(CatalogAttributeDataType.ATTRIBUTE);
    const [searchString, setSearchString] = useState<string>("");

    const displayItems: ICatalogAttributeData[] = searchAttributes(items, selectedTab, searchString);

    const handleTabSelect = (tab: ITab) => {
        setSelectedTab(tab.id);
    };

    const searchPlaceholderText = formatMessage(messages.hierarchyAttributeSearch);

    return (
        <DropdownList
            className="attribute-hierarchy-attribute-dropdown-body s-attribute-hierarchy-attribute-dropdown-body"
            tabsClassName="date-attribute-dropdown-tabs s-attribute-hierarchy-attribute-dropdown-tabs"
            width={DEFAULT_DROPDOWN_WIDTH}
            maxHeight={DEFAULT_DROPDOWN_MAX_HEIGHT}
            showSearch={true}
            searchPlaceholder={searchPlaceholderText}
            searchString={searchString}
            onSearch={setSearchString}
            items={displayItems}
            itemsCount={displayItems.length}
            showTabs={true}
            tabs={TABS}
            onTabSelect={handleTabSelect}
            selectedTabId={selectedTab}
            isLoading={isLoading}
            renderItem={({ item }) => {
                const handleClick = () => {
                    closeDropdown();
                    onSelect(item);
                };

                return (
                    <SingleSelectListItem
                        className="attribute-hierarchy-attribute-dropdown-item s-attribute-hierarchy-attribute-dropdown-item"
                        title={item.title}
                        onClick={handleClick}
                        icon={item.icon}
                    />
                );
            }}
        />
    );
}

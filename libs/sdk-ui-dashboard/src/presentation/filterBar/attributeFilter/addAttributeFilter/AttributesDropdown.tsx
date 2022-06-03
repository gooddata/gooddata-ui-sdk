// (C) 2007-2022 GoodData Corporation
import React, { useCallback, useState } from "react";
import cx from "classnames";
import { stringUtils } from "@gooddata/util";
import { useIntl } from "react-intl";
import { ShortenedText, Dropdown, DropdownList } from "@gooddata/sdk-ui-kit";
import { ICatalogAttribute } from "@gooddata/sdk-model";
import debounce from "lodash/debounce";

import { AddAttributeFilterButton } from "./AddAttributeFilterButton";
import { useDashboardSelector } from "../../../../model/react/DashboardStoreProvider";
import { selectCatalogAttributes } from "../../../../model/store/catalog/catalogSelectors";

interface IAttributeListItemProps {
    item?: ICatalogAttribute;
    isMobile?: boolean;
    onClick?: () => void;
}

const tooltipAlignPoints = [
    { align: "cr cl", offset: { x: 10, y: 0 } },
    { align: "cl cr", offset: { x: -10, y: 0 } },
];

const dropdownAlignPoints = [
    {
        align: "bl tl",
    },
    {
        align: "tr tl",
    },
    {
        align: "tr tl",
        offset: {
            x: 0,
            y: -100,
        },
    },
    {
        align: "tr tl",
        offset: {
            x: 0,
            y: -50,
        },
    },
    {
        align: "br tr",
        offset: {
            x: -10,
            y: 0,
        },
    },
    {
        align: "tl tr",
        offset: {
            x: 0,
            y: -100,
        },
    },
    {
        align: "tl tr",
        offset: {
            x: 0,
            y: -50,
        },
    },
];

function AttributeListItem({ item, isMobile, onClick }: IAttributeListItemProps) {
    if (!item) {
        return null;
    }

    const metricItemClassNames = cx(`s-${stringUtils.simplifyText(item.attribute.title)}`, {
        "gd-list-item": true,
        "gd-list-item-shortened": true,
    });

    const title = isMobile ? (
        item.attribute.title
    ) : (
        <ShortenedText tooltipAlignPoints={tooltipAlignPoints}>{item.attribute.title}</ShortenedText>
    );

    return (
        <div key={item.attribute.id} className={metricItemClassNames} onClick={onClick}>
            {title}
        </div>
    );
}

/**
 * @internal
 */
export interface IAttributesDropdownProps {
    className?: string;
    bodyClassName?: string;
    onSelect: (item: ICatalogAttribute) => void;
    onClose: () => void;
}

/**
 * @internal
 */
export function AttributesDropdown({
    className,
    bodyClassName,
    onClose,
    onSelect,
}: IAttributesDropdownProps) {
    const intl = useIntl();
    const [searchQuery, setSearchQuery] = useState("");

    const attributes = useDashboardSelector(selectCatalogAttributes);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const onSearch = useCallback(
        debounce((query: string) => {
            setSearchQuery(query);
        }, 250),
        [],
    );

    const onDropdownStateChange = useCallback(
        (isOpen: boolean) => {
            if (!isOpen) {
                onClose();
            }
        },
        [onClose],
    );

    const dropdownClassName = cx(className, "s-attribute_select", "attribute-filter-dropdown");

    const filteredMeasures = searchQuery
        ? attributes.filter((a) => a.attribute.title.toLowerCase().includes(searchQuery.toLowerCase()))
        : attributes;

    return (
        <Dropdown
            className={dropdownClassName}
            onOpenStateChanged={onDropdownStateChange}
            closeOnParentScroll
            closeOnMouseDrag
            closeOnOutsideClick
            alignPoints={dropdownAlignPoints}
            openOnInit={true}
            renderButton={({ isOpen }) => (
                <AddAttributeFilterButton
                    className="attribute-filter-button mobile-dropdown-button"
                    isOpen={isOpen}
                />
            )}
            renderBody={({ closeDropdown }) => (
                <div className={cx(bodyClassName, "metrics-dropdown")}>
                    <DropdownList
                        items={filteredMeasures}
                        searchFieldSize="small"
                        showSearch
                        onSearch={onSearch}
                        searchString={searchQuery}
                        searchPlaceholder={intl.formatMessage({
                            id: "attributesDropdown.placeholder",
                        })}
                        renderItem={({ item }) => {
                            return (
                                <AttributeListItem
                                    item={item}
                                    onClick={() => {
                                        onSelect(item);
                                        closeDropdown();
                                    }}
                                />
                            );
                        }}
                    />
                </div>
            )}
        />
    );
}

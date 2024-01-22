// (C) 2024 GoodData Corporation

import React, { useState, useEffect } from "react";
import { useIntl, FormattedMessage } from "react-intl";
import { ObjRef, serializeObjRef } from "@gooddata/sdk-model";
import { DropdownList, Button, Typography, NoData, IAlignPoint } from "@gooddata/sdk-ui-kit";

import { messages } from "../../../../../../locales.js";
import { ConfigurationBubble } from "../../../../../widget/common/configuration/ConfigurationBubble.js";

import { useSearchableLimitingItems, IValidationItemWithTitle } from "./limitingItemsHook.js";
import { LimitingItemTitle } from "./LimitingItem.js";

const ALIGN_POINTS: IAlignPoint[] = [
    {
        align: "tr tl",
        offset: { x: 3, y: -63 },
    },
    {
        align: "tl tr",
        offset: { x: -3, y: -63 },
    },
];

export interface IAddLimitingItemProps {
    currentlySelectedItems: ObjRef[];
    onSelect: (item: ObjRef) => void;
    onClose: () => void;
}

export const AddLimitingItem: React.FC<IAddLimitingItemProps> = ({
    currentlySelectedItems,
    onSelect,
    onClose,
}) => {
    const intl = useIntl();

    const [matchingItems, setMatchingItems] = useState<IValidationItemWithTitle[]>([]);
    const items = useSearchableLimitingItems(currentlySelectedItems);

    useEffect(() => {
        setMatchingItems(items);
    }, [items]);

    const onItemSearch = (keyword: string) =>
        setMatchingItems(items.filter(({ title }) => title.toLowerCase().includes(keyword.toLowerCase())));

    return (
        <ConfigurationBubble
            alignTo=".attribute-filter__limit__add-button"
            alignPoints={ALIGN_POINTS}
            onClose={onClose}
        >
            <div className="">
                <div className="configuration-panel-header">
                    <Typography tagName="h3" className="configuration-panel-header-title">
                        <FormattedMessage id="attributesDropdown.valuesLimiting.popupTitle" />
                    </Typography>
                    <Button
                        className="gd-button-link gd-button-icon-only gd-icon-cross configuration-panel-header-close-button s-configuration-panel-header-close-button"
                        onClick={onClose}
                    />
                </div>
                <DropdownList
                    width={250}
                    isMobile={false}
                    showSearch={true}
                    onSearch={onItemSearch}
                    searchPlaceholder={intl.formatMessage(
                        messages.filterAddValuesLimitPopupSearchPlaceholder,
                    )}
                    searchFieldSize="small"
                    renderNoData={({ hasNoMatchingData }) => (
                        <NoData
                            className="attribute-filter__limit__popup__no-data"
                            hasNoMatchingData={hasNoMatchingData}
                            notFoundLabel={intl.formatMessage(
                                messages.filterAddValuesLimitPopupSearchNoMatch,
                            )}
                            noDataLabel={intl.formatMessage(messages.filterAddValuesLimitPopupNoData)}
                        />
                    )}
                    items={matchingItems}
                    renderItem={({ item: { item, title } }) => {
                        return (
                            <div
                                key={serializeObjRef(item)}
                                className="gd-list-item attribute-filter__limit__popup__item"
                                onClick={() => {
                                    onSelect(item);
                                    onClose();
                                }}
                            >
                                <LimitingItemTitle item={item} title={title} />
                            </div>
                        );
                    }}
                />
            </div>
        </ConfigurationBubble>
    );
};

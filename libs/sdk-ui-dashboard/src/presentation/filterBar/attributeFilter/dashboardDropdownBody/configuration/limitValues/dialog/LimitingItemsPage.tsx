// (C) 2024-2025 GoodData Corporation

import React, { useEffect, useState } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";

import { ObjRef, serializeObjRef } from "@gooddata/sdk-model";
import { DropdownList, NoData } from "@gooddata/sdk-ui-kit";
import { stringUtils } from "@gooddata/util";

import { PopupHeader } from "./PopupHeader.js";
import { getTelemetryEventForLimitingItem } from "./telemetryUtils.js";
import { messages } from "../../../../../../../locales.js";
import { useDashboardUserInteraction } from "../../../../../../../model/index.js";
import { ValuesLimitingItem } from "../../../../types.js";
import { LimitingItemTitle } from "../shared/LimitingItem.js";
import { IValuesLimitingItemWithTitle, useSearchableLimitingItems } from "../shared/limitingItemsHook.js";

const NoLimitingItemsFound: React.FC<{ hasNoMatchingData: boolean }> = ({ hasNoMatchingData }) => {
    const intl = useIntl();
    return (
        <NoData
            className="attribute-filter__limit__popup__no-data"
            hasNoMatchingData={hasNoMatchingData}
            notFoundLabel={intl.formatMessage(messages.filterAddValuesLimitPopupSearchNoMatch)}
            noDataLabel={intl.formatMessage(messages.filterAddValuesLimitPopupNoMetrics)}
        />
    );
};

interface ILimitingItemProps {
    item: IValuesLimitingItemWithTitle;
    onSelect: (item: ValuesLimitingItem) => void;
    onClose: () => void;
}

const LimitingItem: React.FC<ILimitingItemProps> = ({ item: { item, title }, onSelect, onClose }) => {
    const { attributeFilterInteraction } = useDashboardUserInteraction();
    const classNames = cx(
        "gd-list-item attribute-filter__limit__popup__item",
        `s-metric-${stringUtils.simplifyText(title ?? "unknown")}`,
    );
    const onClick = () => {
        onSelect(item);
        onClose();
        attributeFilterInteraction(getTelemetryEventForLimitingItem(item));
    };
    return (
        <div key={serializeObjRef(item)} className={classNames} onClick={onClick} title={title}>
            <LimitingItemTitle item={item} title={title} />
        </div>
    );
};

export interface ILimitingItemsPageProps {
    currentlySelectedItems: ObjRef[];
    onSelect: (item: ValuesLimitingItem) => void;
    onGoBack: () => void;
    onClose: () => void;
}

export const LimitingItemsPage: React.FC<ILimitingItemsPageProps> = ({
    currentlySelectedItems,
    onSelect,
    onGoBack,
    onClose,
}) => {
    const intl = useIntl();

    const [matchingItems, setMatchingItems] = useState<IValuesLimitingItemWithTitle[]>([]);
    const items = useSearchableLimitingItems(currentlySelectedItems);

    useEffect(() => {
        setMatchingItems(items);
    }, [items]);

    const onItemSearch = (keyword: string) =>
        setMatchingItems(items.filter(({ title }) => title?.toLowerCase().includes(keyword.toLowerCase())));

    return (
        <>
            <PopupHeader
                title={intl.formatMessage(messages.filterAddMetricTitle)}
                onGoBack={onGoBack}
                onClose={onClose}
            />
            <div className="attribute-filter__limit__popup__list--searchable">
                <DropdownList
                    width={250}
                    isMobile={false}
                    showSearch={true}
                    onSearch={onItemSearch}
                    searchPlaceholder={intl.formatMessage(
                        messages.filterAddValuesLimitPopupSearchPlaceholder,
                    )}
                    searchFieldSize="small"
                    renderNoData={(props) => <NoLimitingItemsFound {...props} />}
                    items={matchingItems}
                    renderItem={({ item }) => (
                        <LimitingItem item={item} onSelect={onSelect} onClose={onClose} />
                    )}
                />
            </div>
        </>
    );
};

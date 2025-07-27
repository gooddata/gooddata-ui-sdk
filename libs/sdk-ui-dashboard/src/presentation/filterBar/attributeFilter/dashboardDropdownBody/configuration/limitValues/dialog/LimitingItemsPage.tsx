// (C) 2024-2025 GoodData Corporation

import { useState, useEffect } from "react";
import { useIntl } from "react-intl";
import cx from "classnames";
import { DropdownList, NoData } from "@gooddata/sdk-ui-kit";
import { serializeObjRef, ObjRef } from "@gooddata/sdk-model";
import { stringUtils } from "@gooddata/util";

import { messages } from "../../../../../../../locales.js";
import { ValuesLimitingItem } from "../../../../types.js";
import { LimitingItemTitle } from "../shared/LimitingItem.js";
import { IValuesLimitingItemWithTitle, useSearchableLimitingItems } from "../shared/limitingItemsHook.js";
import { useDashboardUserInteraction } from "../../../../../../../model/index.js";

import { PopupHeader } from "./PopupHeader.js";
import { getTelemetryEventForLimitingItem } from "./telemetryUtils.js";

function NoLimitingItemsFound({ hasNoMatchingData }: { hasNoMatchingData: boolean }) {
    const intl = useIntl();
    return (
        <NoData
            className="attribute-filter__limit__popup__no-data"
            hasNoMatchingData={hasNoMatchingData}
            notFoundLabel={intl.formatMessage(messages.filterAddValuesLimitPopupSearchNoMatch)}
            noDataLabel={intl.formatMessage(messages.filterAddValuesLimitPopupNoMetrics)}
        />
    );
}

interface ILimitingItemProps {
    item: IValuesLimitingItemWithTitle;
    onSelect: (item: ValuesLimitingItem) => void;
    onClose: () => void;
}

function LimitingItem({ item: { item, title }, onSelect, onClose }: ILimitingItemProps) {
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
}

export interface ILimitingItemsPageProps {
    currentlySelectedItems: ObjRef[];
    onSelect: (item: ValuesLimitingItem) => void;
    onGoBack: () => void;
    onClose: () => void;
}

export function LimitingItemsPage({
    currentlySelectedItems,
    onSelect,
    onGoBack,
    onClose,
}: ILimitingItemsPageProps) {
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
}

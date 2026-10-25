// (C) 2019-2026 GoodData Corporation

import { useCallback, useEffect, useRef, useState } from "react";

import CustomEvent from "custom-event";
import { useIntl } from "react-intl";

import { GOODSTRAP_SCROLLED_EVENT, Input } from "@gooddata/sdk-ui-kit";

import { type IDecoratedBucketItem } from "../../typings/buckets.js";
import { LoadingDropdown } from "../shared/LoadingDropdown.js";
import { NoResultsMatched as NoResultsList } from "../shared/NoResultsList.js";

import { isAttributeAlreadyFiltered } from "./isAttributeAlreadyFiltered.js";
import {
    type IMeasureAttributeFilterItem,
    MeasureAttributeListItemOrganized,
} from "./MeasureAttributeListItemOrganized.js";

export const MEASURE_ATTRIBUTE_PICKER_SEARCHBOX_HEIGHT = 41;
const CONTENT_PADDING = 2;

export interface IMeasureAttributeFilterPickerBodyProps {
    bucketItem: IDecoratedBucketItem;
    /** the attributes the metric can be filtered by, loaded by `useMeasureAttributeFilterItems` */
    items: IMeasureAttributeFilterItem[];
    isLoading: boolean;
    /** the height of the item list; the search box sits above it */
    listHeight: number;
    onSelect: (item: IMeasureAttributeFilterItem) => void;
}

/**
 * The legacy "Add attribute filter" dropdown's body: the attributes a metric can be filtered by,
 * searchable, with the ones the metric already filters by disabled.
 */
export function MeasureAttributeFilterPickerBody({
    bucketItem,
    items,
    isLoading,
    listHeight,
    onSelect,
}: IMeasureAttributeFilterPickerBodyProps) {
    const intl = useIntl();
    const [searchPhrase, setSearchPhrase] = useState("");

    const listNodeRef = useRef<HTMLDivElement | null>(null);

    // a fresh list starts unsearched
    useEffect(() => {
        setSearchPhrase("");
    }, [items]);

    const searchItems = items.filter((item) => item.title.toUpperCase().includes(searchPhrase.toUpperCase()));

    const isItemDisabled = useCallback(
        (item: IMeasureAttributeFilterItem) => isAttributeAlreadyFiltered(bucketItem, item),
        [bucketItem],
    );

    const onSelectItem = useCallback(
        (item: IMeasureAttributeFilterItem) => {
            if (isItemDisabled(item)) {
                return;
            }
            onSelect(item);
        },
        [isItemDisabled, onSelect],
    );

    const onScroll = useCallback(() => {
        if (listNodeRef.current) {
            listNodeRef.current.dispatchEvent(new CustomEvent(GOODSTRAP_SCROLLED_EVENT, { bubbles: true }));
        }
    }, []);

    if (isLoading) {
        return (
            <LoadingDropdown
                height={listHeight + CONTENT_PADDING + MEASURE_ATTRIBUTE_PICKER_SEARCHBOX_HEIGHT}
            />
        );
    }

    return (
        <>
            <Input
                value={searchPhrase}
                onChange={(value) => setSearchPhrase(String(value))}
                placeholder={intl.formatMessage({ id: "search" })}
                clearOnEsc
                isSearch
                isSmall
                autofocus
            />
            {searchItems.length ? (
                <div
                    ref={listNodeRef}
                    onScroll={onScroll}
                    style={{ height: listHeight }}
                    className="adi-attr-filter-picker-list"
                >
                    {searchItems.map((item) => (
                        <MeasureAttributeListItemOrganized
                            disabled={isItemDisabled(item)}
                            item={item}
                            onClick={onSelectItem}
                            // the identifier alone can collide across the two namespaces
                            key={`${item.type}.${item.identifier}`}
                        />
                    ))}
                </div>
            ) : (
                <NoResultsList height={listHeight} />
            )}
        </>
    );
}

// (C) 2019-2026 GoodData Corporation

import { useCallback, useEffect, useRef, useState } from "react";

import classNames from "classnames";
import { useIntl } from "react-intl";
import { type Subscription } from "rxjs";

import { Button, Overlay } from "@gooddata/sdk-ui-kit";

import { type IDecoratedBucketItem } from "../../typings/buckets.js";
import { type ITagsConfiguration } from "../../typings/route.js";
import { DROPDOWN_ALIGNMENTS, getDialogHeight, subscribeEvents } from "../../utils/dropdown.js";

import {
    MEASURE_ATTRIBUTE_PICKER_SEARCHBOX_HEIGHT,
    MeasureAttributeFilterPickerBody,
} from "./MeasureAttributeFilterPickerBody.js";
import { type IMeasureAttributeFilterItem } from "./MeasureAttributeListItemOrganized.js";
import {
    type MeasureAttributeFilterItemsLoader,
    useMeasureAttributeFilterItems,
} from "./useMeasureAttributeFilterItems.js";

const PADDING = 14;

export interface IMeasureAttributeFilterOrganizedProps {
    bucketItem: IDecoratedBucketItem;
    bucketLocalIdentifier: string;
    onSelect: (item: IMeasureAttributeFilterItem) => void;
    projectId: string;
    tagsConfiguration: ITagsConfiguration;
    itemsLoader?: MeasureAttributeFilterItemsLoader;
    isLocationIconEnabled?: boolean;
    computedAttributesEnabled?: boolean;
}

/**
 * The legacy "Add attribute filter" button of a metric with its own dropdown; with the improved
 * metric date filter the attributes are picked from the metric's "Add filter" menu instead.
 */
export function MeasureAttributeFilterOrganized({
    bucketItem,
    bucketLocalIdentifier,
    onSelect,
    projectId,
    tagsConfiguration,
    itemsLoader,
    isLocationIconEnabled,
    computedAttributesEnabled = false,
}: IMeasureAttributeFilterOrganizedProps) {
    const intl = useIntl();
    const [dialogHeight, setDialogHeight] = useState(0);
    const [displayDropdown, setDisplayDropdown] = useState(false);
    // the list loads on the first open and is kept across the following ones
    const [hasOpened, setHasOpened] = useState(false);
    const { items, isLoading } = useMeasureAttributeFilterItems({
        bucketItem,
        projectId,
        tagsConfiguration,
        itemsLoader,
        isLocationIconEnabled,
        computedAttributesEnabled,
        isEnabled: hasOpened,
    });

    const subscribersRef = useRef<Subscription[]>([]);
    const buttonNodeRef = useRef<Element | null | Text>(null);

    const setDialogHeightCallback = useCallback(() => {
        if (buttonNodeRef.current !== null && buttonNodeRef.current instanceof Element) {
            const newDialogHeight = getDialogHeight(buttonNodeRef.current.getBoundingClientRect().top);
            setDialogHeight(newDialogHeight);
        }
    }, []);

    const toggleDropdown = useCallback(() => {
        setHasOpened(true);
        setDisplayDropdown((current) => !current);
        setDialogHeightCallback();
    }, [setDialogHeightCallback]);

    const onSelectItem = useCallback(
        (item: IMeasureAttributeFilterItem) => {
            toggleDropdown();
            onSelect(item);
        },
        [toggleDropdown, onSelect],
    );

    useEffect(() => {
        subscribersRef.current = subscribeEvents(setDialogHeightCallback);

        return () => {
            subscribersRef.current.forEach((subscriber) => {
                subscriber.unsubscribe();
            });
            subscribersRef.current = [];
        };
    }, [setDialogHeightCallback]);

    const renderDropdown = () => {
        const dropdownClasses = classNames(
            "overlay",
            "adi-filter-picker",
            "adi-attr-filter-picker",
            "s-filter-picker",
        );
        const listHeight = dialogHeight - MEASURE_ATTRIBUTE_PICKER_SEARCHBOX_HEIGHT - PADDING;

        return (
            <Overlay
                onClose={toggleDropdown}
                alignTo={`.metric-attribute-filter-button.${bucketLocalIdentifier}-bucket-id`}
                alignPoints={DROPDOWN_ALIGNMENTS}
                closeOnOutsideClick
                closeOnParentScroll
                closeOnMouseDrag
            >
                <div className={dropdownClasses}>
                    <div className="gd-list">
                        <MeasureAttributeFilterPickerBody
                            bucketItem={bucketItem}
                            items={items}
                            isLoading={isLoading}
                            listHeight={listHeight}
                            onSelect={onSelectItem}
                        />
                    </div>
                </div>
            </Overlay>
        );
    };

    const buttonClasses = classNames([
        `s-${bucketLocalIdentifier}-bucket-id`,
        "s-metric-attribute-filter-button",
        "gd-button-link",
        "gd-icon-plus",
        "button-dropdown",
        "gd-icon-right",
        `${bucketLocalIdentifier}-bucket-id`,
        "metric-attribute-filter-button",
    ]);

    const buttonText = intl.formatMessage({ id: "dashboard.bucket.add_attribute_filter" });

    return (
        <span>
            <Button
                ref={(b) => {
                    buttonNodeRef.current = b;
                }}
                className={buttonClasses}
                title={buttonText}
                value={buttonText}
                onClick={toggleDropdown}
            />
            {displayDropdown ? renderDropdown() : false}
        </span>
    );
}

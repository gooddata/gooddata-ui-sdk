// (C) 2026 GoodData Corporation

import { useCallback, useMemo, useState } from "react";

import classNames from "classnames";
import { useIntl } from "react-intl";

import {
    Button,
    CatalogItemPicker,
    type ICatalogItemPickerItem,
    type ICatalogItemPickerItems,
} from "@gooddata/sdk-ui-kit";

import { type IDecoratedBucketItem } from "../../../typings/buckets.js";
import { type ITagsConfiguration } from "../../../typings/route.js";
import { CatalogDetailsBubble } from "../../catalog/item/CatalogDetailsBubble.js";
import { AddFilterDropdownShell } from "../../filterBar/filterBarDropdown/AddFilterDropdownShell.js";
import { AddFilterMenu } from "../../filterBar/filterBarDropdown/AddFilterMenu.js";
import { isAttributeAlreadyFiltered } from "../isAttributeAlreadyFiltered.js";
import { type IMeasureAttributeFilterItem } from "../MeasureAttributeListItemOrganized.js";
import { useMeasureAttributeFilterItems } from "../useMeasureAttributeFilterItems.js";

type MeasureAddFilterView = "menu" | "attributes";

export interface IMeasureAddFilterDropdownProps {
    bucketLocalIdentifier: string;
    bucketItem: IDecoratedBucketItem;
    projectId: string;
    tagsConfiguration: ITagsConfiguration;
    isLocationIconEnabled?: boolean;
    computedAttributesEnabled?: boolean;
    /** whether the metric can take one more date filter */
    isDateFilterAvailable: boolean;
    /** explains a disabled Date entry */
    dateFilterDisabledTooltip?: string;
    /** whether the metric can take one more attribute filter */
    isAttributeFilterAvailable: boolean;
    /** explains a disabled Attribute values entry */
    attributeFilterDisabledTooltip?: string;
    onAddDateFilter: () => void;
    /** the picked attributes, each getting its attribute filter on the metric, as one gesture */
    onAddAttributeFilters: (items: IMeasureAttributeFilterItem[]) => void;
}

interface IMeasureAttributePickerProps {
    bucketItem: IDecoratedBucketItem;
    projectId: string;
    tagsConfiguration: ITagsConfiguration;
    isLocationIconEnabled?: boolean;
    computedAttributesEnabled?: boolean;
    maxListHeight: number;
    onBack: () => void;
    onClose: () => void;
    onAdd: (items: IMeasureAttributeFilterItem[]) => void;
}

/**
 * The filter bar's attribute picker over the attributes valid for THIS metric (the insight's
 * availability is the filter bar's input), minus the ones the metric already filters by.
 */
// defined at module scope so the picker's row component keeps its identity across renders
const renderItemDetails = (item: ICatalogItemPickerItem<IMeasureAttributeFilterItem>) => (
    <CatalogDetailsBubble item={item.payload} />
);

function MeasureAttributePicker({
    bucketItem,
    maxListHeight,
    onBack,
    onClose,
    onAdd,
    ...loadParams
}: IMeasureAttributePickerProps) {
    const { items, isLoading } = useMeasureAttributeFilterItems({ bucketItem, ...loadParams });

    const attributeItems = useMemo(
        (): ICatalogItemPickerItems<IMeasureAttributeFilterItem> => ({
            insightItems: [],
            catalogItems: items
                .filter((item) => !isAttributeAlreadyFiltered(bucketItem, item))
                .map((item) => ({
                    // the identifier alone can collide across the two namespaces
                    id: `${item.type}.${item.identifier}`,
                    title: item.title,
                    type: "attribute",
                    payload: item,
                    ref: item.ref,
                    dataset: item.dataset,
                })),
        }),
        [items, bucketItem],
    );

    return (
        <CatalogItemPicker<IMeasureAttributeFilterItem, never>
            itemTypes={["attribute"]}
            selectionMode="multiple"
            attributeItems={attributeItems}
            maxListHeight={maxListHeight}
            isOpen
            isLoading={isLoading}
            onBack={onBack}
            onClose={onClose}
            onAdd={onAdd}
            variant="addFilter"
            renderItemDetails={renderItemDetails}
        />
    );
}

interface IMeasureAddFilterDropdownBodyProps extends IMeasureAddFilterDropdownProps {
    buttonNode: HTMLElement;
    onClose: () => void;
}

function MeasureAddFilterDropdownBody({
    bucketItem,
    projectId,
    tagsConfiguration,
    isLocationIconEnabled,
    computedAttributesEnabled,
    isDateFilterAvailable,
    dateFilterDisabledTooltip,
    isAttributeFilterAvailable,
    attributeFilterDisabledTooltip,
    onAddDateFilter,
    onAddAttributeFilters,
    buttonNode,
    onClose,
}: IMeasureAddFilterDropdownBodyProps) {
    const [activeView, setActiveView] = useState<MeasureAddFilterView>("menu");

    return (
        <AddFilterDropdownShell
            buttonNode={buttonNode}
            onClose={onClose}
            testClassName="s-metric-add-filter-dropdown"
        >
            {(maxListHeight) =>
                activeView === "menu" ? (
                    <AddFilterMenu
                        onClose={onClose}
                        onAddDateFilter={onAddDateFilter}
                        onOpenAttributePicker={() => setActiveView("attributes")}
                        isDateItemAvailable={isDateFilterAvailable}
                        dateDisabledTooltip={dateFilterDisabledTooltip}
                        isAttributeItemAvailable={isAttributeFilterAvailable}
                        attributeDisabledTooltip={attributeFilterDisabledTooltip}
                        showMetricItem={false}
                        showRankingItem={false}
                    />
                ) : (
                    <MeasureAttributePicker
                        bucketItem={bucketItem}
                        projectId={projectId}
                        tagsConfiguration={tagsConfiguration}
                        isLocationIconEnabled={isLocationIconEnabled}
                        computedAttributesEnabled={computedAttributesEnabled}
                        maxListHeight={maxListHeight}
                        onBack={() => setActiveView("menu")}
                        onClose={onClose}
                        onAdd={onAddAttributeFilters}
                    />
                )
            }
        </AddFilterDropdownShell>
    );
}

/**
 * The metric's "Add filter" button and its "Add filter for" menu, offering a date filter and the
 * attribute values the way the filter bar's does (minus the filters a metric cannot take). Date
 * hands over to the date filter chip; Attribute values turns the same dropdown into the filter
 * bar's attribute picker over the attributes valid for the metric.
 */
export function MeasureAddFilterDropdown(props: IMeasureAddFilterDropdownProps) {
    const { bucketLocalIdentifier, onAddDateFilter, onAddAttributeFilters } = props;
    const intl = useIntl();
    const [isOpen, setIsOpen] = useState(false);
    const [buttonNode, setButtonNode] = useState<HTMLElement | null>(null);

    const toggle = useCallback(() => setIsOpen((current) => !current), []);
    const close = useCallback(() => setIsOpen(false), []);

    const handleAddDateFilter = useCallback(() => {
        close();
        onAddDateFilter();
    }, [close, onAddDateFilter]);

    const handleAddAttributeFilters = useCallback(
        (items: IMeasureAttributeFilterItem[]) => {
            close();
            onAddAttributeFilters(items);
        },
        [close, onAddAttributeFilters],
    );

    const buttonText = intl.formatMessage({ id: "dashboard.bucket.add_filter" });
    const buttonClasses = classNames([
        `s-${bucketLocalIdentifier}-bucket-id`,
        "s-metric-add-filter-button",
        "gd-button-link",
        "gd-icon-plus",
        "button-dropdown",
        "gd-icon-right",
        "metric-add-filter-button",
        { "is-active": isOpen },
    ]);

    return (
        <span>
            <span ref={setButtonNode} className="adi-metric-add-filter-button-anchor">
                <Button className={buttonClasses} title={buttonText} value={buttonText} onClick={toggle} />
            </span>
            {isOpen && buttonNode ? (
                <MeasureAddFilterDropdownBody
                    {...props}
                    buttonNode={buttonNode}
                    onClose={close}
                    onAddDateFilter={handleAddDateFilter}
                    onAddAttributeFilters={handleAddAttributeFilters}
                />
            ) : null}
        </span>
    );
}

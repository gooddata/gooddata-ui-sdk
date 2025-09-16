// (C) 2024-2025 GoodData Corporation

import { useState } from "react";

import { ICatalogDateDataset, IDashboardDateFilter, ObjRef } from "@gooddata/sdk-model";
import { IAlignPoint } from "@gooddata/sdk-ui-kit";

import { ActionSelectionPage } from "./ActionSelectionPage.js";
import { DateFiltersPage } from "./DateFiltersPage.js";
import { LimitingItemsPage } from "./LimitingItemsPage.js";
import { ParentFiltersPage } from "./ParentFiltersPage.js";
import {
    IDashboardAttributeFilterParentItem,
    IDashboardDependentDateFilter,
} from "../../../../../../../model/index.js";
import { ConfigurationBubble } from "../../../../../../widget/common/configuration/ConfigurationBubble.js";
import { ValuesLimitingItem } from "../../../../types.js";

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

export interface IAddLimitingItemDialogProps {
    attributeTitle?: string;
    parentFilters: IDashboardAttributeFilterParentItem[];
    validParentFilters: ObjRef[];
    currentlySelectedItems: ObjRef[];
    dependentDateFilters: IDashboardDependentDateFilter[];
    availableDatasets: ICatalogDateDataset[];
    dependentCommonDateFilter: IDashboardDateFilter;
    commonDateFilterTitle: string;
    onSelect: (item: ValuesLimitingItem) => void;
    onClose: () => void;
}

type Page = "options" | "filters" | "items" | "dates";

export function AddLimitingItemDialog({
    attributeTitle,
    currentlySelectedItems,
    parentFilters,
    validParentFilters,
    dependentDateFilters,
    dependentCommonDateFilter,
    availableDatasets,
    commonDateFilterTitle,
    onSelect,
    onClose,
}: IAddLimitingItemDialogProps) {
    const [page, setPage] = useState<Page>("options");

    return (
        <ConfigurationBubble
            alignTo=".attribute-filter__limit__add-button"
            alignPoints={ALIGN_POINTS}
            onClose={onClose}
            classNames="attribute-filter__limit__popup"
        >
            {page === "options" ? (
                <ActionSelectionPage
                    onAddFilters={() => setPage("filters")}
                    onAddLimitingItems={() => setPage("items")}
                    onClose={onClose}
                />
            ) : null}
            {page === "filters" ? (
                <ParentFiltersPage
                    attributeTitle={attributeTitle}
                    parentFilters={parentFilters}
                    validParentFilters={validParentFilters}
                    onSelect={onSelect}
                    onGoBack={() => setPage("options")}
                    onClose={onClose}
                    dependentDateFilters={dependentDateFilters}
                    availableDatasets={availableDatasets}
                    dependentCommonDateFilter={dependentCommonDateFilter}
                    commonDateFilterTitle={commonDateFilterTitle}
                    onCommonDateSelect={() => setPage("dates")}
                />
            ) : null}
            {page === "items" ? (
                <LimitingItemsPage
                    currentlySelectedItems={currentlySelectedItems}
                    onSelect={onSelect}
                    onGoBack={() => setPage("options")}
                    onClose={onClose}
                />
            ) : null}
            {page === "dates" ? (
                <DateFiltersPage
                    onSelect={onSelect}
                    onGoBack={() => setPage("options")}
                    onClose={onClose}
                    availableDatasets={availableDatasets}
                    dependentCommonDateFilter={dependentCommonDateFilter}
                    dependentDateFilters={dependentDateFilters}
                />
            ) : null}
        </ConfigurationBubble>
    );
}

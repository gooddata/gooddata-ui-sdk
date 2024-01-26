// (C) 2024 GoodData Corporation

import React, { useState } from "react";
import { ObjRef } from "@gooddata/sdk-model";
import { IAlignPoint } from "@gooddata/sdk-ui-kit";

import { ConfigurationBubble } from "../../../../../../widget/common/configuration/ConfigurationBubble.js";
import { IDashboardAttributeFilterParentItem } from "../../../../../../../model/index.js";
import { ValuesLimitingItem } from "../../../../types.js";

import { ActionSelectionPage } from "./ActionSelectionPage.js";
import { ParentFiltersPage } from "./ParentFiltersPage.js";
import { LimitingItemsPage } from "./LimitingItemsPage.js";

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
    onSelect: (item: ValuesLimitingItem) => void;
    onClose: () => void;
}

type Page = "options" | "filters" | "items";

export const AddLimitingItemDialog: React.FC<IAddLimitingItemDialogProps> = ({
    attributeTitle,
    currentlySelectedItems,
    parentFilters,
    validParentFilters,
    onSelect,
    onClose,
}) => {
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
        </ConfigurationBubble>
    );
};

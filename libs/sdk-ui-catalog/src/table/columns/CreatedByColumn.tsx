// (C) 2025 GoodData Corporation

import React from "react";

import type { IntlShape } from "react-intl";

import { type UiAsyncTableColumn } from "@gooddata/sdk-ui-kit";

import type { ICatalogItem } from "../../catalogItem/types.js";

export const createdByColumn: (intl: IntlShape, width: number) => UiAsyncTableColumn<ICatalogItem> = (
    intl,
    width,
) => {
    return {
        width,
        key: "createdBy",
        label: intl.formatMessage({ id: "analyticsCatalog.column.title.createdBy" }),
        renderPrefixIcon: (item) => {
            if (!item.createdBy) {
                return <div className="gd-analytics-catalog__table__empty_state">–</div>;
            }
            return null;
        },
        getTextContent: (item) => item.createdBy,
        getTextTitle: (item) => item.createdBy,
    };
};

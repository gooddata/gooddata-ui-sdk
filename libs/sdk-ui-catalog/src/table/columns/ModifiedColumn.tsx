// (C) 2025 GoodData Corporation
import React from "react";

import type { IntlShape } from "react-intl";

import { type UiAsyncTableColumn, UiDate } from "@gooddata/sdk-ui-kit";

import type { ICatalogItem } from "../../catalogItem/types.js";

export const updatedAtColumn: (intl: IntlShape, width: number) => UiAsyncTableColumn<ICatalogItem> = (
    intl,
    width,
) => {
    return {
        width,
        key: "updatedAt",
        label: intl.formatMessage({ id: "analyticsCatalog.column.title.updatedAt" }),
        renderPrefixIcon: (item) => {
            if (!item.updatedAt) {
                return null;
            }
            return (
                <UiDate
                    date={item.updatedAt}
                    locale={intl.locale}
                    absoluteOptions={{
                        dateStyle: "medium",
                    }}
                />
            );
        },
        getTextContent: () => "",
        getTextTitle: (item) => item.updatedAt?.toLocaleString() ?? "",
    };
};

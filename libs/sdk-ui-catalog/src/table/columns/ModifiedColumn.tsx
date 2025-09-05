// (C) 2025 GoodData Corporation
import React, { memo } from "react";

import type { IntlShape } from "react-intl";

import { type UiAsyncTableColumn, UiDate } from "@gooddata/sdk-ui-kit";

import type { ICatalogItem } from "../../catalogItem/types.js";

const UiDateMemo = memo(UiDate);

const formatOptions: Intl.DateTimeFormatOptions = {
    dateStyle: "medium",
};

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
            return <UiDateMemo date={item.updatedAt} locale={intl.locale} absoluteOptions={formatOptions} />;
        },
        getTextContent: () => "",
        getTextTitle: (item) => item.updatedAt?.toLocaleString() ?? "",
    };
};

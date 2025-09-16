// (C) 2025 GoodData Corporation

import { memo } from "react";

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
        align: "right",
        label: intl.formatMessage({ id: "analyticsCatalog.column.title.updatedAt" }),
        getTextContent: (item) => {
            if (!item.updatedAt) {
                return <div className="gd-analytics-catalog__table__empty_state">–</div>;
            }
            return (
                <div className="gd-analytics-catalog__table__modified_at">
                    <UiDateMemo date={item.updatedAt} locale={intl.locale} absoluteOptions={formatOptions} />
                </div>
            );
        },
        getTextTitle: (item) => item.updatedAt?.toLocaleString() ?? "",
    };
};

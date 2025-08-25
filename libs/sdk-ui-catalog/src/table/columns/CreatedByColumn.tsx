// (C) 2025 GoodData Corporation
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
        getTextContent: (item) => item.createdBy,
        getTextTitle: (item) => item.createdBy,
    };
};

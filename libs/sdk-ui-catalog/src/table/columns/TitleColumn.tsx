// (C) 2025 GoodData Corporation

import type { IntlShape } from "react-intl";

import { type UiAsyncTableColumn } from "@gooddata/sdk-ui-kit";

import { CatalogItemLockMemo, type ICatalogItem } from "../../catalogItem/index.js";
import { ObjectTypeIconMemo } from "../../objectType/index.js";

export const titleColumn: (intl: IntlShape, width: number) => UiAsyncTableColumn<ICatalogItem> = (
    intl,
    width,
) => {
    return {
        width,
        key: "title",
        bold: true,
        label: intl.formatMessage({ id: "analyticsCatalog.column.title.label" }),
        renderPrefixIcon: (item) => {
            return item.isLocked ? <CatalogItemLockMemo intl={intl} /> : null;
        },
        renderRoleIcon: (item) => {
            return <ObjectTypeIconMemo type={item.type} visualizationType={item.visualizationType} />;
        },
        getTextContent: (item) => item.title,
        getTextTitle: (item) => item.title,
    };
};

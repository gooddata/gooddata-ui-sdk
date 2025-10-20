// (C) 2025 GoodData Corporation

import type { IntlShape } from "react-intl";

import { type UiAsyncTableColumn } from "@gooddata/sdk-ui-kit";

import { CatalogItemLockMemo, type ICatalogItem } from "../../catalogItem/index.js";
import { ObjectTypeIconMemo } from "../../objectType/index.js";
import { QualityIconMemo } from "../../quality/index.js";

export const titleColumn: (intl: IntlShape, width: number) => UiAsyncTableColumn<ICatalogItem> = (
    intl,
    width,
) => {
    return {
        width,
        key: "title",
        bold: true,
        label: intl.formatMessage({ id: "analyticsCatalog.column.title.label" }),
        renderRoleIcon: (item) => {
            return (
                <ObjectTypeIconMemo
                    className="gd-analytics-catalog__table__column-icon"
                    type={item.type}
                    visualizationType={item.visualizationType}
                    backgroundSize={26}
                />
            );
        },
        renderPrefixIcon: (item) => {
            return item.isLocked ? <CatalogItemLockMemo intl={intl} /> : null;
        },
        renderSuffixIcon: (item) => {
            return (
                <QualityIconMemo
                    className="gd-analytics-catalog__table__column-icon"
                    intl={intl}
                    objectId={item.identifier}
                />
            );
        },
        getTextContent: (item) => item.title,
        getTextTitle: (item) => item.title,
    };
};

// (C) 2025 GoodData Corporation
import React from "react";

import type { IntlShape } from "react-intl";

import { type UiAsyncTableColumn } from "@gooddata/sdk-ui-kit";

import type { ICatalogItem } from "../../catalogItem/types.js";
import { ObjectTypeIcon } from "../../objectType/ObjectTypeIcon.js";

export const titleColumn: (intl: IntlShape, width: number) => UiAsyncTableColumn<ICatalogItem> = (
    intl,
    width,
) => {
    return {
        width,
        key: "title",
        label: intl.formatMessage({ id: "analyticsCatalog.column.title.label" }),
        renderRoleIcon: (item) => {
            return <ObjectTypeIcon type={item.type} />;
        },
        getTextContent: (item) => item.title,
        getTextTitle: (item) => item.title,
    };
};

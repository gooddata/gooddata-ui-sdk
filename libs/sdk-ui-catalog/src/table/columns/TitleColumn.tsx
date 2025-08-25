// (C) 2025 GoodData Corporation
import React from "react";

import cx from "classnames";
import type { IntlShape } from "react-intl";

import { type UiAsyncTableColumn, UiIcon } from "@gooddata/sdk-ui-kit";

import type { ICatalogItem } from "../../catalogItem/types.js";

export const titleColumn: (intl: IntlShape, width: number) => UiAsyncTableColumn<ICatalogItem> = (
    intl,
    width,
) => {
    return {
        width,
        key: "title",
        label: intl.formatMessage({ id: "analyticsCatalog.column.title.label" }),
        renderRoleIcon: (item) => {
            return <TitleColumnIcon item={item} />;
        },
        getTextContent: (item) => item.title,
        getTextTitle: (item) => item.title,
    };
};

interface ITitleColumnProps {
    item: ICatalogItem;
}

function TitleColumnIcon({ item }: ITitleColumnProps) {
    return (
        <div className={cx("gd-analytics-catalog__object-type", "gd-analytics-catalog__table__column-icon")}>
            <div data-object-type={item.type}>
                <UiIcon
                    type={item.type === "attribute" ? "ldmAttribute" : item.type}
                    size={14}
                    backgroundSize={27}
                />
            </div>
        </div>
    );
}

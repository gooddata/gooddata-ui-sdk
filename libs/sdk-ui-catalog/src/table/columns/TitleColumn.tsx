// (C) 2025-2026 GoodData Corporation

import { memo } from "react";

import type { IntlShape } from "react-intl";

import { type IUiAsyncTableColumn } from "@gooddata/sdk-ui-kit";

import {
    CatalogItemLockMemo,
    CatalogItemVisibilityIconMemo,
    type ICatalogItem,
} from "../../catalogItem/index.js";
import { ObjectTypeIconMemo, ObjectTypeTooltip } from "../../objectType/index.js";
import { QualityIconMemo } from "../../quality/index.js";

export const titleColumn: (intl: IntlShape, width: number) => IUiAsyncTableColumn<ICatalogItem> = (
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
                <ObjectTypeRoleIconMemo
                    intl={intl}
                    type={item.type}
                    visualizationType={item.visualizationType}
                />
            );
        },
        renderPrefixIcon: (item) => {
            return item.isLocked ? <CatalogItemLockMemo intl={intl} /> : null;
        },
        renderSuffixIcon: (item) => {
            return (
                <>
                    <QualityIconMemo
                        className="gd-analytics-catalog__table__column-icon"
                        intl={intl}
                        objectId={item.identifier}
                    />
                    <CatalogItemVisibilityIconMemo
                        className="gd-analytics-catalog__table__column-icon"
                        intl={intl}
                        item={item}
                    />
                </>
            );
        },
        getTextContent: (item) => item.title,
        getTextTitle: (item) => item.title,
    };
};

type ObjectTypeRoleIconProps = {
    intl: IntlShape;
    type: ICatalogItem["type"];
    visualizationType?: ICatalogItem["visualizationType"];
};

const ObjectTypeRoleIconMemo = memo(function ObjectTypeRoleIcon(props: ObjectTypeRoleIconProps) {
    const { intl, type, visualizationType } = props;
    return (
        <ObjectTypeTooltip
            intl={intl}
            type={type}
            visualizationType={visualizationType}
            anchor={
                <ObjectTypeIconMemo
                    className="gd-analytics-catalog__table__column-icon"
                    intl={intl}
                    type={type}
                    visualizationType={visualizationType}
                    backgroundSize={26}
                />
            }
        />
    );
});

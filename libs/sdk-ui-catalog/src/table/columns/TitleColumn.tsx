// (C) 2025-2026 GoodData Corporation

import { memo } from "react";

import type { IntlShape } from "react-intl";

import { type IUiAsyncTableColumn } from "@gooddata/sdk-ui-kit";

import { CatalogItemLockMemo } from "../../catalogItem/CatalogItemLock.js";
import { CatalogItemVisibilityIconMemo } from "../../catalogItem/CatalogItemVisibilityIcon.js";
import { getVisualizationType } from "../../catalogItem/guards.js";
import { type ICatalogItem, type VisualizationType } from "../../catalogItem/types.js";
import { CatalogCertificationIconMemo } from "../../certification/CatalogCertificationIcon.js";
import { ObjectTypeIconMemo } from "../../objectType/ObjectTypeIcon.js";
import { ObjectTypeTooltip } from "../../objectType/ObjectTypeTooltip.js";
import { QualityIconMemo } from "../../quality/QualityIcon.js";

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
                    visualizationType={getVisualizationType(item)}
                />
            );
        },
        renderPrefixIcon: (item) => {
            return item.isLocked ? <CatalogItemLockMemo intl={intl} /> : null;
        },
        renderSuffixIcon: (item) => {
            return (
                <>
                    <CatalogCertificationIconMemo
                        className="gd-analytics-catalog__table__column-icon"
                        certification={item.certification}
                    />
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
    visualizationType?: VisualizationType;
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

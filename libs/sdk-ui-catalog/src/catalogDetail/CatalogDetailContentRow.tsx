// (C) 2025-2026 GoodData Corporation

import cx from "classnames";
import type { ReactNode } from "react";

export interface ICatalogDetailContentRowProps {
    title: ReactNode;
    content?: ReactNode;
    alignTop?: boolean;
}

export function CatalogDetailContentRow({ title, content, alignTop }: ICatalogDetailContentRowProps) {
    if (!content) {
        return null;
    }
    const cell = cx("gd-analytics-catalog-detail__tab-content__cell", {
        "gd-analytics-catalog-detail__tab-content__cell--align-top": alignTop,
    });
    return (
        <>
            <dt className={cx(cell, "gd-analytics-catalog-detail__title-cell")}>{title}</dt>
            <dd className={cx(cell, "gd-analytics-catalog-detail__detail-cell")}>{content}</dd>
        </>
    );
}

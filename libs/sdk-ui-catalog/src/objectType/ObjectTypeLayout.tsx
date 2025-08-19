// (C) 2025 GoodData Corporation

import React from "react";

import { FormattedMessage } from "react-intl";

export function ObjectTypeLayout({ children, ...htmlProps }: React.ComponentProps<"div">) {
    return (
        <div {...htmlProps} className="gd-analytics-catalog__object-type">
            <span className="gd-analytics-catalog__object-type__title">
                <FormattedMessage id="analyticsCatalog.objectType.title" />
            </span>
            {children}
        </div>
    );
}

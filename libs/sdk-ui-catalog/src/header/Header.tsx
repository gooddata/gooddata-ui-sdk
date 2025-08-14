// (C) 2025 GoodData Corporation

import React from "react";
import { FormattedMessage } from "react-intl";

export function Header() {
    return (
        <header className="gd-analytics-catalog__header">
            <span className="gd-analytics-catalog__header__title">
                <FormattedMessage id="analyticsCatalog.title" />
            </span>
        </header>
    );
}

// (C) 2007-2022 GoodData Corporation
import React from "react";
import { FormattedMessage } from "react-intl";

export function InvertableSelectNoResultsMatch() {
    return (
        <div className="gd-list-noResults">
            <FormattedMessage id="gs.list.noResultsMatch" />
        </div>
    );
}

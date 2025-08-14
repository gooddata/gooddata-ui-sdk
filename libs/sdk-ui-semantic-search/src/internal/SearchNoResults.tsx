// (C) 2025 GoodData Corporation

import { FormattedMessage } from "react-intl";
import React from "react";

export interface SearchNoResults {
    searchTerm: string;
    searchMessage?: string;
}

export function SearchNoResults({ searchMessage, searchTerm }: SearchNoResults) {
    if (searchMessage) {
        return <div className="gd-semantic-search__overlay-no-results">{searchMessage}</div>;
    }
    return (
        <div className="gd-semantic-search__overlay-no-results">
            <FormattedMessage id="semantic-search.no-results" values={{ query: searchTerm }} />
        </div>
    );
}

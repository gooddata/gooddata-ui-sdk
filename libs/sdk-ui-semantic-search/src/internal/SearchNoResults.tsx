// (C) 2025 GoodData Corporation

import { FormattedMessage } from "react-intl";

import { testIds } from "../automation/index.js";

export interface SearchNoResults {
    searchTerm: string;
    searchMessage?: string;
}

export function SearchNoResults({ searchMessage, searchTerm }: SearchNoResults) {
    return (
        <div className="gd-semantic-search__overlay-no-results" data-testid={testIds.semanticSearchNoResults}>
            {searchMessage || (
                <FormattedMessage id="semantic-search.no-results" values={{ query: searchTerm }} />
            )}
        </div>
    );
}

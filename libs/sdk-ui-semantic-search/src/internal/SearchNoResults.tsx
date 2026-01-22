// (C) 2025-2026 GoodData Corporation

import { FormattedMessage } from "react-intl";

import { semanticSearchNoResults } from "../automation/testIds.js";

export interface ISearchNoResults {
    searchTerm: string;
    searchMessage?: string;
}

export function SearchNoResults({ searchMessage, searchTerm }: ISearchNoResults) {
    return (
        <div className="gd-semantic-search__overlay-no-results" data-testid={semanticSearchNoResults}>
            {searchMessage || (
                <FormattedMessage id="semantic-search.no-results" values={{ query: searchTerm }} />
            )}
        </div>
    );
}

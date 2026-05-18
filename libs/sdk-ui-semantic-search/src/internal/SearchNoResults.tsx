// (C) 2025-2026 GoodData Corporation

import { FormattedMessage } from "react-intl";

import { semanticSearchNoResults } from "../automation/testIds.js";
import { SemanticSearchError } from "../SemanticSearchError.js";

import { type IErrorMessageProps, getErrorMessage } from "./errorMessage.js";

export interface ISearchNoResults {
    searchTerm: string;
    searchError?: IErrorMessageProps;
}

export function SearchNoResults({ searchError, searchTerm }: ISearchNoResults) {
    const err = getErrorMessage(searchError);

    if (err && searchError) {
        return <SemanticSearchError searchError={searchError} />;
    }

    return (
        <div className="gd-semantic-search__overlay-no-results" data-testid={semanticSearchNoResults}>
            <FormattedMessage id="semantic-search.no-results" values={{ query: searchTerm }} />
        </div>
    );
}

// (C) 2025 GoodData Corporation

import { FormattedMessage } from "react-intl";

import * as styles from "./SearchNoResults.module.scss.js";
import { testIds } from "../automation/index.js";

export interface SearchNoResults {
    searchTerm: string;
    searchMessage?: string;
}

export function SearchNoResults({ searchMessage, searchTerm }: SearchNoResults) {
    return (
        <div className={styles.overlayNoResults} data-testid={testIds.semanticSearchNoResults}>
            {searchMessage || (
                <FormattedMessage id="semantic-search.no-results" values={{ query: searchTerm }} />
            )}
        </div>
    );
}

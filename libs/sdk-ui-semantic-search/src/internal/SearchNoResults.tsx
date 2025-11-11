// (C) 2025 GoodData Corporation

import { FormattedMessage } from "react-intl";

import * as styles from "./SearchNoResults.module.scss.js";

export interface SearchNoResults {
    searchTerm: string;
    searchMessage?: string;
}

export function SearchNoResults({ searchMessage, searchTerm }: SearchNoResults) {
    if (searchMessage) {
        return <div className={styles.overlayNoResults}>{searchMessage}</div>;
    }
    return (
        <div className={styles.overlayNoResults}>
            <FormattedMessage id="semantic-search.no-results" values={{ query: searchTerm }} />
        </div>
    );
}

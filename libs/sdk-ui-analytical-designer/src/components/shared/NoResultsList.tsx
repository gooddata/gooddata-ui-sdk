// (C) 2007-2026 GoodData Corporation

import { FormattedMessage } from "react-intl";

const PADDING = 30;

interface INoResultsMatchedProps {
    height?: number;
}

export function NoResultsMatched({ height = 300 }: INoResultsMatchedProps) {
    return (
        <div className="gd-list-noResults s-no-results" style={{ height: height - PADDING }}>
            <FormattedMessage id="no_results_matched" />
        </div>
    );
}

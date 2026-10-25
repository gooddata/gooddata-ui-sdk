// (C) 2007-2026 GoodData Corporation

import { FormattedMessage } from "react-intl";

export interface IEmptySearchResultProps {
    searchPhrase: string;
}

export function EmptySearchResult(props: IEmptySearchResultProps) {
    return (
        <div className="adi-no-items s-adi-no-items">
            <span className="s-not-matching-message">
                <FormattedMessage id="catalog.no_data_matching" />
                <br />
                {'"'}
                {props.searchPhrase}
                {'"'}
            </span>
        </div>
    );
}

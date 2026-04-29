// (C) 2026 GoodData Corporation

import { type IErrorMessageProps, getErrorMessage } from "./internal/errorMessage.js";

export interface ISemanticSearchErrorProps {
    searchError: IErrorMessageProps;
}

export function SemanticSearchError({ searchError }: ISemanticSearchErrorProps) {
    return <div className="gd-semantic-search__message">{getErrorMessage(searchError)}</div>;
}

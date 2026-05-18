// (C) 2026 GoodData Corporation

import { Message } from "@gooddata/sdk-ui-kit";

import { type IErrorMessageProps, getErrorMessage } from "./internal/errorMessage.js";

export interface ISemanticSearchErrorProps {
    searchError: IErrorMessageProps;
}

export function SemanticSearchError({ searchError }: ISemanticSearchErrorProps) {
    return (
        <div className="gd-semantic-search__message">
            <Message type="error">{getErrorMessage(searchError)}</Message>
        </div>
    );
}

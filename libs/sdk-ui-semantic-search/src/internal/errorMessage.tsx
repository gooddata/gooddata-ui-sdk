// (C) 2026 GoodData Corporation

import { FormattedMessage } from "react-intl";

import { type ISemanticSearchError } from "@gooddata/sdk-model";

export interface IErrorMessageProps {
    message: string;
    detail?: ISemanticSearchError;
}

export function getErrorMessage(searchError?: IErrorMessageProps) {
    if (searchError?.detail?.reason === "METADATA_SYNC_IN_PROGRESS") {
        return <FormattedMessage id="semantic-search.error.sync-in-progress" />;
    }
    if (searchError?.detail?.reason === "METADATA_SYNC_REQUEST_ERROR") {
        return <FormattedMessage id="semantic-search.error.sync-failed" />;
    }
    if (searchError?.message) {
        return searchError.message;
    }
    return null;
}

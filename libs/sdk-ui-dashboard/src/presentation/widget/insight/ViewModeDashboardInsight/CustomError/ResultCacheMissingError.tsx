// (C) 2025 GoodData Corporation

import { FormattedMessage } from "react-intl";

import { Typography } from "@gooddata/sdk-ui-kit";

import { CompactContentError } from "./CompactContentError.js";
import { ErrorContainer } from "./ErrorContainer.js";

interface IErrorProps {
    fullContent: boolean;
}

export function ResultCacheMissingError({ fullContent }: IErrorProps) {
    return (
        <ErrorContainer>
            {fullContent ? (
                <div className="info-label-icon gd-icon-sync">
                    <Typography tagName="h2">
                        <FormattedMessage id="visualization.ErrorMessageResultCacheMissing" tagName="span" />
                    </Typography>
                    <Typography tagName="p">
                        <FormattedMessage
                            id="visualization.ErrorDescriptionResultCacheMissing"
                            tagName="span"
                        />
                    </Typography>
                </div>
            ) : (
                <CompactContentError
                    className="gd-icon-sync"
                    headline="visualization.ErrorMessageResultCacheMissing"
                    text="visualization.ErrorDescriptionResultCacheMissing"
                />
            )}
        </ErrorContainer>
    );
}

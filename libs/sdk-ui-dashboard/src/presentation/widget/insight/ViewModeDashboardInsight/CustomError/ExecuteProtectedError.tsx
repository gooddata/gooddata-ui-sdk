// (C) 2007-2025 GoodData Corporation
import { FormattedMessage } from "react-intl";
import { Typography } from "@gooddata/sdk-ui-kit";

import { CompactContentError } from "./CompactContentError.js";
import { ErrorContainer } from "./ErrorContainer.js";

interface IExecuteProtectedErrorProps {
    fullContent: boolean;
}

export function ExecuteProtectedError({ fullContent }: IExecuteProtectedErrorProps) {
    return (
        <ErrorContainer>
            {fullContent ? (
                <div className="info-label-icon gd-icon-warning">
                    <Typography tagName="h2">
                        <FormattedMessage
                            id="visualization.execute_protected_report.headline"
                            tagName="span"
                        />
                    </Typography>
                    <Typography tagName="h2">
                        <FormattedMessage id="visualization.execute_protected_report.text" tagName="span" />
                    </Typography>
                </div>
            ) : (
                <CompactContentError
                    className="gd-icon-warning"
                    headline="visualization.execute_protected_report.headline"
                    text="visualization.execute_protected_report.text"
                />
            )}
        </ErrorContainer>
    );
}

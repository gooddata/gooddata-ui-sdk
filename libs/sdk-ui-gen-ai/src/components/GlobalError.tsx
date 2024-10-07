// (C) 2024 GoodData Corporation

import React from "react";
import { Button, Typography } from "@gooddata/sdk-ui-kit";
import { FormattedMessage, injectIntl, WrappedComponentProps } from "react-intl";

type GlobalErrorProps = {
    errorDetails: string;
    clearError: () => void;
};

const GlobalErrorComponent: React.FC<GlobalErrorProps & WrappedComponentProps> = ({
    errorDetails,
    clearError,
    intl,
}) => {
    const [showMore, setShowMore] = React.useState(false);
    const hasShowMoreButton = Boolean(errorDetails && !showMore);

    return (
        <div className="gd-gen-ai-chat__global_error">
            <Typography tagName="p">
                <FormattedMessage id="gd.gen-ai.global-error" />
            </Typography>
            <Button
                className="gd-button-link"
                value={intl.formatMessage({ id: "gd.gen-ai.global-error.button-clear" })}
                onClick={clearError}
            />
            {hasShowMoreButton ? (
                <Button
                    className="gd-button-link"
                    value={intl.formatMessage({ id: "gd.gen-ai.global-error.button-details" })}
                    onClick={() => setShowMore(true)}
                />
            ) : null}
            {showMore ? (
                <Typography tagName="p" className="gd-gen-ai-chat__global_error__details">
                    {errorDetails}
                </Typography>
            ) : null}
        </div>
    );
};

export const GlobalError = injectIntl(GlobalErrorComponent);

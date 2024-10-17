// (C) 2024 GoodData Corporation

import React from "react";
import { Button, Typography } from "@gooddata/sdk-ui-kit";
import { injectIntl, WrappedComponentProps } from "react-intl";
import { ErrorComponent } from "@gooddata/sdk-ui";

type GlobalErrorProps = {
    errorDetails: string;
    clearing: boolean;
    clearError: () => void;
};

const GlobalErrorComponent: React.FC<GlobalErrorProps & WrappedComponentProps> = ({
    errorDetails,
    clearing,
    clearError,
    intl,
}) => {
    const [showMore, setShowMore] = React.useState(false);
    const hasShowMoreButton = Boolean(errorDetails && !showMore);

    return (
        <div className="gd-gen-ai-chat__global_error">
            <div>
                <ErrorComponent
                    message={intl.formatMessage({ id: "gd.gen-ai.global-error" })}
                    description={intl.formatMessage({ id: "gd.gen-ai.global-error.description" })}
                />
            </div>
            <div className="gd-gen-ai-chat__global_error__buttons">
                <Button
                    className="gd-button-link"
                    value={intl.formatMessage({ id: "gd.gen-ai.global-error.button-clear" })}
                    onClick={clearError}
                    disabled={clearing}
                />
                {hasShowMoreButton ? (
                    <Button
                        className="gd-button-link"
                        value={intl.formatMessage({ id: "gd.gen-ai.global-error.button-details" })}
                        onClick={() => setShowMore(true)}
                        disabled={clearing}
                    />
                ) : null}
            </div>
            {showMore ? (
                <Typography tagName="p" className="gd-gen-ai-chat__global_error__details">
                    <pre>{errorDetails}</pre>
                </Typography>
            ) : null}
        </div>
    );
};

export const GlobalError = injectIntl(GlobalErrorComponent);

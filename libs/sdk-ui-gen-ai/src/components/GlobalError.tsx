// (C) 2024 GoodData Corporation

import React from "react";
import { Button, Typography } from "@gooddata/sdk-ui-kit";
import { connect } from "react-redux";
import { clearMessagesAction } from "../store/index.js";
import { FormattedMessage, injectIntl, WrappedComponentProps } from "react-intl";

type GlobalErrorDispatchProps = {
    clearMessagesAction: () => void;
};

type GlobalErrorProps = GlobalErrorDispatchProps & {
    errorDetails: string;
    clearError: () => void;
};

const GlobalErrorComponent: React.FC<GlobalErrorProps & WrappedComponentProps> = ({
    errorDetails,
    clearMessagesAction,
    clearError,
    intl,
}) => {
    const [showMore, setShowMore] = React.useState(false);
    const showMoreButton = Boolean(errorDetails && !showMore);

    const clearCallback = () => {
        clearMessagesAction();
        clearError();
    };

    return (
        <div className="gd-gen-ai-chat__global_error">
            <Typography tagName="p">
                <FormattedMessage id="gd.gen-ai.global-error" />
            </Typography>
            <Button
                className="gd-button-link"
                value={intl.formatMessage({ id: "gd.gen-ai.global-error.button-clear" })}
                onClick={clearCallback}
            />
            {showMoreButton ? (
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

const mapDispatchToProps = {
    clearMessagesAction,
};

export const GlobalError = connect(null, mapDispatchToProps)(injectIntl(GlobalErrorComponent));

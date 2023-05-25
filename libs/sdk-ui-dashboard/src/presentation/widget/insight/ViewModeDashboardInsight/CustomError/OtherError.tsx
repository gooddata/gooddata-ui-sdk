// (C) 2007-2021 GoodData Corporation
import React from "react";
import { FormattedMessage } from "react-intl";
import { Typography } from "@gooddata/sdk-ui-kit";

import { CompactContentError } from "./CompactContentError.js";
import { ErrorContainer } from "./ErrorContainer.js";

interface IErrorProps {
    fullContent: boolean;
}

export const OtherError: React.FC<IErrorProps> = ({ fullContent }) => {
    return (
        <ErrorContainer>
            {fullContent ? (
                <div className="info-label-icon gd-icon-warning">
                    <Typography tagName="h2">
                        <FormattedMessage id="visualization.error.headline" tagName="span" />
                    </Typography>
                    <Typography tagName="p">
                        <FormattedMessage id="visualization.error.text" tagName="span" />
                    </Typography>
                </div>
            ) : (
                <CompactContentError
                    className="gd-icon-warning"
                    headline="visualization.error.headline"
                    text="visualization.error.text"
                />
            )}
        </ErrorContainer>
    );
};

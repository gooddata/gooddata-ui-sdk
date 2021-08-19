// (C) 2007-2021 GoodData Corporation
import React from "react";
import { FormattedHTMLMessage } from "react-intl";
import { Typography } from "@gooddata/sdk-ui-kit";

import { CompactContentError } from "./CompactContentError";
import { ErrorContainer } from "./ErrorContainer";

interface IErrorProps {
    fullContent: boolean;
}

export const OtherError: React.FC<IErrorProps> = ({ fullContent }) => {
    return (
        <ErrorContainer>
            {fullContent ? (
                <div className="info-label-icon gd-icon-warning">
                    <Typography tagName="h2">
                        <FormattedHTMLMessage id="visualization.error.headline" />
                    </Typography>
                    <Typography tagName="p">
                        <FormattedHTMLMessage id="visualization.error.text" />
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

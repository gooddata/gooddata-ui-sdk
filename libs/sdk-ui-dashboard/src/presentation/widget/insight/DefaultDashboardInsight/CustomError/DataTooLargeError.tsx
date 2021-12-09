// (C) 2007-2021 GoodData Corporation
import React from "react";
import { FormattedHTMLMessage } from "react-intl";
import { Typography } from "@gooddata/sdk-ui-kit";

import { CompactContentError } from "./CompactContentError";
import { ErrorContainer } from "./ErrorContainer";

interface IDataTooLargeErrorProps {
    fullContent: boolean;
}

export const DataTooLargeError: React.FC<IDataTooLargeErrorProps> = ({ fullContent }) => {
    return (
        <ErrorContainer>
            {fullContent ? (
                <div className="info-label-icon gd-icon-rain">
                    <Typography tagName="h2">
                        <FormattedHTMLMessage id="visualization.dataTooLarge.headline" />
                    </Typography>
                    <Typography tagName="p">
                        <FormattedHTMLMessage id="visualization.dataTooLarge.text" />
                    </Typography>
                </div>
            ) : (
                <CompactContentError
                    className="gd-icon-rain"
                    headline="visualization.dataTooLarge.headline"
                    text="visualization.dataTooLarge.text"
                />
            )}
        </ErrorContainer>
    );
};

// (C) 2007-2021 GoodData Corporation
import React from "react";
import { FormattedMessage } from "react-intl";
import { Typography } from "@gooddata/sdk-ui-kit";

import { CompactContentError } from "./CompactContentError.js";
import { ErrorContainer } from "./ErrorContainer.js";

interface IDataTooLargeErrorProps {
    fullContent: boolean;
}

export const DataTooLargeError: React.FC<IDataTooLargeErrorProps> = ({ fullContent }) => {
    return (
        <ErrorContainer>
            {fullContent ? (
                <div className="info-label-icon gd-icon-rain">
                    <Typography tagName="h2">
                        <FormattedMessage id="visualization.dataTooLarge.headline" tagName="span" />
                    </Typography>
                    <Typography tagName="p">
                        <FormattedMessage id="visualization.dataTooLarge.text" tagName="span" />
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

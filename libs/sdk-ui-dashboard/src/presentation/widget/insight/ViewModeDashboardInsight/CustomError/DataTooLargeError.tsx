// (C) 2007-2025 GoodData Corporation
import { FormattedMessage } from "react-intl";
import { Typography } from "@gooddata/sdk-ui-kit";

import { CompactContentError } from "./CompactContentError.js";
import { ErrorContainer } from "./ErrorContainer.js";

interface IDataTooLargeErrorProps {
    fullContent: boolean;
}

export function DataTooLargeError({ fullContent }: IDataTooLargeErrorProps) {
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
}

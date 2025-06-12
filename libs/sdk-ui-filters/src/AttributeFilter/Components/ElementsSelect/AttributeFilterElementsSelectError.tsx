// (C) 2021-2022 GoodData Corporation
import React from "react";
import { FormattedMessage } from "react-intl";
import { Message } from "@gooddata/sdk-ui-kit";
import { GoodDataSdkError } from "@gooddata/sdk-ui";

/**
 * It represents error message component.
 * @beta
 */
export interface IAttributeFilterElementsSelectErrorProps {
    error: GoodDataSdkError;
}

/**
 * Component that displays a generic error message.
 * @beta
 */
export const AttributeFilterElementsSelectError: React.VFC = () => (
    <Message type="error">
        <FormattedMessage id="gs.list.error" />
    </Message>
);

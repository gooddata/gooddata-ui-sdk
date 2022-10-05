// (C) 2021-2022 GoodData Corporation
import React from "react";
import { FormattedMessage } from "react-intl";
import { Message } from "@gooddata/sdk-ui-kit";
import { GoodDataSdkError } from "@gooddata/sdk-ui";

/**
 * @alpha
 */
export interface IAttributeFilterElementsSelectErrorProps {
    error: GoodDataSdkError;
}

/**
 * @internal
 */
export const AttributeFilterElementsSelectError: React.VFC = () => (
    <Message type="error">
        <FormattedMessage id="gs.list.error" />
    </Message>
);

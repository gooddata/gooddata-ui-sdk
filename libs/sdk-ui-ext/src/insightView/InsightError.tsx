// (C) 2019-2025 GoodData Corporation
import React, { useMemo } from "react";

import { WrappedComponentProps, injectIntl } from "react-intl";

import {
    ErrorComponent as DefaultError,
    GoodDataSdkError,
    IErrorDescriptors,
    IErrorProps,
    newErrorMapping,
} from "@gooddata/sdk-ui";

/**
 * @internal
 */
export interface IInsightErrorProps {
    error: GoodDataSdkError;
    ErrorComponent?: React.ComponentType<IErrorProps>;
    height?: number | string | null;
    clientHeight?: number;
}

const InsightErrorCore: React.FC<IInsightErrorProps & WrappedComponentProps> = ({
    error,
    ErrorComponent = DefaultError,
    height,
    intl,
    clientHeight,
}) => {
    const errorMapping = useMemo<IErrorDescriptors>(() => newErrorMapping(intl), [intl]);
    const errorProps = useMemo(
        () => errorMapping[error.getMessage()] ?? { message: error.message },
        [errorMapping, error],
    );

    return <ErrorComponent {...errorProps} height={height} clientHeight={clientHeight} />;
};

/**
 * @internal
 */
export const InsightError = injectIntl(InsightErrorCore);

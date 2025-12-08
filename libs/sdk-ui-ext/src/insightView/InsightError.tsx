// (C) 2019-2025 GoodData Corporation

import { ComponentType, useMemo } from "react";

import { useIntl } from "react-intl";

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
    ErrorComponent?: ComponentType<IErrorProps>;
    height?: number | string | null;
    clientHeight?: number;
}

/**
 * @internal
 */
export function InsightError({
    error,
    ErrorComponent = DefaultError,
    height,
    clientHeight,
}: IInsightErrorProps) {
    const intl = useIntl();
    const errorMapping = useMemo<IErrorDescriptors>(() => newErrorMapping(intl), [intl]);
    const errorProps = useMemo(
        () => errorMapping[error.getMessage()] ?? { message: error.message },
        [errorMapping, error],
    );

    return <ErrorComponent {...errorProps} height={height} clientHeight={clientHeight} />;
}

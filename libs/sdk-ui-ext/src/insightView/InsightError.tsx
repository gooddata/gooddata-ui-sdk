// (C) 2019 GoodData Corporation
import {
    ErrorComponent as DefaultError,
    GoodDataSdkError,
    IErrorDescriptors,
    IErrorProps,
    newErrorMapping,
} from "@gooddata/sdk-ui";
import { injectIntl, WrappedComponentProps } from "react-intl";
import React, { useMemo } from "react";

interface IInsightErrorProps {
    error: GoodDataSdkError;
    ErrorComponent?: React.ComponentType<IErrorProps>;
    height?: number | string | null;
}

const InsightErrorCore: React.FC<IInsightErrorProps & WrappedComponentProps> = ({
    error,
    ErrorComponent = DefaultError,
    height,
    intl,
}) => {
    const errorMapping = useMemo<IErrorDescriptors>(() => newErrorMapping(intl), [intl]);
    const errorProps = useMemo(() => errorMapping[error.getMessage()] ?? { message: error.message }, [
        errorMapping,
        error,
    ]);

    return <ErrorComponent {...errorProps} height={height} />;
};

export const InsightError = injectIntl(InsightErrorCore);

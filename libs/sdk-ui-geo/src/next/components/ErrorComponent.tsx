// (C) 2025 GoodData Corporation

import { useIntl } from "react-intl";

import {
    ErrorComponent as DefaultErrorComponent,
    ErrorCodes,
    GoodDataSdkError,
    newErrorMapping,
} from "@gooddata/sdk-ui";

import { useGeoPushpinProps } from "../context/GeoPushpinPropsContext.js";

const UNKNOWN_ERROR_CODE = ErrorCodes.UNKNOWN_ERROR;

/**
 * @internal
 */
interface IErrorComponentProps {
    error: GoodDataSdkError;
}

/**
 * @internal
 */
export function ErrorComponent({ error }: IErrorComponentProps) {
    const intl = useIntl();
    const errorMap = newErrorMapping(intl);

    const { ErrorComponent } = useGeoPushpinProps();
    const Error = ErrorComponent ?? DefaultErrorComponent;

    const code = error.getErrorCode?.() ?? UNKNOWN_ERROR_CODE;
    const errorProps = errorMap[code] ?? errorMap[UNKNOWN_ERROR_CODE];

    return <Error code={code} {...errorProps} />;
}

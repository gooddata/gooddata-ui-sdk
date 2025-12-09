// (C) 2025 GoodData Corporation

import { useIntl } from "react-intl";

import {
    ErrorComponent as DefaultErrorComponent,
    ErrorCodes,
    GoodDataSdkError,
    newErrorMapping,
} from "@gooddata/sdk-ui";

import { useGeoChartNextProps } from "../context/GeoChartNextContext.js";

const UNKNOWN_ERROR_CODE = ErrorCodes.UNKNOWN_ERROR;

/**
 * @internal
 */
interface IGeoErrorComponentProps {
    error: GoodDataSdkError;
}

/**
 * @internal
 */
export function GeoErrorComponent({ error }: IGeoErrorComponentProps) {
    const intl = useIntl();
    const errorMap = newErrorMapping(intl);

    const { ErrorComponent } = useGeoChartNextProps();
    const Error = ErrorComponent ?? DefaultErrorComponent;

    const code = error.getErrorCode?.() ?? UNKNOWN_ERROR_CODE;
    const errorProps = errorMap[code] ?? errorMap[UNKNOWN_ERROR_CODE];

    return <Error code={code} {...errorProps} />;
}

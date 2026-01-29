// (C) 2025-2026 GoodData Corporation

import { useIntl } from "react-intl";

import {
    ErrorComponent as DefaultErrorComponent,
    ErrorCodes,
    type GoodDataSdkError,
    newErrorMapping,
} from "@gooddata/sdk-ui";

import { useGeoChartProps } from "../context/GeoChartContext.js";

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

    const { ErrorComponent } = useGeoChartProps();
    const Error = ErrorComponent ?? DefaultErrorComponent;

    const code = error.getErrorCode?.() ?? UNKNOWN_ERROR_CODE;
    const errorProps = errorMap[code] ?? errorMap[UNKNOWN_ERROR_CODE];

    return <Error code={code} {...errorProps} />;
}

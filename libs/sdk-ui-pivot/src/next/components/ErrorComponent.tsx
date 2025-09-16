// (C) 2025 GoodData Corporation

import { useIntl } from "react-intl";

import {
    ErrorComponent as DefaultErrorComponent,
    ErrorCodes,
    GoodDataSdkError,
    newErrorMapping,
} from "@gooddata/sdk-ui";

import { usePivotTableProps } from "../../next/context/PivotTablePropsContext.js";

const UNKNOWN_ERROR_CODE = ErrorCodes.UNKNOWN_ERROR;

/**
 * @alpha
 */
interface IErrorComponentProps {
    error: GoodDataSdkError;
}

/**
 * Pivot table next error component.
 *
 * @alpha
 */
export function ErrorComponent(props: IErrorComponentProps) {
    const { error } = props;

    const intl = useIntl();
    const errorMap = newErrorMapping(intl);

    const { ErrorComponent } = usePivotTableProps();
    const Error = ErrorComponent || DefaultErrorComponent;

    const code = error.getErrorCode?.() ?? UNKNOWN_ERROR_CODE;
    const errorProps = errorMap[code] ?? errorMap[UNKNOWN_ERROR_CODE];

    return <Error code={code} {...errorProps} />;
}

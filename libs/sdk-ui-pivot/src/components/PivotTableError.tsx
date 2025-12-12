// (C) 2007-2025 GoodData Corporation

import { type ComponentType, type ReactElement } from "react";

import { ErrorCodes, type IErrorDescriptors } from "@gooddata/sdk-ui";

export interface IPivotTableErrorProps {
    error: string;
    errorMap: IErrorDescriptors;
    ErrorComponent?: ComponentType<any>;
}

export function PivotTableError({
    error,
    errorMap,
    ErrorComponent,
}: IPivotTableErrorProps): ReactElement | null {
    if (!ErrorComponent) {
        return null;
    }

    const errorProps =
        errorMap[Object.prototype.hasOwnProperty.call(errorMap, error) ? error : ErrorCodes.UNKNOWN_ERROR];

    return <ErrorComponent code={error} {...errorProps} />;
}

// (C) 2007-2025 GoodData Corporation
import React from "react";

import { ErrorCodes, IErrorDescriptors } from "@gooddata/sdk-ui";

export interface IPivotTableErrorProps {
    error: string;
    errorMap: IErrorDescriptors;
    ErrorComponent?: React.ComponentType<any>;
}

export function PivotTableError({
    error,
    errorMap,
    ErrorComponent,
}: IPivotTableErrorProps): React.ReactElement | null {
    if (!ErrorComponent) {
        return null;
    }

    const errorProps =
        errorMap[Object.prototype.hasOwnProperty.call(errorMap, error) ? error : ErrorCodes.UNKNOWN_ERROR];

    return <ErrorComponent code={error} {...errorProps} />;
}

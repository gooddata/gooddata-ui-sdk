// (C) 2025 GoodData Corporation
import { UnexpectedSdkError } from "@gooddata/sdk-ui";

import { AgGridProps } from "../../types/agGrid.js";

/**
 * @internal
 */
export function enableDefaultTextWrappingForCells(options: AgGridProps): AgGridProps {
    // Ensure this option is set only once
    if (options.defaultColDef?.wrapText) {
        throw new UnexpectedSdkError("wrapText is already set");
    }

    return {
        ...options,
        defaultColDef: {
            ...options.defaultColDef,
            wrapText: true,
        },
    };
}

/**
 * @internal
 */
export function enableDefaultTextWrappingForHeaders(options: AgGridProps): AgGridProps {
    // Ensure this option is set only once
    if (options.defaultColDef?.wrapHeaderText) {
        throw new UnexpectedSdkError("wrapHeaderText is already set");
    }

    return {
        ...options,
        defaultColDef: {
            ...options.defaultColDef,
            wrapHeaderText: true,
        },
        defaultColGroupDef: {
            ...options.defaultColGroupDef,
            wrapHeaderText: true,
        },
    };
}

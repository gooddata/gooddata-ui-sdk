// (C) 2007-2018 GoodData Corporation
import { Execution } from "@gooddata/typings";

export function fixEmptyHeaderItems(
    executionResult: Execution.IExecutionResult,
    emptyHeaderString: string,
): Execution.IExecutionResult {
    if (!executionResult.headerItems) {
        return executionResult;
    }

    const headerItems = executionResult.headerItems.map(dim => {
        return dim.map(attr => {
            return attr.map(headerItemWrapper => {
                const type = Object.keys(headerItemWrapper)[0];

                if (["attributeHeaderItem", "measureHeaderItem", "totalHeaderItem"].indexOf(type) >= 0) {
                    headerItemWrapper[type].name = headerItemWrapper[type].name || emptyHeaderString;
                }
                return headerItemWrapper;
            });
        });
    });

    return {
        ...executionResult,
        headerItems,
    };
}

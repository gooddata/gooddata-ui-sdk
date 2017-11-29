import { Execution } from '@gooddata/typings';

export function fixEmptyHeaderItems(
    executionResultWrapper: Execution.IExecutionResult,
    emptyHeaderString: string
): Execution.IExecutionResult {
    if (!executionResultWrapper.executionResult.headerItems) {
        return executionResultWrapper;
    }

    const headerItems = executionResultWrapper.executionResult.headerItems.map((dim) => {
        return dim.map((attr) => {
            return attr.map((headerItemWrapper) => {
                const type = Object.keys(headerItemWrapper)[0];

                if (['attributeHeaderItem', 'measureHeaderItem', 'totalHeaderItem'].indexOf(type) >= 0) {
                    headerItemWrapper[type].name = headerItemWrapper[type].name || emptyHeaderString;
                }
                return headerItemWrapper;
            });
        });
    });

    return {
        executionResult: {
            ...executionResultWrapper.executionResult,
            headerItems
        }
    };
}

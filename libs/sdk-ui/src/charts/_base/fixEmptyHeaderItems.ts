// (C) 2007-2018 GoodData Corporation
import { IDataView } from "@gooddata/sdk-backend-spi";
import { GdcExecution } from "@gooddata/gd-bear-model";

export function fixEmptyHeaderItems(
    executionResult: GdcExecution.IExecutionResult,
    emptyHeaderString: string,
): GdcExecution.IExecutionResult {
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

export function fixEmptyHeaderItems2(dataView: IDataView, emptyHeaderString: string): void {
    dataView.headerItems.forEach(dim => {
        dim.forEach(attr => {
            attr.forEach(item => {
                const type = Object.keys(item)[0];

                if (["attributeHeaderItem", "measureHeaderItem", "totalHeaderItem"].indexOf(type) >= 0) {
                    item[type].name = item[type].name || emptyHeaderString;
                }
            });
        });
    });
}

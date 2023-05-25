// (C) 2007-2021 GoodData Corporation
import { IBrokenAlertFilter, isBrokenAlertAttributeFilter } from "../../../types.js";

interface ILabelFilterData {
    title: string;
    selection: string;
    isDate: boolean;
    isAllSelected: boolean;
    selectionSize: number | undefined;
}

export function getFilterLabelFilter(item: IBrokenAlertFilter): ILabelFilterData {
    if (isBrokenAlertAttributeFilter(item)) {
        return {
            isAllSelected: item.isAllSelected,
            isDate: false,
            selection: item.selection,
            selectionSize: item.selectionSize,
            title: item.title,
        };
    } else {
        return {
            isAllSelected: false,
            isDate: true,
            selection: item.dateFilterTitle,
            selectionSize: undefined,
            title: item.title,
        };
    }
}

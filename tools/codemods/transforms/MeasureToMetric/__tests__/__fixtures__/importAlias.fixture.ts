// (C) 2022 GoodData Corporation
import {
    IMeasureValueFilter as IMeasureValueFilterModel,
    isMeasure,
    IMeasure,
    isMeasureValueFilter as query,
} from "@gooddata/sdk-model";

export const foo = (_filter: IMeasureValueFilterModel | null): IMeasure | null => {
    const a = isMeasure({});
    const b = query({});
    return (a || b) as any;
};

// (C) 2022 GoodData Corporation
import {
    modifyMeasure,
    modifySimpleMeasure,
    modifyPopMeasure,
    modifyPreviousPeriodMeasure,
    idRef,
} from "@gooddata/sdk-model";

const measure = {} as any;

export const modifiedMeasure = modifyMeasure(measure, (m) => m.title("Test"));
export const modifiedSimpleMeasure = modifySimpleMeasure(measure, (m) => m.measureItem(idRef("other")));
export const modifiedPopMeasure = modifyPopMeasure(measure, (m) => m.masterMeasure("other"));
export const modifiedPreviousPeriodMeasure = modifyPreviousPeriodMeasure(measure, (m) =>
    m.masterMeasure("other"),
);

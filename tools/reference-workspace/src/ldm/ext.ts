// (C) 2019-2020 GoodData Corporation
import {
    modifyMeasure,
    newArithmeticMeasure,
    newPopMeasure,
    newPreviousPeriodMeasure,
    ObjRef,
    modifySimpleMeasure,
} from "@gooddata/sdk-model";
import * as ReferenceLdm from "./full";

/*
 * This file contains our custom extensions on top of the reference LDM. Things such as arithmetic
 * measure definitions, PoP measure definitions and any custom yet reusable stuff that is useful
 * when testing.
 */

export const MinAmount = modifyMeasure(ReferenceLdm.Amount_1.Min, (m) =>
    m.alias("Min Amount").defaultLocalId(),
);
export const MedianAmount = modifyMeasure(ReferenceLdm.Amount_1.Median, (m) =>
    m.alias("Median Amount").defaultLocalId(),
);
export const MaxAmount = modifyMeasure(ReferenceLdm.Amount_1.Max, (m) =>
    m.alias("Max Amount").defaultLocalId(),
);

/**
 * Arithmetic measure doing difference of Amount and Won measures
 */
export const CalculatedLost = newArithmeticMeasure(
    [ReferenceLdm.Amount, ReferenceLdm.Won],
    "difference",
    (m) => m.alias("Calculated 'Lost' measure"),
);

/**
 * Arithmetic measure calculating ratio of calculated 'Lost' and
 * MAQL 'Won' measure
 */
export const CalculatedWonLostRatio = newArithmeticMeasure([CalculatedLost, ReferenceLdm.Won], "ratio", (m) =>
    m.alias("Ratio of Won and Lost"),
);

/**
 * A PoP measure derived from 'Won' measure, comparing same period previous year
 *
 * NOTE: popAttrId is hardcoded like this because PoP measure needs attribute ID and not display form ID and
 * attribute ids are not yet in the generated LDM catalog.
 */
export const WonPopClosedYear = newPopMeasure(ReferenceLdm.Won, "closed.year", (m) =>
    m.alias("Won Last Year"),
);

/**
 * A previous period measure derived from 'Won' measure
 */
export const WonPreviousPeriod = newPreviousPeriodMeasure(ReferenceLdm.Won, [
    { dataSet: "closed", periodsAgo: 1 },
]);
/**
 * Measure that computes ratio
 */
export const AmountWithRatio = modifySimpleMeasure(ReferenceLdm.Amount, (m) =>
    m.alias("Amount with Ratio").ratio().localId("Amount with Ratio"),
);
/**
 * A reference to date data set of the 'Closed' dimension
 */
export const ClosedDataDatasetRef: ObjRef = {
    identifier: "closed",
};
/**
 * A reference to Stage History Attribute
 */
export const StageHistoryAttributeRef: ObjRef = {
    identifier: "attr.stagehistory.id",
};

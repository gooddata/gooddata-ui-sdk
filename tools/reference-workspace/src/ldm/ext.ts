// (C) 2019 GoodData Corporation
import { newArithmeticMeasure } from "@gooddata/sdk-model";
import * as ReferenceLdm from "./full";
import { newPopMeasure } from "@gooddata/sdk-model";

/*
 * This file contains our custom extensions on top of the reference LDM. Things such as arithmetic
 * measure definitions, PoP measure definitions and any custom yet reusable stuff that is useful
 * when testing.
 */

/**
 * Arithmetic measure doing difference of Amount and Won measures
 */
export const CalculatedLost = newArithmeticMeasure([ReferenceLdm.Amount, ReferenceLdm.Won], "difference", m =>
    m.alias("Calculated 'Lost' measure"),
);

/**
 * Arithmetic measure calculating ratio of calculated 'Lost' and
 * MAQL 'Won' measure
 */
export const CalculatedWonLostRatio = newArithmeticMeasure([CalculatedLost, ReferenceLdm.Won], "ratio", m =>
    m.alias("Ratio of Won and Lost"),
);

/**
 * A PoP measure derived from 'Won' measure, comparing same perioud previous year
 *
 * NOTE: popAttrId is hardcoded like this because PoP measure needs attribute ID and not display form ID and
 * attribute ids are not yet in the generated LDM catalog.
 */
export const WonPopClosedYear = newPopMeasure(ReferenceLdm.Won, "closed.year", m => m.alias("Won Last Year"));

// (C) 2020 GoodData Corporation

import { Density, Population } from "./full.js";
import { modifySimpleMeasure } from "@gooddata/sdk-model";

export const sizeMeasure = modifySimpleMeasure(Population.Sum, (m) =>
    m.format("#,##0.00").alias("Population").defaultLocalId(),
);
export const colorMeasure = modifySimpleMeasure(Density.Sum, (m) =>
    m.format("#,##0.00").alias("Density").defaultLocalId(),
);

// (C) 2020 GoodData Corporation
import { Ldm } from "./index";
import { modifySimpleMeasure } from "@gooddata/sdk-model";
import { workspace } from "../constants/fixtures";
import { HeaderPredicates } from "@gooddata/sdk-ui";

export const sizeMeasure = modifySimpleMeasure(Ldm.Population.Sum, (m) =>
    m.format("#,##0.00").alias("Population").defaultLocalId(),
);
export const colorMeasure = modifySimpleMeasure(Ldm.Density.Sum, (m) =>
    m.format("#,##0.00").alias("Density").defaultLocalId(),
);
export const locationAttribute = Ldm.City.Location;
export const segmentByAttribute = Ldm.StateName;
export const tooltipTextAttribute = Ldm.City.Default;

const predicateAttributeHeaderItemUri = `/gdc/md/${workspace}/obj/9461/elements?id=10456587`;
export const attributeUriPredicate = HeaderPredicates.uriMatch(predicateAttributeHeaderItemUri);

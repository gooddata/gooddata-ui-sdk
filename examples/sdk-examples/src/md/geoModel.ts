// (C) 2020-2021 GoodData Corporation
import * as Md from "./full";
import { modifySimpleMeasure } from "@gooddata/sdk-model";
import { workspace } from "../constants/fixtures";
import { HeaderPredicates } from "@gooddata/sdk-ui";

export const sizeMeasure = modifySimpleMeasure(Md.Population.Sum, (m) =>
    m.format("#,##0.00").alias("Population").defaultLocalId(),
);
export const colorMeasure = modifySimpleMeasure(Md.Density.Sum, (m) =>
    m.format("#,##0.00").alias("Density").defaultLocalId(),
);
export const locationAttribute = Md.City.Location;
export const segmentByAttribute = Md.StateName;
export const tooltipTextAttribute = Md.City.Default;

const predicateAttributeHeaderItemUri = `/gdc/md/${workspace}/obj/9461/elements?id=10456587`;
export const attributeUriPredicate = HeaderPredicates.uriMatch(predicateAttributeHeaderItemUri);

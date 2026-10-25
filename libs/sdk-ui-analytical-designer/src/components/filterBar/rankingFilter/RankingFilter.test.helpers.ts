// (C) 2020-2026 GoodData Corporation

import { type IRankingFilter, idRef, localIdRef, newRankingFilter, uriRef } from "@gooddata/sdk-model";
import { type IAttributeDropdownItem, type IMeasureDropdownItem } from "@gooddata/sdk-ui-filters";

import { type IRankingFilter as IRankingFilterState } from "../../../store/filter_bar/filter_bar_types.js";

import { type IRankingFilterButtonModel } from "./RankingFilterButton.js";

export const rankingFilterWithoutAttributes: IRankingFilter = newRankingFilter("m1", "TOP", 10);
export const rankingFilterWithAttributes: IRankingFilter = newRankingFilter("m1", ["a1"], "TOP", 10);
export const rankingFilterWithUriMeasure: IRankingFilter = newRankingFilter(
    uriRef("/uri"),
    ["a1"],
    "TOP",
    10,
);
export const rankingFilterWithUriAttribute: IRankingFilter = newRankingFilter(
    "m1",
    [uriRef("/uri")],
    "TOP",
    10,
);

export const rankingFilterState: IRankingFilterState = {
    type: "ranking",
    localIdentifier: "f1",
    measureLocalIdentifier: "m1",
    operator: "TOP",
    value: 10,
};

export const rankingFilterStateWithCatalogMeasureRef: IRankingFilterState = {
    type: "ranking",
    localIdentifier: "f1",
    measureRef: idRef("metric_from_catalog", "measure"),
    operator: "TOP",
    value: 10,
};

export const rankingFilterStateWithAttributeLocalIdentifiers: IRankingFilterState = {
    type: "ranking",
    localIdentifier: "f1",
    measureLocalIdentifier: "m1",
    attributes: ["a1"],
    operator: "TOP",
    value: 10,
};

export const rankingFilterStateWithCatalogAttribute: IRankingFilterState = {
    type: "ranking",
    localIdentifier: "f1",
    measureLocalIdentifier: "m1",
    // A bucket attribute (local id) plus a catalog attribute referenced by ObjRef.
    attributes: ["a1", idRef("attr_from_catalog", "displayForm")],
    operator: "TOP",
    value: 10,
};

export const measureItems: IMeasureDropdownItem[] = [
    { title: "Measure 1", ref: localIdRef("m1") },
    { title: "Measure 2", ref: localIdRef("m2") },
    { title: "Measure 3", ref: localIdRef("m3") },
];

export const measureItemsWithSequence: IMeasureDropdownItem[] = [
    { title: "Measure 1", ref: localIdRef("m1"), sequenceNumber: "M1" },
    { title: "Measure 2", ref: localIdRef("m2"), sequenceNumber: "M2" },
    { title: "Measure 3", ref: localIdRef("m3"), sequenceNumber: "M3" },
];

export const attributeItems: IAttributeDropdownItem[] = [
    { title: "Attribute 1", ref: localIdRef("a1"), type: "ATTRIBUTE" },
    { title: "Attribute 2", ref: localIdRef("a2"), type: "ATTRIBUTE" },
    { title: "DATE", ref: localIdRef("d1"), type: "DATE" },
];

export const buttonValueWithoutAttribute: IRankingFilterButtonModel = {
    operator: "TOP",
    value: 10,
    measureTitle: "Measure 1",
};

export const buttonValueWithAttribute: IRankingFilterButtonModel = {
    operator: "TOP",
    value: 10,
    measureTitle: "Measure 1",
    attributeTitle: "Attribute 1",
};

export const buttonValueWithSequenceAndAttribute: IRankingFilterButtonModel = {
    operator: "BOTTOM",
    value: 10,
    measureTitle: "Measure 1",
    measureSequence: "M1",
    attributeTitle: "Attribute 1",
};

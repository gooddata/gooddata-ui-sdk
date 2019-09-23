// (C) 2007-2019 GoodData Corporation
import { measure } from "../../../base/helpers/model";
import { IMeasure } from "@gooddata/sdk-model";

export const M1: IMeasure = measure("m1").localIdentifier("m1");
export const M1WithRatio: IMeasure = measure("m1")
    .localIdentifier("m1")
    .ratio();

export const M2: IMeasure = measure("m2").localIdentifier("m2");

export const M3: IMeasure = measure("m3").localIdentifier("m3");

export const M4: IMeasure = measure("m4").localIdentifier("m4");

// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import type {
    IGeoConfig,
    ILegacyGeoPushpinChartLatitudeLongitudeProps,
    ILegacyGeoPushpinChartProps,
} from "../GeoChart.js";
import { type GeoPushpinChart, type LegacyGeoPushpinChart } from "../index.js";
import type { IGeoPushpinChartConfig } from "../next/types/config/pushpinChart.js";

type ExpectedLegacyProps = ILegacyGeoPushpinChartProps | ILegacyGeoPushpinChartLatitudeLongitudeProps;

type PropsOf<T> = T extends (props: infer P) => unknown ? P : never;
type IsAssignable<A, B> = [A] extends [B] ? true : false;
type Assert<T extends true> = T;
type IsOptional<T, K extends keyof T> = Pick<T, K> extends Required<Pick<T, K>> ? false : true;

type NewProps = PropsOf<typeof GeoPushpinChart>;
type LegacyProps = PropsOf<typeof LegacyGeoPushpinChart>;

// GeoPushpinChart prop shape must stay backward compatible with the legacy pushpin API
export type _newPropsAcceptLegacy = Assert<IsAssignable<ExpectedLegacyProps, NewProps>>;

// LegacyGeoPushpinChart must keep the legacy prop shape intact
export type _legacyPropsMatchExpected = Assert<IsAssignable<LegacyProps, ExpectedLegacyProps>>;
export type _expectedAssignableToLegacy = Assert<IsAssignable<ExpectedLegacyProps, LegacyProps>>;

// Legacy config fields should stay present for type-compatibility, but can be optional/deprecated.
export type _hasMapboxToken = Assert<IsAssignable<"mapboxToken", keyof IGeoConfig>>;
export type _mapboxTokenIsOptional = Assert<IsOptional<IGeoConfig, "mapboxToken">>;

// New MapLibre config types must remain backward compatible with the legacy config shape.
export type _legacyConfigAssignableToNewPushpinConfig = Assert<
    IsAssignable<IGeoConfig, IGeoPushpinChartConfig>
>;
export type _newPushpinConfigAssignableToLegacyConfig = Assert<
    IsAssignable<IGeoPushpinChartConfig, IGeoConfig>
>;
export type _newPushpinConfigHasMapboxToken = Assert<
    IsAssignable<"mapboxToken", keyof IGeoPushpinChartConfig>
>;
export type _newPushpinConfigMapboxTokenIsOptional = Assert<
    IsOptional<IGeoPushpinChartConfig, "mapboxToken">
>;

describe("GeoPushpinChart typing", () => {
    it("is validated by TypeScript", () => {
        // The assertions above are compile-time only. This runtime test exists so Vitest
        // detects a test suite (CI fails on files without suites).
        expect(true).toBe(true);
    });
});

export {};

// (C) 2021-2026 GoodData Corporation

// @vitest-environment node
import { describe, expect, it } from "vitest";

import { idRef } from "@gooddata/sdk-model";

import { type ICacheItemDisplayForm } from "../typings/state_objects.js";

import { isSupportedDisplayFormType } from "./display_form.js";

const textDisplayForm: ICacheItemDisplayForm = {
    id: "text.df",
    uri: "/md/text.df",
    ref: idRef("text.df"),
    title: "Text display form",
    type: undefined,
};

const hyperlinkDisplayForm: ICacheItemDisplayForm = {
    id: "link.df",
    uri: "/md/link.df",
    ref: idRef("link.df"),
    title: "Hyperlink display form",
    type: "GDC.link",
};

const imageDisplayForm: ICacheItemDisplayForm = {
    id: "image.df",
    uri: "/md/image.df",
    ref: idRef("image.df"),
    title: "Image display form",
    type: "GDC.image",
};

const geoPinDisplayForm: ICacheItemDisplayForm = {
    id: "geoPin.df",
    uri: "/md/geoPin.df",
    ref: idRef("geoPin.df"),
    title: "Geo Pin display form",
    type: "GDC.geo.pin",
};

const legacyGeoDisplayForm: ICacheItemDisplayForm = {
    id: "legacyGeo.df",
    uri: "/md/legacyGeo.df",
    ref: idRef("legacyGeo.df"),
    title: "Legacy geo display form",
    type: "GDC.geo.ausstates.code",
};

describe("display_form", () => {
    describe("isSupportedDisplayFormType", () => {
        it.each([
            [true, "text", textDisplayForm],
            [true, "hyperlink", hyperlinkDisplayForm],
            [true, "image", imageDisplayForm],
            [true, "geo pin", geoPinDisplayForm],
            [false, "legacy geo", legacyGeoDisplayForm],
        ])(
            "should return %s for %s display form",
            (expectedResult: boolean, _type: string, label: ICacheItemDisplayForm) => {
                expect(isSupportedDisplayFormType(label)).toBe(expectedResult);
            },
        );
    });
});

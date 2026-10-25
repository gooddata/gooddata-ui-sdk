// (C) 2021-2026 GoodData Corporation

import { type ICacheItemDisplayForm } from "../typings/state_objects.js";

export const isSupportedDisplayFormType = (displayForm: ICacheItemDisplayForm) =>
    displayForm.type === undefined ||
    displayForm.type === "GDC.link" ||
    displayForm.type === "GDC.image" ||
    displayForm.type === "GDC.geo.pin" ||
    displayForm.type === "GDC.geo.pin_latitude" ||
    displayForm.type === "GDC.geo.pin_longitude" ||
    displayForm.type === "GDC.geo.icon" ||
    displayForm.type === "GDC.geo.area" ||
    displayForm.type.startsWith("GDC.time.");

// (C) 2019 GoodData Corporation
/* eslint-disable import/no-unassigned-import */
import "@testing-library/jest-dom/extend-expect";
import * as raf from "raf";
import { TextEncoder } from "util";

global.TextEncoder = TextEncoder;

/*
 * this is needed as soon as code imports from the sdk-ui-ext index. that in turn imports a lot of stuff and eventually
 * also the geo chart with mapbox. mapbox loading requires this function which is not yet implemented in jsdom
 *
 * see: https://github.com/jsdom/jsdom/issues/1721
 */
function noop() {
    // empty on purpose
}
if (typeof window.URL.createObjectURL === "undefined") {
    Object.defineProperty(window.URL, "createObjectURL", { value: noop });
}
//

raf.polyfill();

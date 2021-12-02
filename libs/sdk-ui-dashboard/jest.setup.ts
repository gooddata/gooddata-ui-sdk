// (C) 2019 GoodData Corporation
/* eslint-disable @typescript-eslint/no-var-requires */
import "jest-enzyme";
import * as raf from "raf";

const enzyme = require("enzyme");
const Adapter = require("@wojtekmaj/enzyme-adapter-react-17");

enzyme.configure({ adapter: new Adapter() });

/*
 * this is needed as soon as code imports from the sdk-ui-ext index. that in turn imports a lot of stuff and eventualluy
 * also the geo chart with mapbox. mapbox loading requires this function which is not yet implemented in jsdom
 *
 * see: https://github.com/jsdom/jsdom/issues/1721
 */
function noop() {}
if (typeof window.URL.createObjectURL === "undefined") {
    Object.defineProperty(window.URL, "createObjectURL", { value: noop });
}
//

raf.polyfill();

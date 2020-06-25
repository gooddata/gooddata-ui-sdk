// (C) 2019 GoodData Corporation
/* tslint:disable:no-var-requires */
import "jest-enzyme";
import * as raf from "raf";

const enzyme = require("enzyme");
const Adapter = require("enzyme-adapter-react-16");

enzyme.configure({ adapter: new Adapter() });

raf.polyfill();

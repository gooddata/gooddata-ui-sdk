// (C) 2019 GoodData Corporation
import "jest-enzyme";
import * as raf from "raf";

const enzyme = require("enzyme");
const Adapter = require("@wojtekmaj/enzyme-adapter-react-17");

enzyme.configure({ adapter: new Adapter() });

raf.polyfill();

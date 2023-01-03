// (C) 2019 GoodData Corporation
/* eslint-disable import/no-unresolved */
import "jest-enzyme";
import * as raf from "raf";

/* eslint-disable @typescript-eslint/no-var-requires */
const enzyme = require("enzyme");
const Adapter = require("@wojtekmaj/enzyme-adapter-react-17");

enzyme.configure({ adapter: new Adapter() });

raf.polyfill();

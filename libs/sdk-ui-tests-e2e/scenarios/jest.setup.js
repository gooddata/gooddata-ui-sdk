// (C) 2021-2022 GoodData Corporation
/* eslint-disable @typescript-eslint/no-var-requires */
const enzyme = require("enzyme");
const Adapter = require("@wojtekmaj/enzyme-adapter-react-17");

enzyme.configure({ adapter: new Adapter() });

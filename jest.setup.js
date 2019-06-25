// (C) 2019 GoodData Corporation
const raf = require('raf');

raf.polyfill();

const enzyme = require('enzyme');
const Adapter = require('enzyme-adapter-react-16');

enzyme.configure({ adapter: new Adapter() });

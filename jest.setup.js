// (C) 2019 GoodData Corporation
const raf = require('raf');

raf.polyfill();

const enzyme = require('enzyme');
const Adapter = require('enzyme-adapter-react-16');

enzyme.configure({ adapter: new Adapter() });

// Fail test on console error (react proptypes validation etc.)
console.error = (err, ...args) => { // eslint-disable-line no-console
    console.error(err, ...args); // eslint-disable-line no-console
    throw new Error(err);
};

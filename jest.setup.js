const enzyme = require('enzyme');
const Adapter = require('enzyme-adapter-react-15');

enzyme.configure({ adapter: new Adapter() });

// Fail test on console error (react proptypes validation etc.)
const consoleError = console.error;
console.error = (err, ...args) => {
    consoleError(err, ...args);
    throw new Error(err);
};

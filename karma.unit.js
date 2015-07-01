var testsContext = require.context("./test", true, /\_test\.js$/);
testsContext.keys().forEach(testsContext);
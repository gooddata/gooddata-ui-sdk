// (C) 2024-2025 GoodData Corporation

// after update to > 2.8.2 we could import from @reduxjs/toolkit and remove this file
// in current version @reduxjs/toolkit is not ESM compatible we need to use imports from esm module
// in current version of @reduxjs/toolkit esm export are not defined
// we need direct import from esm module otherwise import are not node compatible
// https://github.com/reduxjs/redux-toolkit/issues/1960
declare module "@reduxjs/toolkit/dist/redux-toolkit.esm.js" {
    export * from "@reduxjs/toolkit";

    import { configureStore } from "@reduxjs/toolkit";

    export { configureStore };
}

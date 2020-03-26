// (C) 2007-2020 GoodData Corporation
import "isomorphic-fetch";
import { factory, SDK } from "./gooddata";

const factoryBrowser = factory(fetch.bind(window));

// Fetch requests will be sent through the isomorphic-fetch. Our authentication
// relies on cookies, so it will work in browser environment automatically.

// For node see `gooddata-node.js` file.
export { factoryBrowser as factory, SDK };
export * from "./api";

export default factoryBrowser();

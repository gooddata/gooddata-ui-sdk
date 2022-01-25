// (C) 2007-2022 GoodData Corporation
import "isomorphic-fetch";
import { factory, SDK } from "./gooddata";

const getFactoryBrowser = (config?: any) => factory(fetch.bind(window))(config);

/**
 * @deprecated use getFactory instead
 */
const factoryBrowser = factory(fetch.bind(window));

// Fetch requests will be sent through the isomorphic-fetch. Our authentication
// relies on cookies, so it will work in browser environment automatically.

// For node see `gooddata-node.js` file.
export { factoryBrowser as factory, getFactoryBrowser as getFactory, SDK };
export * from "./api";

export default factoryBrowser();

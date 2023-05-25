// (C) 2007-2022 GoodData Corporation

import fetchCookie from "fetch-cookie";
import nodeFetch from "node-fetch";

import { factory, SDK } from "./gooddata.js";

// Calling getFactoryNode always reinitializes fetch-cookie. This way, when factory
// initialization happens between requests, new instance of fetch-cookie and uderlying
// cookie jar will be used.
const getFactoryNode = (config?: any) => factory(fetchCookie(nodeFetch as any))(config);

// Fetch requests will be sent through the node-fetch wrapped by the fetch-cookie.
// This is necessary in order to preserve cookies between requests like it would be
// done in the browser environment. Otherwise the SDK would forget about authentication
// immediately.
export { getFactoryNode as getFactory, SDK };

export * from "./api.js";

export default getFactoryNode();

// (C) 2007-2020 GoodData Corporation

const fetchCookie = require("fetch-cookie"); // tslint:disable-line:no-var-requires
import nodeFetch from "node-fetch";

import { factory, SDK } from "./gooddata";

const factoryNode = factory(fetchCookie(nodeFetch as any));

// Fetch requests will be sent through the node-fetch wrapped by the fetch-cookie.
// This is necessary in order to preserve cookies between requests like it would be
// done in the browser environment. Otherwise the SDK would forget about authentication
// immediately.
export { factoryNode as factory, SDK };

export * from "./api";

export default factoryNode();

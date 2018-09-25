// (C) 2007-2014 GoodData Corporation
import 'isomorphic-fetch';
import { factory, SDK } from './gooddata';
import { ApiResponse, ApiResponseError, ApiNetworkError } from './xhr';
import * as DataLayer from './DataLayer';

const factoryBrowser = factory(fetch.bind(window));

// Fetch requests will be sent through the isomorphic-fetch. Our authentication
// relies on cookies, so it will work in browser environment automatically.

// For node see `gooddata-node.js` file.
export {
    factoryBrowser as factory,
    SDK,
    DataLayer
};

// Allow to reuse our ApiResponse and API response errors
export {
    ApiResponse,
    ApiResponseError,
    ApiNetworkError
};

export * from './interfaces';

export default factoryBrowser();

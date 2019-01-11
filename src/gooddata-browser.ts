// (C) 2007-2014 GoodData Corporation
import 'isomorphic-fetch';
import { factory, SDK } from './gooddata';
import { ApiResponse, ApiResponseError, ApiNetworkError } from './xhr';
import * as referenceHandling from './referenceHandling';

import * as DataLayer from './DataLayer';
import * as TypeGuards from './typeGuards';

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

// explicitly export TypeGuards as they cannot be exported using the export * syntax when there is also a default export
export {
    TypeGuards,
    referenceHandling
};

export * from './interfaces';

export default factoryBrowser();

// (C) 2007-2014 GoodData Corporation
const fetchCookie = require('fetch-cookie'); // tslint:disable-line:no-var-requires
import nodeFetch from 'node-fetch';

import { factory, SDK } from './gooddata';
import * as DataLayer from './DataLayer';
import { ApiResponse, ApiResponseError, ApiNetworkError } from './xhr';
import * as referenceHandling from './referenceHandling';
import * as TypeGuards from './typeGuards';

const factoryNode = factory(fetchCookie(nodeFetch as any));

// Fetch requests will be sent through the node-fetch wrapped by the fetch-cookie.
// This is necessary in order to preserve cookies between requests like it would be
// done in the browser environment. Otherwise the SDK would forget about authentication
// immediately.
export {
    factoryNode as factory,
    SDK,
    DataLayer
};

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

export default factoryNode();

// Copyright (C) 2007-2014, GoodData(R) Corporation. All rights reserved.
const fetchCookie = require('fetch-cookie'); // tslint:disable-line:no-var-requires
import nodeFetch from 'node-fetch';

import { factory, SDK } from './gooddata';
import { DataLayer, ApiResponse, ApiResponseError, ApiNetworkError } from './gooddata-browser';

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

export * from './interfaces';

export default factoryNode();

// Copyright (C) 2007-2014, GoodData(R) Corporation. All rights reserved.
import fetch from 'isomorphic-fetch';
import { setFetch } from './utils/fetch';
import defaultInstance, { factory } from './gooddata';

// Fetch requests will be sent through the isomorphic-fetch. Our authentication
// relies on cookies, so it will work in browser environment automatically.

// For node see `gooddata-node.js` file.
setFetch(fetch);

export { factory };
export default defaultInstance;

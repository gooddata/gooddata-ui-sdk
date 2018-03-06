import defaultInstance, { factory } from './gooddata';
import { setFetch } from './utils/fetch';

// Fetch requests will be sent through the node-fetch wrapped by the fetch-cookie.
// This is necessary in order to preserve cookies between requests like it would be
// done in the browser environment. Otherwise the SDK would forget about authentication
// immediately.
setFetch(require('fetch-cookie')(require('node-fetch')));

// Backward compatibility
defaultInstance.factory = factory; // eslint-disable-line import/no-named-as-default-member
export default defaultInstance;
module.exports = defaultInstance;

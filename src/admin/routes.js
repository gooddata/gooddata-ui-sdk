export const ROOT = '/gdc/admin';

export const CONTRACTS = `${ROOT}/contracts`;
export const CONTRACT = `${CONTRACTS}/:contractId`;

export const CONTRACT_DATA_PRODUCTS = `${CONTRACT}/dataproducts`;
export const CONTRACT_DATA_PRODUCT = `${CONTRACT_DATA_PRODUCTS}/:dataProductId`;
export const CONTRACT_DATA_PRODUCT_DOMAIN_DATA_PRODUCTS = `${CONTRACT_DATA_PRODUCT}/domaindataproducts`;
export const CONTRACT_DATA_PRODUCT_DOMAIN_DATA_PRODUCT = `${CONTRACT_DATA_PRODUCT_DOMAIN_DATA_PRODUCTS}/:domainId`;
export const CONTRACT_DATA_PRODUCT_RENAME = `${CONTRACT_DATA_PRODUCT}/rename`;

export const CONTRACT_DATA_PRODUCT_SEGMENTS = `${CONTRACT_DATA_PRODUCT}/segments`;
export const CONTRACT_DATA_PRODUCT_SEGMENT = `${CONTRACT_DATA_PRODUCT_SEGMENTS}/:segmentId`;
export const CONTRACT_DATA_PRODUCT_SEGMENT_RENAME = `${CONTRACT_DATA_PRODUCT_SEGMENT}/rename`;

export const CONTRACT_DATA_PRODUCT_DOMAIN_SEGMENTS = `${CONTRACT_DATA_PRODUCT_SEGMENT}/domainsegments`;
export const CONTRACT_DATA_PRODUCT_DOMAIN_SEGMENT = `${CONTRACT_DATA_PRODUCT_DOMAIN_SEGMENTS}/:domainId`;
export const CONTRACT_DATA_PRODUCT_DOMAIN_SEGMENT_CLONE =
    `${CONTRACT_DATA_PRODUCT_DOMAIN_SEGMENT}/clone`;
export const CONTRACT_DATA_PRODUCT_DOMAIN_SEGMENT_RENAME =
    `${CONTRACT_DATA_PRODUCT_DOMAIN_SEGMENT}/rename`;
export const CONTRACT_DATA_PRODUCT_DOMAIN_SEGMENT_SYNC =
    `${CONTRACT_DATA_PRODUCT_DOMAIN_SEGMENT}/synchronizeClients`;

export const CONTRACT_DATA_PRODUCT_DOMAIN_SEGMENT_LOG =
    `${CONTRACT_DATA_PRODUCT_DOMAIN_SEGMENT}/activityLog`;

export const CONTRACT_DATA_PRODUCT_DOMAIN_SEGMENT_CLIENTS =
    `${CONTRACT_DATA_PRODUCT_DOMAIN_SEGMENT}/clients`;
export const CONTRACT_DATA_PRODUCT_DOMAIN_SEGMENT_CLIENT =
    `${CONTRACT_DATA_PRODUCT_DOMAIN_SEGMENT_CLIENTS}/:clientId`;
export const CONTRACT_DATA_PRODUCT_DOMAIN_SEGMENT_CLIENT_USERS =
    `${CONTRACT_DATA_PRODUCT_DOMAIN_SEGMENT_CLIENT}/project/users`;

export const CONTRACT_DOMAINS = `${CONTRACT}/domains`;
export const CONTRACT_DOMAIN = `${CONTRACT_DOMAINS}/:domainId`;
export const CONTRACT_DOMAIN_USERS = `${CONTRACT_DOMAIN}/users`;
export const CONTRACT_DOMAIN_PROJECTS = `${CONTRACT_DOMAIN}/projects`;
export const CONTRACT_DOMAIN_PROJECT = `${CONTRACT_DOMAIN_PROJECTS}/:projectId`;

export const CONTRACT_USERS = `${CONTRACT}/users`;

export const USER_CONTRACTS = `${ROOT}/users/:userId/contracts`;

export const DEPLOY_SEGMENT = `${CONTRACT_DOMAIN}/dataProducts/:dataProductId/segments/:segmentId/deploy`;

// parse params in route string accoring to template
// returns params as plain object
export const parse = (route, template) => {
    const parsedRoute = route.startsWith('http') ?
                            route.match(/^(https?:)\/\/(([^:/?#]*)(?::([0-9]+))?)([/]{0,1}[^?#]*)(\?[^#]*|)(#.*|)$/)[5]
                            : route;

    const values = parsedRoute.split('/');
    const views = template.split('/');

    return views.reduce((result, view, idx) => {
        if (view[0] === ':') {
            return {
                ...result,
                [view.substr(1)]: values[idx]
            };
        }
        return result;
    }, {});
};

export const getSingleQueryString = (key, value) => (Array.isArray(value) ?
    value.map(item => `${encodeURIComponent(key)}=${encodeURIComponent(item)}`).join('&') :
    `${encodeURIComponent(key)}=${encodeURIComponent(value)}`);

// creates a query string from a plain js object
export const queryString = query => (
    query ?
        `?${Object.keys(query).map(k => getSingleQueryString(k, query[k])).join('&')}` :
        ''
);

// interpolates specified parameters from params into
// the specified route string and returns the result
export const interpolate = (route, params, query) =>
    route.split('/').map(view => (view[0] === ':' ? params[view.substr(1)] : view)).join('/') + queryString(query);

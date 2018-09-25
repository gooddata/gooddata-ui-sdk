// (C) 2007-2018 GoodData Corporation
const proxy = require('http-proxy-middleware');
const url = require('url');

module.exports = (app, sdk, { domain }) => {
    app.use('/gdc', proxy({
        target: domain,
        secure: false,
        cookieDomainRewrite: '',
        onProxyReq: (proxyReq) => {
            // see also dev-server proxy at /examples/webpack.config.js

            if (proxyReq.method === 'DELETE' && !proxyReq.getHeader('content-length')) {
                // Only set content-length to zero if not already specified
                proxyReq.setHeader('content-length', '0');
            }

            const domainUrl = url.parse(domain);
            proxyReq.setHeader('host', domainUrl.hostname); // White labeled resources are based on host header
            proxyReq.setHeader('referer', domain);
            proxyReq.setHeader('origin', null);

            // console.log("Proxying ", domain, proxyReq.path, proxyReq.query);
        }
    }));
};

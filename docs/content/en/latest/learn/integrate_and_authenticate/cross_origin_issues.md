---
title: Deal with Cross-Origin Issues
sidebar_label: Deal with Cross-Origin Issues
copyright: (C) 2007-2018 GoodData Corporation
weight: 12
---

This article explains how to deal with cross-origin issues (CORS).

CORS issues occur in the following scenario: your application runs on your local dev machine [https://localhost:3000](https://localhost:3000/) or on your production domain, but you need it to call the GoodData APIs from [https://secure.gooddata.com/gdc/](https://secure.gooddata.com/gdc/).

Modern browsers do not permit this because of the security measure known as the [same-origin-policy](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy).

You have to overcome the CORS restriction before you can develop or deploy your application. To do so, use the following methods:

* Use a proxy (recommended for a local dev machine)
* Enable CORS (recommended for a production domain)

## Use a proxy

You can set up a proxy to bypass the CORS restriction on a local dev machine, because making a cross-origin request from a trusted application is safe. The proxy will make the GoodData API accessible under the same hostname and port as your web application, that is, [https://localhost:3000/gdc/](https://localhost:3000/gdc/).

To set up a proxy, in your project's `/src` directory, create the `setupProxy.js` file with the following content:

```javascript
const proxy = require("http-proxy-middleware");

module.exports = function (app) {
     app.use(proxy("/gdc", {
         "changeOrigin": true,
         "cookieDomainRewrite": "localhost",
         "secure": false,
         "target": "https://secure.gooddata.com",
         "headers": {
             "host": "secure.gooddata.com",
             "origin": null
         },
         "onProxyReq": function(proxyReq, req, res) {
             proxyReq.setHeader("accept-encoding", "identity")
         }
     }));
     app.use(proxy("/*.html", {
         "changeOrigin": true,
         "secure": false,
         "target": "https://secure.gooddata.com"
     }));
     app.use(proxy("/packages/*.{js,css}", {
         "changeOrigin": true,
         "secure": false,
         "target": "https://secure.gooddata.com"
     }));
 };
```

**NOTE:** If you are using Microsoft Edge or Microsoft Explorer browsers on a Windows machine, set `cookieDomainRewrite` to the IP address on which your local web server runs. You can get your IP address from the console output after the server started. For example:

```javascript
"cookieDomainRewrite": "127.0.0.1"
```

The `/gdc` prefix refers to the GoodData APIs as they are hosted under [https://secure.gooddata.com/gdc](https://secure.gooddata.com/gdc). The `"secure: false"` section allows you to set up a proxy against your localhost server that may use a self-signed certificate.

If you want to connect to the [live examples](https://gooddata-examples.herokuapp.com), set all the target properties to ```https://developer.na.gooddata.com```. The ```workspaceId``` of the demo workspace is ```xms7ga4tf3g3nzucd8380o2bev8oeknp```.

In addition, proxying the `/*.html` pages allows you to easily establish a user session by logging in using the GoodData login page \(account.html\) and possibly invoke other GoodData actions that you may need during the development.

## Enable CORS

Setting up CORS allows you to develop and run web applications that can communicate directly with the GoodData APIs.

This section does **not** address authentication. The easiest way to make sure that your API requests to GoodData are authenticated is to be logged into your white-labeled domain in the same browser you are using for your local development.

### Step 1. Get a white-labeled GoodData domain.

By default, you access the GoodData Portal via `https://secure.gooddata.com`. If you white-label the GoodData Portal URL, you can have it at, for example, `https://analytics.example.com`.

In general, a white-labeled domain enables you to remove branding elements from the GoodData Portal and optionally replace them with branding from your enterprise. For more information, see [White Label Your Domain](https://help.gooddata.com/pages/viewpage.action?pageId=86797036).

White-labeling is done by the GoodData Support specialists per request submitted via the [GoodData Support Portal](https://support.gooddata.com/).

You can white-label a [brand new domain](https://help.gooddata.com/pages/viewpage.action?pageId=86797052) or an [existing domain](https://help.gooddata.com/pages/viewpage.action?pageId=86797053).

### Step 2. Configure CORS.

The domains from which you want to enable API calls must be listed as allowed origins for your white-labeled domain.
To make those domains allowed origins, use the [API for adding domains allowed for CORS access](https://help.gooddata.com/doc/enterprise/en/expand-your-gooddata-platform/api-reference#tag/allowed-origins).

* An allowed origin URL must start with `https://` and must end with a top-level domain (such as `.com`, `.org`, and so on).
* You can add a port number to an allowed origin URL (for example, `https://www.example.com:8080`).
* You can use a wildcard (`*`, `**`) to represent a domain of the third and consecutive levels.

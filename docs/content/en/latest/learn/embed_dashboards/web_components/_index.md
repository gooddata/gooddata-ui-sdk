---
title: Web Components
sidebar_label: Web Components
copyright: (C) 2007-2022 GoodData Corporation
id: webcomponents_intro
no_list: true
---

Starting from version 2.2.0, GoodData.CN includes a Web Components library that you can import into your application
to embed dashboards or individual visualizations. The library is also hosted at GoodData Cloud.

The Web Components library is a thin wrapper around the [InsightView](../../visualize_data/insightview/) and [Dashboard](../../../references/dashboard_component/) components. While keeping the embedding easy, it allows a high level of integration with the host application. 

In the simplest form, the integration could look something like this:

```html
<script type="module" src="https://example.gooddata.com/components/my-workspace-id.js?auth=sso"></script>

<gd-dashboard dashboard="my-dashboard-id"></gd-dashboard>
<gd-insight insight="my-visualization-id"></gd-insight>
```

> The **Web Components** library is using **GoodData.UI** under the hood. 
>
>It is loading React and all the necessary dependencies. However, it runs in the isolated scope that will not conflict with other JavaScript running in your app.

## Choosing the right embedding option

GoodData provides several options for embedding, such as **iframe embedding** for dashboards or the  **GoodData.UI React library** for dashboards and visualizations. The Web Components library is the middle ground between those two options. It is more flexible than iframe embedding, yet simpler to integrate comparing to the React library. 

### When to use Web Components library?

* You do not want to use **iframe embedding** to avoid an overhead it creates or due to the security and compliance requirements of your company.
* You want to embed **a single visualization**, but the iframe embedding only works for a complete dashboard.
* You are using **Angular**, **Vue** or any other non-React framework for the host application.
* You are using **a specific version of React** in your application, that is not compatible with GoodData.UI.

### When to use an iframe instead?

If you want the simplest possible dashboard embedding and do not require deep integration between the host application
and the dashboard, consider using iframe instead of Web Components.

Iframe can also be a good option if you want to use Dashboard plugins, as the `gd-dashboard` elements does not support
plugins at the moment.

### When to use GoodData.UI React library instead? 

If the host application is already written in React, consider using GoodData.UI instead of Web Components. It is more
flexible and provides a much better developer experience. You also avoid loading two instances of React and ReactDOM.

## Integration

### Load the library

To integrate the library into your app, add a script tag with the correct URL to the `<head>`
section of your web page.

```html
<script type="module" src="https://{your-gd-server-url}/components/{workspace-id}.js?auth=sso"></script>

<!-- for example -->
<script type="module" src="https://example.gooddata.com/components/my-workspace.js?auth=sso"></script>
```

The script **must be** of the type `module`, as we are using JavaScript modules for this distribution.

The library will parse its own URL to pre-configure and allow you to skip the boilerplate code:
* The domain name `{your-gd-server-url}` must be the domain of your GoodData Cloud or GoodData.CN instance.
  This is the domain where the script will be loaded from as well as the domain that will be used to load your visualization and dashboard data. You cannot load the script from one instance to use it with data from another instance.
  **At the moment it's not possible to connect to multiple GoodData instances from a single runtime.**
* The `{workspace-id}` is the ID of the default workspace from where the library will be loading your visualizations and dashboards.
  It is possible to override this value for a specific visualization or dashboard.

### Embed visualizations and dashboards

Once the library is loaded to the application runtime, it will register two custom elements that you can use anywhere
on the page:

* `<gd-dashboard />` for [dashboard embedding](../embed_dashboards/).
* `<gd-insight />` for [visualization embedding](../embed_insights/).

## Prerequisites and limitations

### Supported web browsers

Since Web Components is a relatively new technology, the library will not work in older browsers, such as
**Internet Explorer**. For details, refer to the
<a href="https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry#browser_compatibility" target="_blank" rel="noopener noreferrer">Custom Elements</a> browser compatibility sections on MDN.

### Cross-Origin Resource Sharing (CORS) configuration 

You will also need to set up a **CORS configuration** on the GoodData server instance to allow the script from your application
domain to make network requests to the GoodData server.

### Content Security Policy (CSP) configuration

You might need to adjust the <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP" target="_blank" rel="noopener noreferrer">CSP</a> headers of your server, if you are using this technology.
Specifically, you will need to add `script-src`, `style-src`, `font-src` and `img-src` policies for the GoodData host.

For example, if your GoodData server is hosted at `example.gooddata.com`, the CSP policy could look something like this:
```
script-src 'self' 'unsafe-inline' 'unsafe-eval' example.gooddata.com;
img-src 'self' data: blob: example.gooddata.com;
style-src 'self' 'unsafe-inline' example.gooddata.com;
font-src 'self' data: example.gooddata.com;
```

### Third party cookies blocking

Some browsers might block 3rd party cookies when JavaScript is making a network request to another site. This is
a privacy feature that was designed to prevent a cross-site user tracking. However, it also affects some legitimate
cases when 3rd party cookies should be used, namely authentication. In our case, the WebComponents script needs
to make authenticated requests to the GoodData server to fetch the data. If GoodData cookies are blocked by
the browser, such requests will fail even if user session was established correctly.

To prevent this, your GoodData server instance should be available on the same site as your host application.
For example, if your app lives at `https://yourcompany.com`, you could make GoodData server available on a subdomain,
like `https://analytics.yourcompany.com`.

### Dashboard plugins support

At the moment, Dashboard plugins will not be loaded when embedding with `gd-dashboard` custom element. If you
need to use plugins, consider embedding your dashboard with an iframe or a React component.

### CSS class names collisions

WebComponents script will inject a CSS `<link>` to the `<head>` of your HTML page upon load. While unlikely, it is
possible that CSS class names may collide with the class names used by your own code. If this happens, please consider
<a target="_blank" href="https://github.com/gooddata/gooddata-ui-sdk/issues/new" rel="noopener noreferrer">opening a GitHub issue</a>.

[3]:https://www.gooddata.com/docs/cloud/manage-organization/set-up-cors-for-organization/
[4]:https://www.gooddata.com/docs/cloud/manage-deployment/set-up-organizations/set-up-cors-for-organization/
[10]:https://www.gooddata.com/docs/cloud/embed-visualizations/iframes/
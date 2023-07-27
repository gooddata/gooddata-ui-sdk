---
title: Platform Authentication and Single Sign-On (SSO)
linkTitle: Platform Authentication and SSO
copyright: (C) 2007-2018 GoodData Corporation
weight: 29
---

> This arcticle is for [GoodData Platform](https://help.gooddata.com/doc/enterprise/en/expand-your-gooddata-platform/gooddata-platform-overview/) only.

Depending on whether SSO is implemented on your site, you can use one of the following to authenticate your users:
* GoodData login page and registration page
* GoodData SSO process

## Prerequisites
Before you start, verify that your site meets the following requirements:
* Cross-Origin Resource Sharing (CORS) is set up. The URL where your analytical application runs is whitelisted in the CORS settings.

    If CORS is not set up, [enable it](../cross_origin_issues/) on your site.
* All your users have a GoodData account and have access to your GoodData workspace.

    If some users do not have a GoodData account or do not have access to the workspace, see [Grant users access to your workspace](#grant-users-access-to-your-workspace).

## Implementing authentication
Choose the use case depending on whether SSO is implemented on your site.

### SSO is implemented on your site
GoodData supports SAML 2.0-based and PGP-based authentication. For more information, see [Single Sign-On Overview](https://help.gooddata.com/pages/viewpage.action?pageId=34341409).

Setting up authentication depends on what type of SSO is implemented on your site.

* If you use the [GoodData PGP SSO](https://help.gooddata.com/pages/viewpage.action?pageId=34341459) implementation, you can use the `loginSSO` method from [`@gooddata/api-client-bear`](https://github.com/gooddata/gooddata-ui-sdk/tree/master/libs/api-client-bear). Note that although this method requires a mandatory parameter of `targetUrl`, this parameter is used very rarely in the context of GoodData.UI, because in a typical scenario there is no need to redirect a user to any GoodData URL. But as this parameter is mandatory, set it to `/gdc/account/token`.

    ```javascript
    import { factory } from "@gooddata/api-client-bear";

    const domain = "https://my.app.com/";
    const sdk = factory({ domain });
    const encryptedClaims = "your-generated-encrypted-claims";
    const ssoProvider = "your-sso-provider-name";
    const targetUrl = "/gdc/account/token"; // keep this URL set to /gdc/account/token

    sdk.user
      .loginSso(encryptedClaims, ssoProvider, targetUrl)
      .then(() => {
        // now you are logged in, and calls to GoodData will be authorized
      })
      .catch(error => {
        // something went wrong, see the browser console for details
        console.error(error);
      });
    ```

* If you use a [SAML SSO](https://help.gooddata.com/pages/viewpage.action?pageId=34341408) implementation with the **Service Provider-initiated** scenario, obtain the value of the `loginUrl` parameter from `/gdc/account/samlrequest` and use this URL to get logged in.

    `/gdc/account/samlrequest` also contains the `relayState` parameter that should point to the URL where your application runs (the page where the user is redirected after a successful login).

    ```json
    {
      "samlRequests": {
        "items": [ {
          "samlRequest": {
            "loginUrl": "https://yourIdentityProvider.com/pathToSAMLResource?SAMLRequest=encodedMessage&RelayState=https%3A%2F%2FyourRelayState.com",
            "ssoProvider": "yourSsoProvider.com"
          }
        } ]
      }
    }
    ```

    The following is an example of login code:

    ```javascript
    import sdk from "@gooddata/api-client-bear";

    const relayState = "https://my.app.com/";

    sdk.user
      .initiateSamlSso(relayState)
      .catch(error => {
        // something went wrong, see the browser console for details
        console.error(error);
      });
    ```

    **NOTE:** Service Provider-initiated SSO cannot be used if you are using a development proxy due to proxy limitations.

* If you use a [SAML SSO](https://help.gooddata.com/pages/viewpage.action?pageId=34341408) implementation with the **Identity Provider-initiated** scenario, make sure that login is done via your Identity Provider (Okta, Auth0 and so on) and the login code in your app queries the Identity Provider’s API.

### SSO is not implemented on your site
You do not have to perform any steps for authentication to start working. It is automatically enabled as long as the [prerequisites](#prerequisites) are met.

This is how authentication process works:
1. The user goes to the URL where your analytical application runs. For example:

    `https://my.app.com/`
2. Your application verifies whether the user is logged in. For example:

    ```javascript
    import { factory } from "@gooddata/api-client-bear";

    const domain = "https://my.app.com/";
    const sdk = factory({ domain });

    sdk.user.isLoggedIn().then((isLogged) => {
      if (isLogged) {
        // write your own application logic for logged-in users here
      } else {
        // redirect to the login page providing the URL to redirect to upon a successful login
        window.location.replace(`${domain}/account.html?lastUrl=${encodeURIComponent(window.location)}`);
      }
    });
    ```
      **NOTE:** If you want to pass multiple arguments in `lastUrl`, protect them by using `encodeURIComponent`.
3. If the user is not logged in, the application redirects the user to the GoodData login page (white-labeled with your domain name) with the appended `lastUrl` parameter that points to the URL where your analytical application runs:

    `https://my.company.com/account.html?lastUrl=https://my.app.com/`
4. The user logs in to the GoodData Portal.
5. If authentication is successful, the GoodData Portal redirects the user back to the URL where your analytical application runs:

    `https://my.app.com/`

### Grant users access to your workspace
For authentication to work correctly, all users of your application must have a GoodData account and be able to access your GoodData workspace.

If some users do not have a GoodData account or do not have access to your workspace, you have to invite them to your workspace and make sure that the users with no GoodData account create one.

To do so, follow these steps:
1. Customize the link in the invitation email: set the `invitationWelcomePage` platform setting to the URL where your application runs. For example:

    `"invitationWelcomePage": "https://my.app.com"`

    For more information, see [Configure Various Features via Platform Settings](https://help.gooddata.com/pages/viewpage.action?pageId=35361159) and the [API for updating the platform settings](https://help.gooddata.com/display/doc/API+Reference#/reference/hierarchical-configuration).
2. Invite the users to your GoodData workspace via the [GoodData Portal](https://help.gooddata.com/pages/viewpage.action?pageId=34341504).

    The link in the invitation email will redirect an invited user to the URL where your application runs. The users with no GoodData account will additionally be asked to  create a GoodData account.

---
title: "Integrate and Authenticate"
linkTitle: "Integrate and Authenticate"
icon: "integration.svg"
weight: 10
no_list: true
---

Before you start using the GoodData.UI in your application, you will first need to authenticate and integrate it into your application.

The whole process essentially boils down to five steps:

1. Installing the necessary dependencies for your target platform and components.
2. Importing CSS files to include styles.
3. Integrating Analytical Backend into your app with React contexts.
4. Addressing Cross-Origin Resource Sharing (CORS) by configuring settings or using prepared configurations.
5. [Configuring authentication](./cn_and_cloud_authentication/) to handle authenticated sessions with GoodData.

For detailed instructions, read the [Integrate into an Existing Application](./cn_and_cloud_integration/) article.

You might be interested in:

-   How to [authenticate to GoodData.CN and Cloud](./cn_and_cloud_authentication/)
-   How to deal with [Cross origin issues](./cross_origin_issues/)

### GoodData.CN and Cloud authentication

The [GoodData.CN](https://www.gooddata.com/docs/cloud-native/) and [GoodData Cloud](https://www.gooddata.com/docs/cloud/) authentication process uses API Token authentication for CLI applications and context deferred authentication or [JWT authentication](https://jwt.io/introduction) for UI applications. API Token authentication is suitable for development and CLI applications, but not recommended for UI applications due to security concerns.

Context deferred authentication is designed for use with SSO providers in UI applications and resolves authentication exceptions accordingly. Functions like `createTigerAuthenticationUrl`, `createTigerDeauthenticationUrl`, and `redirectToTigerAuthentication` are provided to assist in the authentication process.

If your UI application runs in a Federated Identity Management context, you can use the `createRedirectToTigerAuthenticationWithParams` function to generate a `redirectToTigerAuthentication` handler parametrized by the current user's identity provider ID.

For further details, please refer to the [GoodData.CN and Cloud Authentication](./cn_and_cloud_authentication/) article.

### Cross origin issues

Two recommended methods when dealing with Cross-Origin Resource Sharing (CORS):

1. Use a proxy for a local dev machine.
2. Enable CORS for a production domain.

To use a proxy, create and configure a `setupProxy.js` file in your project's `/src` directory. This method bypasses CORS restrictions for a trusted application on a local dev machine.

To enable CORS, you will need to get a [white-labeled GoodData domain](https://www.gooddata.com/docs/cloud/customize-appearance/white-label-your-organization/) and configure CORS by listing the domains from which you want to enable API calls as allowed origins. Configure allowed origins using the API for adding domains allowed for CORS access.

To learn more about dealing with cross-origin issues, read the [Deal with Cross-Origin Issues](./cross_origin_issues/) article.

### Set Up Authentication and Single Sign-On (SSO)

To authenticate users for your analytical application, you can either use the GoodData login and registration page or implement the GoodData SSO process. Ensure that your site meets the necessary prerequisites, such as setting up Cross-Origin Resource Sharing (CORS) and verifying that all users have a GoodData account with access to your workspace.

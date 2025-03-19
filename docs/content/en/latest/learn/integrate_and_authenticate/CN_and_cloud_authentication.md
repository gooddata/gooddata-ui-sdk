---
title: GoodData.CN and Cloud Authentication
linkTitle: GoodData.CN and Cloud Authentication
copyright: (C) 2007-2018 GoodData Corporation
weight: 13
---

**GoodData Cloud** and **GoodData.CN** authentication uses an API Token or JWT as a bearer of authentication or context deferred authentication.

## API Token authentication

It's meant to be used in GoodData Cloud and GoodData.CN CLI applications and it's also useful during development.
Even though it is possible to use this type of authentication in the UI applications, it can lead to some security issues, such as exposing
unintentionally your token to someone else. We strongly recommend to use [context deferred authentication](#context-deferred-authentication)
or [JWT authentication](#jwt-authentication) for UI applications.

To create and manage your tokens, navigate to `<your-gooddata-cn-domain>/tokens`.

## Context deferred authentication

This type of authentication expects that the authentication process is being already resolved, e.g. through any SSO provider.

It's meant to be used in GoodData Cloud and GoodData.CN UI applications.

There are limitations that such application must take care of:

You must expect that some backend calls can result into a **NotAuthenticated exception**

-   This exception contains a `loginUrl` for the current origin, which leads to the login page
-   The application must redirect the entire window to this URL appended with `redirectTo` query parameter.
-   The value of this parameter is the application's URL that will be used as a return location.
-   The login page will start and drive the `OIDC` authentication flow. Once the flow finishes and session is set up, the login page will redirect back to the application.

The Context deferred provider allows you to handle the **NotAuthenticated exception** with the custom `NotAuthenticatedHandler` property. This custom handler is
called whenever the **NotAuthenticated exception** is raised by the backend.

> The **NotAuthenticatedHandler** can be called multiple times and it is a good practice to wrap it in a call guard or debounce.

```typescript
    // import a debounce function from any library or create your own
    import debounce from "lodash/debounce";

    ...

    // this custom NotAuthenticatedHandler will wait for 500 milliseconds before resolving thrown NotAuthenticated exception
    const customNotAuthenticatedHandler = debounce((context: IAuthenticationContext, error: NotAuthenticated) => {
        // handle the NotAuthenticated exception
    }, 500);
```

## JWT authentication

This type of authentication uses JWT (JSON Web Token) as bearer of authentication. Unlike an API Token, JWT has an expiration period.

You can read more about it at the [RFC 7519](https://datatracker.ietf.org/doc/html/rfc7519) page or [here](https://jwt.io/introduction).

You can read [help page](https://www.gooddata.com/docs/cloud/manage-organization/jwt-access-token/) that will guide you
through the process of generating JWK (JSON Web Key) and registering it in your organization. It covers the generation of JWT as well.
The guide uses GoodData Python SDK. Alternatively, you can follow [JavaScript guide](https://www.gooddata.com/docs/cloud/manage-organization/jwt-access-token/jwt-javascript-example/)
to achieve the same via a Node.JS script.

It's meant to be used in GoodData Cloud and GoodData.CN UI applications.

The example of how to set up the `AnalyticalBackend` instance with `TigerJwtAuthProvider` authentication provider:

```typescript
import debounce from "lodash/debounce";
import tigerFactory, { TigerJwtAuthProvider, SetJwtCallback } from "@gooddata/sdk-backend-tiger";
import { NotAuthenticated, IAuthenticationContext } from "@gooddata/sdk-backend-spi";

const jwt = fetchNewJwt(); // initial JWT that you generated or obtained for the authenticated user from the secure source
const notAuthenticatedHandler = debounce((context: IAuthenticationContext, error: NotAuthenticated) => {
    // handle the NotAuthenticated exception
}, 500);
const jwtIsAboutToExpire = (setJwt: SetJwtCallback) => {
    const jwt = fetchNewJwt(); // new JWT generated or obtained for the authenticated user if the current session should continue
    setJwt(jwt); // set the JWT back into authentication provider via provided callback
};
const secondsBeforeTokenExpirationToCallReminder = 60;

// Setup JWT auth provider.
const jwtAuthProvider = new TigerJwtAuthProvider(
    jwt, // initial JWT
    notAuthenticatedHandler, // See context deferred authentication above about this optional handler argument. Optional argument.
    jwtIsAboutToExpire, // Optional custom `(setJwt: SetJwtCallback) => void` callback called right before the JWT is about to expire.
    secondsBeforeTokenExpirationToCallReminder, // The number of seconds before token expiration to call tokenIsAboutToExpireHandler handler, optional, use 0 or negative number to disable the callback.
);

// Reference to a function that can be used to update authentication provider with new JWT before the previous one expires.
// Alternatively, use callback returned to jwtIsAboutToExpire handler, if you provided it during authentication provider construction.
const setJwtHandler = jwtAuthProvider.updateJwt;

// Create a new AnalyticalBackend instance
const backend = tigerFactory(undefined, {
    packageName: "my-app",
    packageVersion: "my-app-version",
}).withAuthentication(jwtAuthProvider);
```

## Functions related to authentication

Below is a list of functions that help simplify the authentication process.

### createTigerAuthenticationUrl

Takes the Analytical backend, authentication flow and the location (URL) and creates a URL where the
browser will redirect to start authentication process (logging in).

The location is essential to determine where the URL should point:

-   When running on same origin, then use relative path
-   When running on different origin, then use absolute path

**Note:** you can also provide additional parameters which will be added to the generated URL

### createTigerDeauthenticationUrl

Takes the Analytical Backend instance and the location (URL) and creates a URL where the browser will
redirect to start de-authentication process (logging off).

The location is essential to determine where the URL should point:

-   When running on same origin, then use relative path
-   When running on different origin, then use absolute path to the proper origin

### redirectToTigerAuthentication

Given authentication context and the authentication error, this implementation of `NotAuthenticatedHandler` redirects the current window to the Tiger authentication flow when an authentication error occurs.

See [createTigerAuthenticationUrl](#createtigerauthenticationurl) if you want to create your own `NotAuthenticatedHandler`.

### createRedirectToTigerAuthenticationWithParams

A factory function for creating a custom `NotAuthenticatedHandler` with additional parameters, such as `externalProviderId`. It is useful when running in a Federated Identity Management context.

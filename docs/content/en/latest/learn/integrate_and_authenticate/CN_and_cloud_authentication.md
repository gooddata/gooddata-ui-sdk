---
title: GoodData.CN and Cloud Authentication
linkTitle: GoodData.CN and Cloud Authentication
copyright: (C) 2007-2018 GoodData Corporation
weight: 13
---

**GoodData Cloud** and **GoodData.CN** authentication uses an API Token as a bearer of authentication or context deferred authentication.

## API Token authentication

It's meant to be used in GoodData Cloud and GoodData.CN CLI applications and it's also useful during development.
Even though it is possible to use this type of authentication in the UI applications, it can lead to some security issues, such as exposing
unintentionally your token to someone else. We strongly recommend to use [context deferred authentication](#context-deferred-authentication)
for UI applications.

To create and manage your tokens, navigate to `<your-gooddata-cn-domain>/tokens`.

## Context deferred authentication

This type of authentication expects that the authentication process is being already resolved, e.g. through any SSO provider.

It's meant to be used in GoodData Cloud and GoodData.CN UI applications.

There are limitations that such application must take care of:

You must expect that some backend calls can result into a **NotAuthenticated exception**

  - This exception contains a `loginUrl` for the current origin, which leads to the login page
  - The application must redirect the entire window to this URL appended with `redirectTo` query parameter.
  - The value of this parameter is the application's URL that will be used as a return location.
  - The login page will start and drive the `OIDC` authentication flow. Once the flow finishes and session is set up, the login page will redirect back to the application.

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

## Functions related to authentication
Below are some functions, that will make the authentication process easier for you.

### createTigerAuthenticationUrl
Takes the Analytical backend, authentication flow and the location (URL) and creates a URL where the
browser will redirect to start authentication process (logging in).

The location is essential to determine where the URL should point:

 -  When running on same origin, then use relative path
 -  When running on different origin, then use absolute path

### createTigerDeauthenticationUrl
Takes the Analytical Backend instance and the location (URL) and creates a URL where the browser will
redirect to start de-authentication process (logging off).

The location is essential to determine where the URL should point:

-  When running on same origin, then use relative path
-  When running on different origin, then use absolute path to the proper origin

### redirectToTigerAuthentication
Given authentication context and the authentication error, this implementation of `NotAuthenticatedHandler`  will redirect current
window to location where Tiger authentication flow will start.

See [createTigerAuthenticationUrl](#createtigerauthenticationurl) if you want to create your own `NotAuthenticatedHandler`.
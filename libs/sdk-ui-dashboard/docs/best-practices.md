# Best practices when developing the Dashboard component

Even though the Dashboard component aims to do very similar things to the original gdc-dashboards application,
the means we use to do so are significantly different.
This document describes the best practices to follow when contributing to this package.

## Prerequisites

Before continuing, read the [Dashboard Component Software Design](./design.md) document if you haven't already.

## Changing the data in the store

There are two ways of making changes to the data in the Redux store:

-   dispatching a command
-   dispatching an action

Dispatching a command is the recommended way to do this: it ensures all the validations, side effects and so on
are processed correctly.
Dispatching an action is a more low level operation that manipulates a particular part of the store, there
are no validation, no other side effects, nothing.

Generally speaking, you should only use commands from outside of the `/model` folder (the only exception
is the UI slice described below).

## UI slice

To make certain types of components easier to write, we created the `/model/store/ui` slice. It stores information
without _any business logic_ behind it like "This dialog is open", "There is a placeholder active", etc.

This was done so that we would not have to have some ad-hoc contexts for things like that (we already have a "global"
redux context in place, might as well use it).

Only the UI components and hooks are allowed to touch this slice, both read from it and write to it.
No command handler should touch this slice: neither read from it or write to it. If you find yourself in a situation
when a command handler needs to touch this slice, it means there is something with business logic attached to it
in there and so it should not be in the UI slice.
Similarly, no other selector in the `/model/store` space should touch the UI slice, doing so would again indicate
there is some business logic in the UI slice and it should be moved.

Writing to this slice is done by dispatching its actions exported as `uiActions` from the `/model` module
and is the only exception to the "Always prefer commands" rule mentioned above.

We will eventually make these actions public so that even plugins can take advantage of them.

### I need to run a command and then change the UI slice. What should I do?

Use the `useDashboardCommandProcessing` hook and dispatch the UI slice actions you need in the `onSuccess` and
`onError` callbacks. This might seem strange at first, but it makes sense when you think about it: what should
happen on the UI after some command is run is UI concern only -> it is defined in a component or a hook, not
in some saga or reducer.

## Loading data from the backend

When you need to load some data for your component/hook from the backend (except executions), you might be tempted
to just use the `useBackend` hook and call it directly. While this will work and is not inherently wrong,
often, a better solution is to write a Query for this. That way the results are

-   cached automatically between Query runs improving performance for repeated queries for the same items
-   reusable from anywhere in the component

To make using the Query simpler in your component/hook, there is the `useDashboardQueryProcessing` hook.

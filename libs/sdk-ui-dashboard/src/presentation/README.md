# Presentation components

This part of the package contains all the components used to render the Dashboard.
Since the components are designed to be as customizable as possible, here is a brief description of the design
and the rationale behind it as well as some conventions to make things consistent.

## File structure and modules

To keep things organized and help us keep the code base as easy to navigate as possible, there are some rules regarding the file structure in this directory.

-   The presentation part of library is organized in modules. These are represented as top-level folders in the `presentation` folder.

-   The API of each module is defined by two files:

    -   `index.ts` - this file exports everything other modules can interact with (both code and types)
    -   `types.ts` - to avoid certain cyclic dependencies caused by type-only imports, this file exports all the types from the module. This file exists for specific cases, prefer importing from the `index.ts` if possible

-   To help enforcing the above rules, every module must have its allowed dependencies specified in the dependency-cruiser file.These should be as minimal as possible.

## Customization API

To allow users to customize as much of the presentation as possible as easily as possible, a contexts based API is used.
The API has two main types of contexts: dashboard-global and component-type-specific.

### Global contexts

There are two contexts shared across the whole Dashboard component:

-   DashboardComponentsContext – this context stores information about which components should be used to render particular parts of the Dashboard. They can be overridden by the user defined components that use the component-type-specific contexts to obtain their props (see [Component-type-specific contexts](#component-type-specific-contexts) for more info).
-   DashboardConfigContext – this context stores custom configuration overrides aimed at making certain configuration possible without providing custom components (see [Hook parameters](#hook-parameters) for more info).

### Component-type-specific contexts

To make creating the custom components as easy for the end user as possible, we chose to go with a context+hook based API for the components.
The reason here is ease of use: the custom components does not take any props, instead it uses a well-known hook to get all the properties the default component gets
and then can use Object destructuring to pick and choose the properties in wants to support.
That way, we don't force the custom components to implement the full API of the default implementations.

### Module file structure

To keep things consistent across the components, there is a fixed file structure and naming schema for the individual components.
Let's take MenuButton as an example for the following section. The structure is as follows:

```
menuButton
 ┣ DefaultMenuButton.tsx
 ┣ HiddenMenuButton.tsx
 ┣ MenuButton.tsx
 ┣ MenuButtonPropsContext.tsx
 ┣ index.tsx
 ┗ types.ts
```

-   MenuButtonPropsContext – this file contains a special context for specifying props of the Menu button implementations. It also provides a provider component `MenuButtonPropsProvider` a hook for consuming the context `useMenuButtonProps`. Only he hook is part of the public API.
-   DefaultMenuButton – this file (or folder for more complicated modules with implementation that needs to be split into several files) contains two components
    -   `DefaultMenuButtonInner` - this component is the default implementation of the Menu button. It does not take any props, instead, it uses the `useMenuButtonProps` hook to obtain the props.
    -   `DefaultMenuButton` - this component is a wrapper around `DefaultMenuButtonInner` that takes the same props as the props context and returns `DefaultMenuButtonInner` wrapped with the `MenuButtonPropsProvider` with the props set there. This component is part of the public API. The reason for this wrapping is end user DX: they just call a "normal" component and do not have to mess around with some context (which we do not want to expose anyway).
-   HiddenMenuButton – this file contains a simple stub of a component that returns null, effectively disabling the Menu button entirely. The reason behind this is again end user DX: they can just use a well named component to show their intent of hiding the menu button (it will also show explicitly in the dev tools which is helpful for debugging). This component is part of the public API.
-   MenuButton – this component does only one thing: it takes the appropriate value from the `DashboardComponentsContext` for the Menu button and renders it. This is for our convenience (so that the components rendering Menu button do not have to mess around with the `DashboardComponentsContext` unnecessarily).
-   types – this file contains all the necessary types for the Menu button: props and component types.
-   index – a barrel file exporting everything that should be exported.

So to summarize, the public API of the module consists of these:

-   DefaultMenuButton
-   useMenuButtonProps
-   CustomMenuButtonComponent - named alias for React.ComponentType, this is to keep intents clearer
-   any types needed by the above

For internal use, the module also needs to export:

-   DefaultMenuButtonInner
-   MenuButtonPropsProvider
-   any types needed by the above

### Hook parameters

Attentive reader might notice that the `useMenuButtonProps` has an optional parameter. This is another (optional) layer of DX convenience.
Some hooks may provide parameters that customize the props resulting from them. Using the `useMenuButtonProps` example,
it provides declarative way of adding or overriding the menu items without having to manually manipulate some array.
This configuration is also exposed as an optional prop of the main Dashboard component for additional ease of use for the users
and the value is passed to the `DashboardConfigContext` the value of which the hook must also take into account if it provides the configuration parameter.
The rule here is that parameter passed directly into the hook (presumably in some custom component implementation) takes precedence over the value in the `DashboardConfigContext`.

### Context merging/inheritance

To make things more transparent and easy to use, the component-type-specific context providers must try to obtain data from a context of the same type that might be specified up the component tree.
So for example `MenuButtonPropsProvider` must use the `useMenuButtonProps` hook to get values from a potential parent context and merge them with its own props using a shallow `...` "merge", not lodash merge: that would break stuff in the most cryptic ways, trust me, been there, done that.

In addition to this "same type parent" merging, certain context hooks might also choose to look for different types of parents where it makes semantic sense.
For example, `useDashboardInsightProps` hook looks not only for `DashboardInsightPropsContext` but also for `DashboardWidgetPropsContext` as Insight is a specialization of widget and it makes sense for it to also respect widget-level configuration.

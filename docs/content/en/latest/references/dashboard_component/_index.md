---
title: "Dashboard Component"
linkTitle: "Dashboard Component"
weight: 50
no_list: true
---
The Dashboard component is a React component with a rich (and fairly large) API through which you can both access the core dashboard functionality and extend the component with custom functionality.

The Dashboard component is the largest and most complex component in GoodData.UI with a lot of domain logic contained in it. Internally, the Dashboard component is built using an architecture resembling the Model-View-Controller pattern:

The Model part is implemented with `Redux` and `Redux-Saga`. The Model part exposes rich APIs:
- selectors to get data from the component's state
- events to describe changes
- interactions with the dashboard
- commands to trigger changes.

The `View` and `Controller` parts are implemented using React components and hooks. The top-level `Dashboard` component also has rich APIs:
- props to specify a dashboard to render
- configuration for rendering
- customization of almost all view components used on a dashboard
- integration with the eventing.

It also supports a full drag-and-drop experience for creating and editing existing dashboards.
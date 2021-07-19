# Dashboard Component

The dashboard component is responsible for rendering a dashboard. Its design aims at extendability and
possibility to customize the dashboard look and feel.

The intended design to achieve is stands on several pillars:

1.  The component allows to modify all presentational components that make up a dashboard. Clear interfaces are set
    up for all presentational components. The interfaces are specified by the respective components **props**.

2.  The default implementations of the dashboard components are themselves also customizable. This way third party
    does not have to reimplement the entire component in order to achieve some types of customizations (adding buttons,
    changing how particular filter looks, hiding some filter etc). The default implementations specify **props**
    to allow customization.

3.  The component exposes additional APIs to interact with the dashboard. These APIs are suitable to implement
    custom interactions:

    -   Command API - commands implement dashboard logic and different features (load/reload dashboard, change
        filter)
    -   Event API - everything that happens in the dashboard is communicated by emitting events

    -   Data access API - selectors can be used to read any part of the dashboard state.

## Software Design

Dashboard component is stateful and will likely grow to be a fairly complex component. To keep things organized and
ready for controlled growth, the setup is as follows:

-   Dashboard component uses redux (and redux toolkit) to manage the state. The redux-sagas are used to implement
    complex logic related to command handling. Each dashboard component has its own store.

-   The state stored in redux is limited to hold the essential data needed to render the Dashboard (filter context,
    layout etc). The state exposes two APIs:

    -   an internal API containing actions to trigger state reducers
    -   a public API containing selectors into the state

    The data types stored in the state are those that are defined on the @gooddata/sdk-backend-spi: IDashboard, IFilterContext,
    IDashboardLayout etc. The data obtained from analytical backend is stored in state as-is.

-   Commands are redux actions with a clear action type naming convention. They always start with `GDC.DASH/CMD.` and are followed
    by some meaningful command name.
-   Commands are created for all dashboard logic that should be publicly available

-   Command handlers are used to process commands dispatched to the store. Command processing is serialized. There
    is a single, root command handler saga which works with an action channel buffering the commands. The handler
    takes command-by-command and sends it to respective command's handler.
-   As command handlers do their work, they will be triggering reducer actions and emitting events (from events API)
    describing what is going on.
-   Reducer actions are _always_ dispatched only from command handlers. Components never dispatch reducer actions
    directly. The reason behind this is that reducers are quite low-level functions that are responsible for different
    parts of the state - there will likely be a lot of reducers going forward, and their invalid use can lead to serious
    breakage.

    The components (either ours or third party) must never care about the low-level stuff, they need a safe, curated
    API to work with.

-   The contract between Dashboard and its different sub-components is always specified on the props level. All
    data, callbacks and so on always come through props. This is important to simplify extensions / customizations:

    -   Custom component MUST satisfy contract described on the props => easy, business as usual stuff
    -   Custom component MAY want to do extra stuff. For this, it can use the selector API to get the extra data
        about the dashboard or use command API to trigger some dashboard actions.

-   Events are emitted during command processing to indicate either progress or end result of command processing. Events
    are modeled as redux actions. They always start with `GDC.DASH/EVT.`

    By convention events are named always with past tense verb - this is because they describe what has already happened.

-   There is a centralized event emitter. This sets up an action channel for all events and dispatches the events
    to the registered event handlers.

For design notes specific to the presentation side of things, see the README in the src/presentation folder.

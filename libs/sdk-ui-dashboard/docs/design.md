# Dashboard Component Software Design

To understand motivation behind the current design of the component, it is essential to know what qualities and abilities
are desired for the component itself - these are driven primarily by the goal to have extendable dashboards.

The component must be:

-   Externally customizable & extendable

    Clients must be able to comfortably customize, add new or completely customize existing presentation components. It
    is expected that client's custom presentational components will need to interact with the dashboard or other parts of
    the dashboard.

-   Observable

    Client's custom presentational components must know what is happening in the dashboard and must know how user
    interacts with the dashboard. It is expected that client's custom extensions will process this information and
    that client's custom presentational components will react to them.

-   Predictable

    Developer building potentially complex extensions on top of the complex component must do so painlessly.
    Apart from documented APIs and code-to-code interaction patterns, the component must strive to provide predictable
    experience on top of them. No awkward errors, no racy behavior, no unexpected side-effects.

-   Maintainable

    On one hand, developers will build potentially complex extensions on top of the dashboard. On the other hand
    we have to keep enhancing and maintaining the component in a way where we eliminate or greatly minimize the risk
    of breakage between component versions.

## Cornerstone design decisions

The 'big' design decisions we have done while creating the component are these:

-   Component follows the Model-View-Controller pattern

    -   The Model concentrates all the dashboard's domain logic
    -   The presentational React components form the View part
    -   The controller React components form the Controller part

-   Model uses opinionated design on top of Redux and Redux Sagas in order to implement domain logic in a way
    that it can be reasonably and in a controlled fashion exposed to client code.

    The model design takes some inspiration from the CQRS. A big part of the model wraps around actions that the
    client code may dispatch to get job done. The model divides these actions into two categories:

    -   **Commands** are used to trigger any change (write operation) on the dashboard. Commands encapsulate potentially
        complex domain logic.

    -   **Queries** are used to trigger potentially complex read-only domain logic. Such logic typically needs to work
        in the context of the dashboard, use multiple parts of its state, perform calculations and interact with the
        analytical backend to get the job done.

    Additionally the model also uses the **Events**. These are again actions that describe what has happened in the
    dashboard or during command processing.

    Apart from this, the model also provides **Selectors** that can be used to synchronously query data to render
    in the presentational components.

-   The controller and view components can be completely replaced by the client code. Default implementations of
    top-level components further allow customization or even complete replacement of their sub-components.

## Model Design Details

The opinionated design of the model is primarily in place to satisfy and enable the goals we set for the dashboard
component however as a convenient side effect it also helps us to enhance the component in a controlled and
easy-to-reason-about manner.

The component uses Redux, Redux Toolkit and Redux Sagas as follows:

-   Redux state is sliced around data that makes up a dashboard; the data coming as prescribed by the sdk-backend-spi
    is stored in the state without major transformations.
-   Redux reducers are 'dumb' and have fine granularity. They are essentially setters and modifiers of the data
-   Redux sagas are used to handle Commands and Queries and to dispatch Events:
    -   Commands are picked from a command channel by the root command handler saga which then **calls** commands concrete
        command handlers.
    -   Queries are picked from query channel by the root query processor saga which then **spawns** concrete query processors.
    -   Events to emit to registered event handlers are picked from event channel by the root event emitter saga which
        **calls** the event handlers
-   Selectors expose dashboard data and different aggregations and views of the data
-   There is an emphasis to keep essential heavy-lifting logic used by the dashboard in SDK packages that that
    are responsible for the particular 'sub domain'. E.g. complex manipulations of the date filter config and the
    options for the date filters belongs to `sdk-ui-filters` as that is where all the essential data types live.

In this design, all the domain logic is implemented and exposed in command handlers, query processors and selectors.
The redux state and its reducers are 'relegated' to a technical detail of how the data is stored an manipulated.

The 'dumb' reducers typically lead to command handlers dispatching multiple fine-grained reducer actions across multiple
slices in order to get the job done. Because this can have adverse effects on predictability and performance of the
presentational components, the command handlers use action batching to group multiple fine-grained reducer actions
into one.

**Note: multiple actions batched into one get this design conceptually quite close to what Redux style guide advocates - having
single action handled by multiple reducers to update the state. We favored the current design over idiomatic Redux usage
in order to simplify reducer action design, minimize boilerplate and concentrate all the domain logic inside the
command handlers. Redux toolkit slices greatly minimize boilerplate; with dumb slice reducers there is no need to carefully
craft reducer actions and tangle those actions into multiple slices.**

### Commands and Command Handling

Command is a type of action that triggers change - any change - in the dashboard model and thus the dashboard itself.
The commands are designed along the lines of the different features that the dashboard component has. All commands
are defined in the `src/model/commands` directory and are fully part of the dashboard component's public API.

The essence of commands is to expose the dashboard's domain logic that does in some way modify the state.

All commands start with the `GDC.DASH/CMD.` prefix that is followed with dot-separated segments of the command name all in
upper case. For instance: `GDC.DASH/CMD.LOAD` is name of the command that is used to load all the essential dashboard data.

There is additional convention where commands applicable to some part of the dashboard (filters, layout) all have same
first part of the name. For instance: `GDC.DASH/CMD.FLUID_LAYOUT.ADD_SECTION`. Commands are always imperative.

Code to perform the command is called command handler. It is a generator function and has to be integrated into the
root command handler saga. The root command handler is a saga that is registered and started by the dashboard
component. It has a command channel - taking all actions that match the command prefix - and for each command will
resolve the handler and `call` the handler. Commands without handler will be rejected and an event will be emitted
describing that this has happened.

The root command handler saga processes commands serially and without concurrency. This is by design and plays into
predictability and general ability to reason about command handling and the state modifications.

**Note: at this moment there is no technical obstacle that would prevent concurrent execution of command handlers. It's
purely design decision.**

The presentational components can trigger commands by dispatching the command action created using the appropriate
command factory ('action creator').

### Query and Query Processing

Query are a type of action that triggers complex read-only processing to obtain some kind of information in the
context of the dashboard. Unlike traditional CQRS systems, queries in dashboard component do not exist because of
different write and read data models. They exist to encapsulate complex domain logic that requires data from multiple
sources and one of those sources is also the analytical backend that requires network calls.

The queries in the dashboard component also have two specifics:

-   They may be triggered during command handling
-   Their results may be stored in the state and be accessible to presentational components using selectors

All queries start with `GDC.DASH/QUERY.` prefix that is followed with dot-separated segments of the query name all
in upper case. For instance `GDC.DASH/QUERY.INSIGHT.ATTRIBUTES.META`. Queries are always imperative.

Query processing is done using query services. At the heart of each query service is a generator that does the actual
work. A query service can be created from this using dedicated factory functions. One of those functions allows to
create query services that also transparently cache results in the Redux state. All available query services are
registered into the dashboard component at startup.

The services are not used as top-level sagas. Instead a single root query processor saga exists to shield all the
query processing. The root query processor saga is registered and started by the dashboard component. It has a query
channel - taking all actions that match the query prefix - and for each query will resolve and `spawn` the query service.
Queries without matching query service will be rejected and an event will be emitted describing that this has happened.

The root query processor saga crunches through the queries concurrently. Multiple queries of same type or multiple
queries in general may be started at the same time.

If a command handler needs to trigger a query and wait for its result the code can use the `call` effect to run the
`query` generator with the respective query.

### Event and Event Handling

Event is a type of action that describes what has happened in the dashboard. The sources of events are multiple:

-   Command handling triggered either internally or from presentational components
-   Query processing triggered either internally or from presentational components
-   Presentational components emit events as described by dashboard component contract
-   Other user interactions with the presentational components
-   Presentational components emit events at their own discretion

All of these events always travel through the model and will be dispatched to registered event handlers - the handlers
are typical functions provided by the client code.

All events start with `GDC.DASH/EVT.` prefix that is followed with dot-separated segments of the event name all
in upper case. For instance `GDC.DASH/EVT.LOADED`.

Events are always named in past tense because they describe what has already happened. Events that describe command
processing typically mirror command name but are in past tense.

Errors during command handling or query processing are always propagated through general purpose 'command failed' and
'query failed' events.

At this moment, there are no internally registered event handlers. All the dashboard logic is triggered imperatively
through commands or queries.

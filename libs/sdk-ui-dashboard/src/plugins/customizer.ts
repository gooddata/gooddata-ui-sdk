// (C) 2021-2022 GoodData Corporation
import {
    CustomDashboardInsightComponent,
    CustomDashboardWidgetComponent,
    InsightComponentProvider,
    KpiComponentProvider,
    OptionalInsightComponentProvider,
    OptionalInsightBodyComponentProvider,
    OptionalKpiComponentProvider,
    OptionalDateFilterComponentProvider,
    OptionalAttributeFilterComponentProvider,
} from "../presentation/index.js";
import {
    DashboardDispatch,
    DashboardEventHandler,
    DashboardEventHandlerFn,
    DashboardEvents,
    DashboardEventType,
    DashboardState,
    ExtendedDashboardWidget,
    ICustomDashboardEvent,
    ICustomWidget,
} from "../model/index.js";
import { IDashboardLayout, IDashboardLayoutSection, IDashboardLayoutItem } from "@gooddata/sdk-model";

/**
 * Set of functions you can use to customize how insights are rendered.
 *
 * @public
 */
export interface IDashboardInsightCustomizer {
    /**
     * A convenience method that will register a specific React component to use for rendering
     * any insight that is tagged with the provided `tag`.
     *
     * @remarks
     * If plugins register multiple providers for the same tag, then the provider will be picked
     * using 'last-win' strategy.
     *
     * @param tag - tag to look for on the insight, this function will do nothing if this argument is an empty string
     * @param component - component to use if the tag is found
     * @returns self, for call chaining sakes
     */
    withTag(tag: string, component: CustomDashboardInsightComponent): IDashboardInsightCustomizer;

    /**
     * Register a provider for React components to render insights.
     *
     * @remarks
     * A provider takes the insight and widget that it is part of as input and is expected to return
     * a React component that should be used to render that insight.
     *
     * If the provider returns `undefined` then:
     *
     * -  if there are other providers registered, they will be called to see if they can provide
     *    a component to render the insight
     * -  if there are no other providers registered, the default, built-in component will be used.
     *
     * You may register multiple providers. They will be evaluated in the order you register them.
     *
     * See the {@link IDashboardInsightCustomizer.withTag} convenience method to register components for insights
     *  with particular tags.
     * @param provider - provider to register
     * @returns self, for call chaining sakes
     */
    withCustomProvider(provider: OptionalInsightComponentProvider): IDashboardInsightCustomizer;

    /**
     * Register a provider for React components to render insight body inside of the {@link DefaultDashboardInsight}.
     *
     * @remarks
     * A provider takes the insight and widget that it is part of as input and is expected to return
     * a React component that should be used to render that insight.
     *
     * If the provider returns `undefined` then:
     *
     * -  if there are other providers registered, they will be called to see if they can provide
     *    a component to render the insight
     * -  if there are no other providers registered, the default, built-in component will be used.
     *
     * You may register multiple providers. They will be evaluated in the order you register them.
     * @param provider - provider to register
     * @returns self, for call chaining sakes
     * @alpha
     */
    withCustomInsightBodyProvider(
        provider: OptionalInsightBodyComponentProvider,
    ): IDashboardInsightCustomizer;

    /**
     * Register a factory for insight decorator providers.
     *
     * @remarks
     * Decorators are a way to add customizations or embellishments on top
     * of an existing component. Decorators are more complex to write because they need to work with the component
     * they should decorate and add 'something' on top of that component.
     *
     * This is best illustrated on an example:
     *
     * @example
     * ```
     * withCustomDecorator((next) => {
     *     return (insight, widget) => {
     *         if (some_condition_to_prevent_decoration) {
     *             return undefined;
     *         }
     *
     *         // Make sure you call this outside the component render function,
     *         // otherwise a new instance of the decorated component is created on each re-render.
     *         const Decorated = next(insight, widget);
     *
     *         function MyCustomDecorator(props) {
     *              return (
     *                  <div>
     *                      <p>My Custom Decoration</p>
     *                      <Decorated {...props} />
     *                  </div>
     *              )
     *         }
     *
     *         return MyCustomDecorator;
     *     }
     * })
     * ```
     *
     * The above shows how to register a decorator that will use some condition to determine whether particular
     * insight is eligible for decoration. If yes, it will add some extra text in front of the insight. Decorator
     * defers rendering of the actual insight to the underlying provider.
     *
     * Note: the factory function that you specify will be called immediately at the registration time. The
     * provider that it returns will be called at render time.
     *
     * @param providerFactory - factory
     */
    withCustomDecorator(
        providerFactory: (next: InsightComponentProvider) => OptionalInsightComponentProvider,
    ): IDashboardInsightCustomizer;
}

/**
 * Set of functions you can use to customize how KPIs are rendered.
 *
 * @public
 */
export interface IDashboardKpiCustomizer {
    /**
     * Register a provider for React components to render insights.
     *
     * @remarks
     * A provider takes the insight and
     * widget that it is part of as input and is expected to return a React component that should be
     * used to render that insight.
     *
     * If the provider returns `undefined` then:
     *
     * -  if there are other providers registered, they will be called to see if they can provide
     *    a component to render the insight
     * -  if there are no other providers registered, the default, built-in component will be used.
     *
     * You may register multiple providers. They will be evaluated in the order you register them.
     *
     * @param provider - provider to register
     * @returns self, for call chaining sakes
     */
    withCustomProvider(provider: OptionalKpiComponentProvider): IDashboardKpiCustomizer;

    /**
     * Register a factory for insight decorator providers.
     *
     * @remarks
     * Decorators are a way to add customizations or embellishments on top
     * of an existing component. Decorators are more complex to write because they need to work with the component
     * they should decorate and add 'something' on top of that component.
     *
     * This is best illustrated on an example:
     *
     * @example
     * ```
     * withCustomDecorator((next) => {
     *     return (kpi, widget) => {
     *         if (some_condition_to_prevent_decoration) {
     *             return undefined;
     *         }
     *
     *         function MyCustomDecorator(props) {
     *              const Decorated = next(kpi, widget);
     *
     *              return (
     *                  <div>
     *                      <p>My Custom Decoration</p>
     *                      <Decorated {...props}/>
     *                  </div>
     *              )
     *         }
     *
     *         return MyCustomDecorator;
     *     }
     * })
     * ```
     *
     * The above shows how to register a decorator that will use some condition to determine whether particular
     * insight is eligible for decoration. If yes, it will add some extra text in front of the insight. Decorator
     * defers rendering of the actual insight to the underlying provider.
     *
     * Note: the factory function that you specify will be called immediately at the registration time. The
     * provider that it returns will be called at render time.
     *
     * @param providerFactory - factory
     */
    withCustomDecorator(
        providerFactory: (next: KpiComponentProvider) => OptionalKpiComponentProvider,
    ): IDashboardKpiCustomizer;
}

/**
 * Set of functions you can use to customize custom widgets.
 *
 * @public
 */
export interface IDashboardWidgetCustomizer {
    /**
     * Adds a new custom widget type.
     *
     * @remarks
     * Custom widget's can be used to render arbitrary content.
     *
     * The custom widget must be wrapped inside an element which sets the height and width CSS sizing
     * properties in order to align the behavior with the provided widget types.
     *
     * @param widgetType - unique type name of the custom widget; if plugins register multiple custom
     *  widgets for the same widget type, then the last-registered custom widget wins
     * @param Component - React component to use for rendering of the custom widget
     */
    addCustomWidget(
        widgetType: string,
        Component: CustomDashboardWidgetComponent,
    ): IDashboardWidgetCustomizer;
}

/**
 * Set of functions you can use to customize the fluid layout of the dashboard rendered.
 *
 * @public
 */
export interface IFluidLayoutCustomizer {
    /**
     * Adds a new section with one or more custom widgets onto the fluid layout.
     *
     * @remarks
     * The section to add must not be empty - it must contain at least one item. Attempts to add empty sections
     * will be ignored and warnings will be reported.
     *
     * @param sectionIdx - index to add the new section at
     * @param section - section to add; note: customizer will make a deep copy of the item before adding it
     *  onto a dashboard. At this moment, the newly added items are read-only.
     */
    addSection(sectionIdx: number, section: IDashboardLayoutSection<ICustomWidget>): IFluidLayoutCustomizer;

    /**
     * Adds a new item containing a custom widget onto the dashboard.
     *
     * @remarks
     * New item will be added to
     * an existing section at index `sectionIdx` and within that section will be placed at `itemIdx`. The item
     * to add must contain a custom widget data. Attempts to add item that does not contain any widget data
     * will be ignored and warnings will be reported. Keep in mind that this can lead to further errors or
     * problems down the line if you are adding more items at specific indexes into the same section.
     *
     * Note: new items will be added into existing sections before new sections will be added using the
     * {@link IFluidLayoutCustomizer.addSection} method. Therefore,
     *
     * @param sectionIdx - index of section where to add the new item
     * @param itemIdx - index within the section where to add new item; you may specify -1 to add the
     *  item at the end of the section
     * @param item - item containing custom widget; note: customizer will make a deep copy of the item before adding it
     *  onto a dashboard. At this moment, the newly added items are read-only.
     */
    addItem(
        sectionIdx: number,
        itemIdx: number,
        item: IDashboardLayoutItem<ICustomWidget>,
    ): IFluidLayoutCustomizer;
}

/**
 * @public
 */
export type FluidLayoutCustomizationFn = (
    layout: IDashboardLayout<ExtendedDashboardWidget>,
    customizer: IFluidLayoutCustomizer,
) => void;

/**
 * Set of functions you can use to customize the layout of the dashboard rendered.
 *
 * @public
 */
export interface IDashboardLayoutCustomizer {
    /**
     * Register customization of the fluid layout that is used to render the dashboard.
     *
     * @remarks
     * At this point, you can register a function which will be called after dashboard component loads
     * the dashboard and before it starts initializing the layout itself. The function will be called
     * with two arguments:
     *
     * -  The actual dashboard layout
     * -  Customizer that allows the plugin to add new sections or section items
     *
     * Your customization function may introspect the original layout and then register its customizations.
     *
     * If the dashboard is not rendering fluid layout, then the registered function will not
     * be called.
     */
    customizeFluidLayout(fun: FluidLayoutCustomizationFn): IDashboardLayoutCustomizer;
}

/**
 * Mode of rendering of the FilterBar.
 *
 * @remarks
 * Its value can be:
 * - default - the filter bar will be rendered as if no rendering mode was set at all.
 * - hidden - the filter bar is hidden. Note that the filters set on the dashboard are still active, just not visible.
 *
 * @public
 */
export type FilterBarRenderingMode = "default" | "hidden";

/**
 * Set of functions you can use to customize some aspects of the FilterBar.
 *
 * @public
 */
export interface IFilterBarCustomizer {
    /**
     * Set the rendering mode of the FilterBar.
     *
     * @param mode - the mode to use, see {@link FilterBarRenderingMode} for info on individual values
     */
    setRenderingMode(mode: FilterBarRenderingMode): IFilterBarCustomizer;
}

/**
 * Set of functions you can use to customize rendering of the filters.
 *
 * @public
 */
export interface IFiltersCustomizer {
    /**
     * Customize how rendering of date filters is done.
     */
    date(): IDateFiltersCustomizer;

    /**
     * Customize how rendering of attribute filters is done.
     */
    attribute(): IAttributeFiltersCustomizer;
}

/**
 * Set of functions you can use to customize how attribute filters are rendered.
 *
 * @public
 */
export interface IAttributeFiltersCustomizer {
    /**
     * Register a provider for React components to render attribute filters.
     *
     * @remarks
     * A provider takes the attribute filter as input and is expected to return
     * a React component that should be used to render that filter.
     *
     * If the provider returns `undefined` then:
     *
     * -  if there are other providers registered, they will be called to see if they can provide
     *    a component to render the attribute filter
     * -  if there are no other providers registered, the default, built-in component will be used.
     *
     * You may register multiple providers. They will be evaluated in the order you register them.
     *
     * @param provider - provider to register
     * @returns self, for call chaining sakes
     */
    withCustomProvider(provider: OptionalAttributeFilterComponentProvider): IAttributeFiltersCustomizer;
}

/**
 * Set of functions you can use to customize how date filters are rendered.
 *
 * @public
 */
export interface IDateFiltersCustomizer {
    /**
     * Register a provider for React components to render date filters.
     *
     * @remarks
     * A provider takes the date filter as input and is expected to return
     * a React component that should be used to render that filter.
     *
     * If the provider returns `undefined` then:
     *
     * -  if there are other providers registered, they will be called to see if they can provide
     *    a component to render the date filter
     * -  if there are no other providers registered, the default, built-in component will be used.
     *
     * You may register multiple providers. They will be evaluated in the order you register them.
     *
     * @param provider - provider to register
     * @returns self, for call chaining sakes
     */
    withCustomProvider(provider: OptionalDateFilterComponentProvider): IDateFiltersCustomizer;
}

/**
 * @public
 */
export interface IDashboardCustomizer {
    /**
     * Customize how rendering of insight widgets is done.
     */
    insightWidgets(): IDashboardInsightCustomizer;

    /**
     * Customize how rendering of KPI widgets is done.
     */
    kpiWidgets(): IDashboardKpiCustomizer;

    /**
     * Register custom widget types.
     */
    customWidgets(): IDashboardWidgetCustomizer;

    /**
     * Customize dashboard layout.
     *
     * @remarks
     * This allows the plugin to step in during initialization and modify
     * the existing dashboard layout before it gets stored into dashboard component's state and
     * before it is rendered.
     */
    layout(): IDashboardLayoutCustomizer;

    /**
     * Customize the filter bar.
     */
    filterBar(): IFilterBarCustomizer;

    /**
     * Customize how rendering of filters is done.
     */
    filters(): IFiltersCustomizer;
}

/**
 * Callback called whenever the Dashboard's internal state changes.
 *
 * @param state - the new value of the state
 * @param dispatch - the new dispatcher function that can be used to dispatch commands
 *
 * @public
 */
// TODO: move to common location
export type DashboardStateChangeCallback = (state: DashboardState, dispatch: DashboardDispatch) => void;

/**
 * Defines a facade that you can use to register or unregister dashboard event handlers.
 *
 * @public
 */
export interface IDashboardEventHandling {
    /**
     * Adds a handler for particular event type.
     *
     * @remarks
     * Every time event of that type occurs, the provided callback function will be triggered.
     *
     * @param eventType - type of the event to handle; this can be either built-event event type (see {@link DashboardEventType}), a custom
     *  event type or `'*'` to register handler for all events
     * @param callback - function to call when the event occurs
     */
    addEventHandler<TEvents extends DashboardEvents | ICustomDashboardEvent>(
        eventType: DashboardEventType | string | "*",
        callback: DashboardEventHandlerFn<TEvents>,
    ): IDashboardEventHandling;

    /**
     * Removes a handler for particular event type. This is reverse operation to {@link IDashboardEventHandling.addEventHandler}.
     *
     * @remarks
     * In order for this method to remove a handler, the arguments must be the same when you added the handler.
     *
     * E.g. it is not possible to add a handler for all events using `'*'` and then subtract just one particular event
     * from handling.
     *
     * @param eventType - type of the event to stop handling; this can be either built-event event type (see {@link DashboardEventType}), a custom
     *  event type or `'*'` to register handler for all events
     * @param callback - originally registered callback function
     * @returns self, for call chaining sakes
     */
    removeEventHandler<TEvents extends DashboardEvents | ICustomDashboardEvent>(
        eventType: DashboardEventType | string | "*",
        callback: DashboardEventHandlerFn<TEvents>,
    ): IDashboardEventHandling;

    /**
     * Adds a custom event handler. This is a lower-level API where the handler can include both the function to
     * evaluate events and the function to trigger when the evaluation succeeds.
     *
     * @remarks
     * Attempts to register same handler twice will be ignored.
     *
     * @param handler - event handler to add
     * @returns self, for call chaining sakes
     */
    addCustomEventHandler(handler: DashboardEventHandler): IDashboardEventHandling;

    /**
     * Removes custom event handler.
     *
     * @remarks
     * In order for successful removal the entire handler object must be exactly the same as the one
     * that was used when you added the handler.
     *
     * @param handler - event handler to remove
     * @returns self, for call chaining sakes
     */
    removeCustomEventHandler(handler: DashboardEventHandler): IDashboardEventHandling;

    /**
     * Subscribe to state changes of the dashboard.
     *
     * @remarks
     * There is no need to use this if all you need is your custom React components to get up-to-date state. Your
     * React component code can (and really should) use the {@link @gooddata/sdk-ui-dashboard#useDashboardSelector} and
     * {@link @gooddata/sdk-ui-dashboard#useDashboardDispatch} hooks instead.
     *
     * Subscription to state changes is only really needed if you have custom code outside of React components and
     * you need to extract custom data from state using the selectors API.
     *
     * See also {@link SingleDashboardStoreAccessor} and {@link DashboardStoreAccessorRepository} for utility classes
     * that make managing the callback subscriptions more convenient.
     *
     * @param callback - function to call when dashboard state changes; the function will be called with
     *  two parameters: the new state and an instance of dispatch to use.
     * @returns self, for call chaining sakes
     */
    subscribeToStateChanges(callback: DashboardStateChangeCallback): IDashboardEventHandling;

    /**
     * Unsubscribe from receiving calls about state changes of the dashboard.
     *
     * @param callback - callback that was previously used for subscription
     * @returns self, for call chaining sakes
     */
    unsubscribeFromStateChanges(callback: DashboardStateChangeCallback): IDashboardEventHandling;
}

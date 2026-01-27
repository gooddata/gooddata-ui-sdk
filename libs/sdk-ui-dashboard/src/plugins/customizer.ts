// (C) 2021-2026 GoodData Corporation

import {
    type IDashboardLayout,
    type IDashboardLayoutItem,
    type IDashboardLayoutSection,
} from "@gooddata/sdk-model";

import type { DashboardEventHandler, DashboardEventHandlerFn } from "../model/eventHandlers/eventHandler.js";
import type { ICustomDashboardEvent } from "../model/events/base.js";
import type { DashboardEvents } from "../model/events/index.js";
import type { DashboardDispatch, DashboardState } from "../model/store/types.js";
import type { ExtendedDashboardWidget, ICustomWidget } from "../model/types/layoutTypes.js";
import type {
    AttributeFilterComponentProvider,
    DashboardContentComponentProvider,
    FilterBarComponentProvider,
    InsightComponentProvider,
    LayoutComponentProvider,
    LoadingComponentProvider,
    OptionalAttributeFilterComponentProvider,
    OptionalDashboardContentComponentProvider,
    OptionalDateFilterComponentProvider,
    OptionalFilterBarComponentProvider,
    OptionalFilterGroupComponentProvider,
    OptionalInsightBodyComponentProvider,
    OptionalInsightComponentProvider,
    OptionalLayoutComponentProvider,
    OptionalLoadingComponentProvider,
    OptionalRichTextComponentProvider,
    OptionalTitleComponentProvider,
    OptionalTopBarComponentProvider,
    OptionalVisualizationSwitcherComponentProvider,
    OptionalVisualizationSwitcherToolbarComponentProvider,
    RichTextComponentProvider,
    TitleComponentProvider,
    TopBarComponentProvider,
    VisualizationSwitcherComponentProvider,
    VisualizationSwitcherToolbarComponentProvider,
} from "../presentation/dashboardContexts/types.js";
import type { CustomDashboardInsightComponent } from "../presentation/widget/insight/types.js";
import type { CustomDashboardWidgetComponent } from "../presentation/widget/widget/types.js";
import { type ILayoutItemPath, type ILayoutSectionPath } from "../types.js";

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
     * @deprecated Use {@link IFluidLayoutCustomizer.addSectionToPath} with sectionPath param instead.
     */
    addSection(sectionIdx: number, section: IDashboardLayoutSection<ICustomWidget>): IFluidLayoutCustomizer;

    /**
     * Adds a new section with one or more custom widgets onto the layout even to the nested layout.
     *
     * @remarks
     * The section to add must not be empty - it must contain at least one item. Attempts to add empty sections
     * will be ignored and warnings will be reported.
     *
     * @param sectionPath - path in layout to add the new section at
     * @param section - section to add; note: customizer will make a deep copy of the item before adding it
     *  onto a dashboard. At this moment, the newly added items are read-only.
     */
    addSectionToPath(
        sectionPath: ILayoutSectionPath,
        section: IDashboardLayoutSection<ICustomWidget>,
    ): IFluidLayoutCustomizer;

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
     * {@link IFluidLayoutCustomizer.addSectionToPath} method. Therefore,
     *
     * @param sectionIdx - index of section where to add the new item
     * @param itemIdx - index within the section where to add new item; you may specify -1 to add the
     *  item at the end of the section
     * @param item - item containing custom widget; note: customizer will make a deep copy of the item before adding it
     *  onto a dashboard. At this moment, the newly added items are read-only.
     * @deprecated Use {@link IFluidLayoutCustomizer.addItemToPath} with itemPath param instead.
     */
    addItem(
        sectionIdx: number,
        itemIdx: number,
        item: IDashboardLayoutItem<ICustomWidget>,
    ): IFluidLayoutCustomizer;

    /**
     * Adds a new item containing a custom widget onto the dashboard.
     *
     * @remarks
     * New item will be added to
     * position defined by provided path allowing target also nested layouts/sections. All sections in path already need to exist. The item
     * to add must contain a custom widget data. Attempts to add item that does not contain any widget data
     * will be ignored and warnings will be reported. Keep in mind that this can lead to further errors or
     * problems down the line if you are adding more items at specific indexes into the same section.
     *
     * Note: new items will be added into existing sections before new sections will be added using the
     * IFluidLayoutCustomizer.addSection method. Therefore,
     *
     * @param itemPath - layout path where to add new item
     * @param item - item containing custom widget; note: customizer will make a deep copy of the item before adding it
     *  onto a dashboard. At this moment, the newly added items are read-only.
     */
    addItemToPath(
        itemPath: ILayoutItemPath,
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
 * Set of functions you can use to customize the export layout of the dashboard rendered.
 *
 * @alpha
 */
export interface IExportLayoutCustomizer<TWidget> {
    addTransformer(fn: SectionSlidesTransformer<TWidget>): IExportLayoutCustomizer<TWidget>;
}

/**
 * @alpha
 */
export type ExportLayoutCustomizationFn = <TWidget>(
    layout: IDashboardLayout,
    customizer: IExportLayoutCustomizer<TWidget>,
) => void;

/**
 * @alpha
 */
export type SectionSlidesTransformer<TWidget> = (
    section: IDashboardLayoutSection<TWidget>,
    fn: ISectionSlidesTransformerFunction<TWidget>,
) => IDashboardLayoutSection<TWidget>[] | undefined;

/**
 * @alpha
 */
export interface ISectionSlidesTransformerFunction<TWidget> {
    /**
     * Default transformer for the section. This is used as default transformation method for the section in
     * case that no plugin override it. Can be used to provide default transformation for the section in custom
     * plugin.
     *
     * @param section - Section to transform
     */
    defaultSection: (
        section: IDashboardLayoutSection<TWidget>,
    ) => IDashboardLayoutSection<TWidget>[] | undefined;
    /**
     * Default transformer for the items. This is used as default transformation method for the items in
     * section in case that no plugin override it. Can be used to provide default transformation for the items in
     * custom plugin.
     *
     * @param section - Section to transform
     */
    defaultItems: (
        section: IDashboardLayoutSection<TWidget>,
    ) => IDashboardLayoutSection<TWidget>[] | undefined;

    /**
     * This transformer ís used to extract break up slide from current section. Break up slide is created
     * from section title and description. This transformer only create slide when section has title or description.
     *
     * @param section - Section to transform
     */
    breakUpSlide: (
        section: IDashboardLayoutSection<TWidget>,
    ) => IDashboardLayoutSection<TWidget>[] | undefined;

    /**
     * This transformer is used to extract widget slide from current section and provided item. Widget slide is created from
     * provided item. Widget slide always contains only one item that mean there will be one item on created slide.
     *
     * @param item - Layout item (widget, kpi, ...) to transform
     */
    widgetSlide: (item: IDashboardLayoutItem<TWidget>) => IDashboardLayoutSection<TWidget>[] | undefined;

    /**
     * This transformer is used to create multiple slides from switcher widget. Each slide contains one visualization
     * that is part of the switcher.
     *
     * @param item - Layout item specifically visualization switcher to transform
     */
    switcherSlide: (item: IDashboardLayoutItem<TWidget>) => IDashboardLayoutSection<TWidget>[] | undefined;

    /**
     * This is more complex transformer that is used to transform container item in the layout to a slide. Container item is
     * transformed as a structured slide, but if it contains a visualization switcher, it is transformed to a flat list of visualizations
     * that are part of container item.
     *
     * @param item - Layout item specifically  container to transform
     * @param transform - function to transform each section in the layout
     */
    containerSlide: (
        item: IDashboardLayoutItem<TWidget>,
        transform: (
            section: IDashboardLayoutSection<TWidget>,
        ) => IDashboardLayoutSection<TWidget>[] | undefined,
    ) => IDashboardLayoutSection<TWidget>[] | undefined;

    /**
     * This is more complex transformer that is used to transform container item in the layout to a slide. Container item is
     * transformed as a structured slide, but if it contains a visualization switcher, switcher is spread into multiple slides
     * where each slide contains one visualization from each switcher.
     *
     * @remarks
     * If there are 2 switchers in the container, one with 3 visualizations and the other with 2 visualizations, then
     * this transformer will create 3 slides. First slide will contain first visualizations from both switchers, second slide
     * will contain second visualizations from both switchers and last slide will contain third visualization from the first
     * switcher and empty item from the second switcher.
     *
     * @param item - Layout item specifically  container to transform
     * @param transform - function to transform each section in the layout
     */
    containerSwitcherSlide: (
        item: IDashboardLayoutItem<TWidget>,
        transform: (
            section: IDashboardLayoutSection<TWidget>,
        ) => IDashboardLayoutSection<TWidget>[] | undefined,
    ) => IDashboardLayoutSection<TWidget>[] | undefined;

    /**
     * This is helper function that is used to iterate all items in the section. On every item
     * it calls provided transform function. This function is used to transform all items in the section.
     *
     * @param section - Section to transform
     * @param transform - function to transform each item in the layout
     */
    itemsSlide: (
        section: IDashboardLayoutSection<TWidget>,
        transform: (item: IDashboardLayoutItem<TWidget>) => IDashboardLayoutSection<TWidget>[],
    ) => IDashboardLayoutSection<TWidget>[] | undefined;

    /**
     * This function is used to determine if the section contains visualization switcher.
     *
     * @param section - Section to check
     */
    containsVisualisationSwitcher: (section: IDashboardLayoutSection<TWidget>) => boolean;
}

/**
 * @alpha
 */
export interface IDashboardContentCustomizer {
    /**
     * Register a factory for dashboard content decorator providers.
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
     *     return (dashboard) => {
     *         if (some_condition_to_prevent_decoration) {
     *             return undefined;
     *         }
     *
     *         // Make sure you call this outside the component render function,
     *         // otherwise a new instance of the decorated component is created on each re-render.
     *         const Decorated = next(dashboard);
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
     * The above shows how to register a decorator that will use some condition to determine if dashboard content
     * will be decorated.
     *
     * Note: the factory function that you specify will be called immediately at the registration time. The
     * provider that it returns will be called at render time.
     *
     * @param providerFactory - factory
     */
    withCustomDecorator(
        providerFactory: (
            next: DashboardContentComponentProvider,
        ) => OptionalDashboardContentComponentProvider,
    ): IDashboardContentCustomizer;
}

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

    /**
     * Register customization of the export layout that is used to render the dashboard.
     *
     * @remarks
     * At this point, you can register a function which will be called after dashboard component loads
     * the dashboard and before it starts rendering the layout itself. The function will be called
     * with two arguments:
     *
     * -  The actual dashboard layout
     * -  Customizer that allows the plugin to work with export definition
     *
     * Your customization function may introspect the original layout and then register its customizations.
     *
     * If the dashboard is not rendering export layout, then the registered function will not
     * be called.
     */
    customizeExportLayout(fun: ExportLayoutCustomizationFn): IDashboardLayoutCustomizer;

    /**
     * Register a provider for React components to render layout.
     *
     * @remarks
     * A provider takes the layout as input and is expected to return
     * a React component that should be used to render that layout.
     *
     * If the provider returns `undefined` then:
     *
     * -  if there are other providers registered, they will be called to see if they can provide
     *    a component to render the layout
     * -  if there are no other providers registered, the default, built-in component will be used.
     *
     * You may register multiple providers. They will be evaluated in the order you register them.
     *
     * @param provider - provider to register
     * @returns self, for call chaining sakes
     */
    withCustomProvider(provider: OptionalLayoutComponentProvider): IDashboardLayoutCustomizer;

    /**
     * Register a factory for top bar decorator providers.
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
     *     return (filter) => {
     *         if (some_condition_to_prevent_decoration) {
     *             return undefined;
     *         }
     *
     *         // Make sure you call this outside the component render function,
     *         // otherwise a new instance of the decorated component is created on each re-render.
     *         const Decorated = next(filter);
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
     * attribute filter is eligible for decoration.
     *
     * Note: the factory function that you specify will be called immediately at the registration time. The
     * provider that it returns will be called at render time.
     *
     * @param providerFactory - factory
     */
    withCustomDecorator(
        providerFactory: (next: LayoutComponentProvider) => OptionalLayoutComponentProvider,
    ): IDashboardLayoutCustomizer;
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

    /**
     * Register a provider for React components to render filter bar.
     *
     * @remarks
     * A provider takes the filter bar as input and is expected to return
     * a React component that should be used to render that filter bar.
     *
     * If the provider returns `undefined` then:
     *
     * -  if there are other providers registered, they will be called to see if they can provide
     *    a component to render the filter bar
     * -  if there are no other providers registered, the default, built-in component will be used.
     *
     * You may register multiple providers. They will be evaluated in the order you register them.
     *
     * @param provider - provider to register
     * @returns self, for call chaining sakes
     */
    withCustomProvider(provider: OptionalFilterBarComponentProvider): IFilterBarCustomizer;

    /**
     * Register a factory for top bar decorator providers.
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
     *     return (filter) => {
     *         if (some_condition_to_prevent_decoration) {
     *             return undefined;
     *         }
     *
     *         // Make sure you call this outside the component render function,
     *         // otherwise a new instance of the decorated component is created on each re-render.
     *         const Decorated = next(filter);
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
     * attribute filter is eligible for decoration.
     *
     * Note: the factory function that you specify will be called immediately at the registration time. The
     * provider that it returns will be called at render time.
     *
     * @param providerFactory - factory
     */
    withCustomDecorator(
        providerFactory: (next: FilterBarComponentProvider) => OptionalFilterBarComponentProvider,
    ): IFilterBarCustomizer;
}

/**
 * Set of functions you can use to customize some aspects of the TopBar.
 *
 * @public
 */
export interface ITopBarCustomizer {
    /**
     * Register a provider for React components to render top bar.
     *
     * @remarks
     * A provider takes the top bar as input and is expected to return
     * a React component that should be used to render that top bar.
     *
     * If the provider returns `undefined` then:
     *
     * -  if there are other providers registered, they will be called to see if they can provide
     *    a component to render the top bar
     * -  if there are no other providers registered, the default, built-in component will be used.
     *
     * You may register multiple providers. They will be evaluated in the order you register them.
     *
     * @param provider - provider to register
     * @returns self, for call chaining sakes
     */
    withCustomProvider(provider: OptionalTopBarComponentProvider): ITopBarCustomizer;

    /**
     * Register a factory for top bar decorator providers.
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
     *     return (filter) => {
     *         if (some_condition_to_prevent_decoration) {
     *             return undefined;
     *         }
     *
     *         // Make sure you call this outside the component render function,
     *         // otherwise a new instance of the decorated component is created on each re-render.
     *         const Decorated = next(filter);
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
     * attribute filter is eligible for decoration.
     *
     * Note: the factory function that you specify will be called immediately at the registration time. The
     * provider that it returns will be called at render time.
     *
     * @param providerFactory - factory
     */
    withCustomDecorator(
        providerFactory: (next: TopBarComponentProvider) => OptionalTopBarComponentProvider,
    ): ITopBarCustomizer;
}

/**
 * Set of functions you can use to customize some aspects of the Title.
 *
 * @public
 */
export interface ITitleCustomizer {
    /**
     * Register a provider for React components to render Title.
     *
     * @remarks
     * A provider takes the Title as input and is expected to return
     * a React component that should be used to render that Title.
     *
     * If the provider returns `undefined` then:
     *
     * -  if there are other providers registered, they will be called to see if they can provide
     *    a component to render the Title
     * -  if there are no other providers registered, the default, built-in component will be used.
     *
     * You may register multiple providers. They will be evaluated in the order you register them.
     *
     * @param provider - provider to register
     * @returns self, for call chaining sakes
     */
    withCustomProvider(provider: OptionalTitleComponentProvider): ITitleCustomizer;

    /**
     * Register a factory for Title decorator providers.
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
     *     return (filter) => {
     *         if (some_condition_to_prevent_decoration) {
     *             return undefined;
     *         }
     *
     *         // Make sure you call this outside the component render function,
     *         // otherwise a new instance of the decorated component is created on each re-render.
     *         const Decorated = next(filter);
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
     * attribute filter is eligible for decoration.
     *
     * Note: the factory function that you specify will be called immediately at the registration time. The
     * provider that it returns will be called at render time.
     *
     * @param providerFactory - factory
     */
    withCustomDecorator(
        providerFactory: (next: TitleComponentProvider) => OptionalTitleComponentProvider,
    ): ITitleCustomizer;
}

/**
 * Set of functions you can use to customize some aspects of the RichText.
 *
 * @public
 */
export interface IRichTextCustomizer {
    /**
     * Register a provider for React components to render RichText.
     *
     * @remarks
     * A provider takes the RichText as input and is expected to return
     * a React component that should be used to render that RichText.
     *
     * If the provider returns `undefined` then:
     *
     * -  if there are other providers registered, they will be called to see if they can provide
     *    a component to render the RichText
     * -  if there are no other providers registered, the default, built-in component will be used.
     *
     * You may register multiple providers. They will be evaluated in the order you register them.
     *
     * @param provider - provider to register
     * @returns self, for call chaining sakes
     */
    withCustomProvider(provider: OptionalRichTextComponentProvider): IRichTextCustomizer;

    /**
     * Register a factory for RichText decorator providers.
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
     *     return (filter) => {
     *         if (some_condition_to_prevent_decoration) {
     *             return undefined;
     *         }
     *
     *         // Make sure you call this outside the component render function,
     *         // otherwise a new instance of the decorated component is created on each re-render.
     *         const Decorated = next(filter);
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
     * attribute filter is eligible for decoration.
     *
     * Note: the factory function that you specify will be called immediately at the registration time. The
     * provider that it returns will be called at render time.
     *
     * @param providerFactory - factory
     */
    withCustomDecorator(
        providerFactory: (next: RichTextComponentProvider) => OptionalRichTextComponentProvider,
    ): IRichTextCustomizer;
}

/**
 * Set of functions you can use to customize some aspects of the VisualizationSwitcher.
 *
 * @public
 */
export interface IVisualizationSwitcherCustomizer {
    /**
     * Register a provider for React components to render VisualizationSwitcher.
     *
     * @remarks
     * A provider takes the VisualizationSwitcher as input and is expected to return
     * a React component that should be used to render that VisualizationSwitcher.
     *
     * If the provider returns `undefined` then:
     *
     * -  if there are other providers registered, they will be called to see if they can provide
     *    a component to render the VisualizationSwitcher
     * -  if there are no other providers registered, the default, built-in component will be used.
     *
     * You may register multiple providers. They will be evaluated in the order you register them.
     *
     * @param provider - provider to register
     * @returns self, for call chaining sakes
     */
    withCustomSwitcherProvider(
        provider: OptionalVisualizationSwitcherComponentProvider,
    ): IVisualizationSwitcherCustomizer;

    /**
     * Register a factory for RichText decorator providers.
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
     *     return (filter) => {
     *         if (some_condition_to_prevent_decoration) {
     *             return undefined;
     *         }
     *
     *         // Make sure you call this outside the component render function,
     *         // otherwise a new instance of the decorated component is created on each re-render.
     *         const Decorated = next(filter);
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
     * attribute filter is eligible for decoration.
     *
     * Note: the factory function that you specify will be called immediately at the registration time. The
     * provider that it returns will be called at render time.
     *
     * @param providerFactory - factory
     */
    withCustomSwitcherDecorator(
        providerFactory: (
            next: VisualizationSwitcherComponentProvider,
        ) => OptionalVisualizationSwitcherComponentProvider,
    ): IVisualizationSwitcherCustomizer;

    /**
     * Register a provider for React components to render VisualizationSwitcherToolbar.
     *
     * @remarks
     * A provider takes the VisualizationSwitcherToolbar as input and is expected to return
     * a React component that should be used to render that VisualizationSwitcherToolbar.
     *
     * If the provider returns `undefined` then:
     *
     * -  if there are other providers registered, they will be called to see if they can provide
     *    a component to render the VisualizationSwitcherToolbar
     * -  if there are no other providers registered, the default, built-in component will be used.
     *
     * You may register multiple providers. They will be evaluated in the order you register them.
     *
     * @param provider - provider to register
     * @returns self, for call chaining sakes
     */
    withCustomToolbarProvider(
        provider: OptionalVisualizationSwitcherToolbarComponentProvider,
    ): IVisualizationSwitcherCustomizer;

    /**
     * Register a factory for RichText decorator providers.
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
     *     return (filter) => {
     *         if (some_condition_to_prevent_decoration) {
     *             return undefined;
     *         }
     *
     *         // Make sure you call this outside the component render function,
     *         // otherwise a new instance of the decorated component is created on each re-render.
     *         const Decorated = next(filter);
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
     * attribute filter is eligible for decoration.
     *
     * Note: the factory function that you specify will be called immediately at the registration time. The
     * provider that it returns will be called at render time.
     *
     * @param providerFactory - factory
     */
    withCustomToolbarDecorator(
        providerFactory: (
            next: VisualizationSwitcherToolbarComponentProvider,
        ) => OptionalVisualizationSwitcherToolbarComponentProvider,
    ): IVisualizationSwitcherCustomizer;
}

/**
 * Set of functions you can use to customize some aspects of the Loading.
 *
 * @public
 */
export interface ILoadingCustomizer {
    /**
     * Register a provider for React components to render Loading.
     *
     * @remarks
     * A provider takes the Loading as input and is expected to return
     * a React component that should be used to render that Loading.
     *
     * If the provider returns `undefined` then:
     *
     * -  if there are other providers registered, they will be called to see if they can provide
     *    a component to render the Loading
     * -  if there are no other providers registered, the default, built-in component will be used.
     *
     * You may register multiple providers. They will be evaluated in the order you register them.
     *
     * @param provider - provider to register
     * @returns self, for call chaining sakes
     */
    withCustomProvider(provider: OptionalLoadingComponentProvider): ILoadingCustomizer;

    /**
     * Register a factory for Loading decorator providers.
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
     *     return (filter) => {
     *         if (some_condition_to_prevent_decoration) {
     *             return undefined;
     *         }
     *
     *         // Make sure you call this outside the component render function,
     *         // otherwise a new instance of the decorated component is created on each re-render.
     *         const Decorated = next(filter);
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
     * attribute filter is eligible for decoration.
     *
     * Note: the factory function that you specify will be called immediately at the registration time. The
     * provider that it returns will be called at render time.
     *
     * @param providerFactory - factory
     */
    withCustomDecorator(
        providerFactory: (next: LoadingComponentProvider) => OptionalLoadingComponentProvider,
    ): ILoadingCustomizer;
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

    /**
     * Customize how rendering of filter groups is done.
     */
    filterGroup(): IFilterGroupsCustomizer;
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

    /**
     * Register a factory for attribute filter decorator providers.
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
     *     return (filter) => {
     *         if (some_condition_to_prevent_decoration) {
     *             return undefined;
     *         }
     *
     *         // Make sure you call this outside the component render function,
     *         // otherwise a new instance of the decorated component is created on each re-render.
     *         const Decorated = next(filter);
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
     * attribute filter is eligible for decoration.
     *
     * Note: the factory function that you specify will be called immediately at the registration time. The
     * provider that it returns will be called at render time.
     *
     * @param providerFactory - factory
     */
    withCustomDecorator(
        providerFactory: (next: AttributeFilterComponentProvider) => OptionalAttributeFilterComponentProvider,
    ): IAttributeFiltersCustomizer;
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
 * Set of functions you can use to customize how filter groups are rendered.
 *
 * @public
 */
export interface IFilterGroupsCustomizer {
    /**
     * Register a provider for React components to render filter groups.
     */
    withCustomProvider(provider: OptionalFilterGroupComponentProvider): IFilterGroupsCustomizer;
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
     * Register custom widget types.
     */
    customWidgets(): IDashboardWidgetCustomizer;

    /**
     * Customize the rich text widget.
     */
    richTextWidgets(): IRichTextCustomizer;

    /**
     * Customize the visualisation switcher widget.
     */
    visualizationSwitcherWidgets(): IVisualizationSwitcherCustomizer;

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

    /**
     * Customize dashboard content.
     */
    dashboard(): IDashboardContentCustomizer;

    /**
     * Customize topBar content.
     */
    topBar(): ITopBarCustomizer;

    /**
     * Customize title content.
     */
    title(): ITitleCustomizer;

    /**
     * Customize loading content.
     */
    loading(): ILoadingCustomizer;
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
        eventType: string,
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
        eventType: string,
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

// (C) 2026 GoodData Corporation

import { type ComponentType, type ReactElement, createContext, useContext } from "react";

import { type ISlotProps } from "@gooddata/sdk-ui-kit";

import {
    type IAnalyticalDesignerCancelProps,
    type IAnalyticalDesignerClearProps,
    type IAnalyticalDesignerEditorActionsProps,
    type IAnalyticalDesignerEditorHeaderProps,
    type IAnalyticalDesignerEmbedProps,
    type IAnalyticalDesignerOpenProps,
    type IAnalyticalDesignerOptionsProps,
    type IAnalyticalDesignerSaveAsProps,
    type IAnalyticalDesignerSaveProps,
    type IAnalyticalDesignerUndoRedoProps,
    type IAnalyticalDesignerVisualizationAccessProps,
    type IAnalyticalDesignerVisualizationDescriptionProps,
    type IAnalyticalDesignerVisualizationInfoProps,
    type IAnalyticalDesignerVisualizationTitleProps,
} from "./editorHeaderSlotTypes.js";

/**
 * Props of the region shown while Analytical Designer loads.
 *
 * @alpha
 */
export interface IAnalyticalDesignerLoadingProps {
    /**
     * Class name of the default loading indicator.
     */
    className?: string;
}

/**
 * Props of the region shown when Analytical Designer cannot start.
 *
 * @alpha
 */
export interface IAnalyticalDesignerErrorProps {
    /**
     * The error that stopped Analytical Designer from starting.
     */
    error: unknown;
}

/**
 * Component a host assigns to an Analytical Designer slot. It receives the default implementation of
 * the region and the props the default would get.
 *
 * @alpha
 */
export type AnalyticalDesignerSlotComponent<TProps> = ComponentType<ISlotProps<TProps>>;

/**
 * Regions of Analytical Designer that a host can replace or wrap.
 *
 * @remarks
 * The editor header slots form a tree: EditorHeader holds VisualizationInfo and EditorActions,
 * VisualizationInfo holds VisualizationTitle, VisualizationDescription and VisualizationAccess, and
 * EditorActions holds UndoRedo, Clear, Open, Cancel, SaveAs, Save, Embed and Options. A slot can hide its
 * region by returning `null`, replace it using the data and callbacks in `defaultProps`, or render
 * `Default` with changed props or next to its own content. A region receives its children already
 * rendered with their slots.
 *
 * A control that Analytical Designer does not show, for its permissions, configuration (`hiddenActions`)
 * or mode, does not render its slot. Hiding or changing a control grants no permission: the callbacks in
 * `defaultProps` check again when called. Define slot components outside render, so that they keep their
 * state.
 *
 * @alpha
 */
export interface IAnalyticalDesignerSlots {
    /**
     * Shown while Analytical Designer loads.
     */
    Loading?: AnalyticalDesignerSlotComponent<IAnalyticalDesignerLoadingProps>;

    /**
     * Shown when Analytical Designer cannot start.
     */
    Error?: AnalyticalDesignerSlotComponent<IAnalyticalDesignerErrorProps>;

    /**
     * The editor header, with the visualization information and the editor actions. Wrap the default to
     * add content above or below it. Analytical Designer keeps the catalog restore control outside it.
     */
    EditorHeader?: AnalyticalDesignerSlotComponent<IAnalyticalDesignerEditorHeaderProps>;

    /**
     * The visualization title, description, access, indicators and dashboard usages. Wrap the default to
     * add a Back control before the title.
     */
    VisualizationInfo?: AnalyticalDesignerSlotComponent<IAnalyticalDesignerVisualizationInfoProps>;

    /**
     * The controls on the right of the header.
     */
    EditorActions?: AnalyticalDesignerSlotComponent<IAnalyticalDesignerEditorActionsProps>;

    /**
     * The visualization title.
     */
    VisualizationTitle?: AnalyticalDesignerSlotComponent<IAnalyticalDesignerVisualizationTitleProps>;

    /**
     * The visualization description, including its bubble.
     */
    VisualizationDescription?: AnalyticalDesignerSlotComponent<IAnalyticalDesignerVisualizationDescriptionProps>;

    /**
     * Who can open the visualization, including the sharing dialog. Rendered also where the built-in
     * sharing is unavailable.
     */
    VisualizationAccess?: AnalyticalDesignerSlotComponent<IAnalyticalDesignerVisualizationAccessProps>;

    /**
     * The undo and redo controls, as one control.
     */
    UndoRedo?: AnalyticalDesignerSlotComponent<IAnalyticalDesignerUndoRedoProps>;

    /**
     * The control that clears the visualization.
     */
    Clear?: AnalyticalDesignerSlotComponent<IAnalyticalDesignerClearProps>;

    /**
     * The control that opens a saved visualization, including its picker.
     */
    Open?: AnalyticalDesignerSlotComponent<IAnalyticalDesignerOpenProps>;

    /**
     * The control that leaves the editor without saving, when Analytical Designer offers it.
     */
    Cancel?: AnalyticalDesignerSlotComponent<IAnalyticalDesignerCancelProps>;

    /**
     * The control that saves the visualization as a new one, when Analytical Designer offers it.
     */
    SaveAs?: AnalyticalDesignerSlotComponent<IAnalyticalDesignerSaveAsProps>;

    /**
     * The control that saves the visualization.
     */
    Save?: AnalyticalDesignerSlotComponent<IAnalyticalDesignerSaveProps>;

    /**
     * The control that embeds the visualization, including its menu.
     */
    Embed?: AnalyticalDesignerSlotComponent<IAnalyticalDesignerEmbedProps>;

    /**
     * The options menu with exports and the time zone, including its trigger.
     */
    Options?: AnalyticalDesignerSlotComponent<IAnalyticalDesignerOptionsProps>;
}

const AdSlotsContext = createContext<IAnalyticalDesignerSlots>({});

export const AdSlotsProvider = AdSlotsContext.Provider;

export function useAdSlots(): IAnalyticalDesignerSlots {
    return useContext(AdSlotsContext);
}

/** AD's own loading indicator, the default of the Loading slot inside AD. */
export function MainLoading({ className = "main-loading" }: IAnalyticalDesignerLoadingProps) {
    return <div className={className} />;
}

/** Renders the host's slot with the default region, or the default region alone. */
export function renderSlot<TProps extends object>(
    Slot: AnalyticalDesignerSlotComponent<TProps> | undefined,
    Default: ComponentType<TProps>,
    defaultProps: TProps,
): ReactElement {
    return Slot ? <Slot Default={Default} defaultProps={defaultProps} /> : <Default {...defaultProps} />;
}

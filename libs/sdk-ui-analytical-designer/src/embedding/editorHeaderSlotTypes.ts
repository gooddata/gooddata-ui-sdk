// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import { type IObjectPermissionsObject } from "@gooddata/sdk-backend-spi";
import { type IFilter, type ISeparators, type ObjRef, type ShareStatus } from "@gooddata/sdk-model";

/**
 * How the editor header is placed next to the catalog.
 *
 * @remarks
 * - `legacy`: the header spans the editor and its information starts after the catalog width.
 *
 * - `compact`: the header spans the editor and its information starts at the left edge.
 *
 * - `catalogSidebar`: the header starts next to the collapsible catalog and follows its width.
 *
 * @alpha
 */
export type AnalyticalDesignerHeaderLayoutMode = "legacy" | "compact" | "catalogSidebar";

/**
 * Layout of the editor header.
 *
 * @alpha
 */
export interface IAnalyticalDesignerHeaderLayout {
    /**
     * How the header is placed next to the catalog.
     */
    mode: AnalyticalDesignerHeaderLayoutMode;

    /**
     * Whether the catalog is collapsed. Analytical Designer then shows its own restore control before the
     * header content.
     */
    isCatalogCollapsed: boolean;

    /**
     * Whether the catalog can be collapsed.
     */
    canCollapseCatalog: boolean;
}

/**
 * Data that every editor header slot receives.
 *
 * @alpha
 */
export interface IAnalyticalDesignerHeaderContext {
    /**
     * Layout of the header.
     */
    layout: IAnalyticalDesignerHeaderLayout;

    /**
     * Identifier of the workspace that Analytical Designer works in.
     */
    workspace: string;

    /**
     * Reference of the saved visualization. Undefined for a visualization that is not saved yet.
     */
    insightRef?: ObjRef;

    /**
     * Current title of the visualization. Empty for an untitled visualization.
     */
    title: string;

    /**
     * Whether the visualization differs from its last saved version, whether or not it can be saved now. A
     * visualization that is not saved yet has changes once it is not blank. Always false in read-only mode.
     */
    hasUnsavedChanges: boolean;
}

/**
 * Props of the editor header region.
 *
 * @remarks
 * The children come already rendered with their own slots. Render each of them at most once; leave one
 * out to hide it. The default arranges them in one row.
 *
 * @alpha
 */
export interface IAnalyticalDesignerEditorHeaderProps extends IAnalyticalDesignerHeaderContext {
    /**
     * The visualization information region (the VisualizationInfo slot).
     */
    visualizationInfo: ReactNode;

    /**
     * The editor actions region (the EditorActions slot).
     */
    editorActions: ReactNode;
}

/**
 * Props of the region with the visualization title, description and access.
 *
 * @remarks
 * The children come already rendered with their own slots. Render each of them at most once.
 *
 * @alpha
 */
export interface IAnalyticalDesignerVisualizationInfoProps extends IAnalyticalDesignerHeaderContext {
    /**
     * The visualization title (the VisualizationTitle slot).
     */
    visualizationTitle: ReactNode;

    /**
     * The visualization description (the VisualizationDescription slot).
     */
    visualizationDescription: ReactNode;

    /**
     * The visualization access (the VisualizationAccess slot).
     */
    visualizationAccess: ReactNode;

    /**
     * The lock and unsaved changes indicators.
     */
    indicators: ReactNode;

    /**
     * The dashboards that use the visualization, when Analytical Designer shows them.
     */
    usages: ReactNode;

    /**
     * Whether a navigation request is refused now, because the visualization is being saved.
     */
    isNavigationDisabled: boolean;

    /**
     * Requests leaving the editor, for a Back control.
     *
     * @remarks
     * Starts the cancellation flow that `IAnalyticalDesignerApi.requestCancellation()` starts too: Analytical
     * Designer asks for confirmation when there are unsaved changes and then emits the `insightEditingCancelled`
     * event, on which the host navigates. Navigate only on that event. Unlike that command, the request is
     * ignored while `isNavigationDisabled` is true.
     */
    onRequestBack: () => void;
}

/**
 * One control in the editor actions region.
 *
 * @alpha
 */
export interface IAnalyticalDesignerEditorAction {
    /**
     * Stable identifier of the control. Built-in controls are `undoRedo`, `clear`, `open`, `cancel`,
     * `saveAs`, `save`, `embed` and `options`. Prefix the identifier of a custom control with `custom:`.
     */
    id: string;

    /**
     * The rendered control.
     */
    content: ReactNode;
}

/**
 * Props of the editor actions region.
 *
 * @alpha
 */
export interface IAnalyticalDesignerEditorActionsProps extends IAnalyticalDesignerHeaderContext {
    /**
     * The controls in their order, already rendered with their own slots. Filter, reorder or add items
     * and pass the list to the default.
     */
    items: readonly IAnalyticalDesignerEditorAction[];
}

/**
 * Props of the visualization title.
 *
 * @alpha
 */
export interface IAnalyticalDesignerVisualizationTitleProps extends IAnalyticalDesignerHeaderContext {
    /**
     * Text shown when the visualization has no title.
     */
    placeholder: string;

    /**
     * Maximum length of the title.
     */
    maxLength: number;

    /**
     * Whether the title can be changed.
     */
    isEditable: boolean;

    /**
     * Whether the visualization is locked, for example because it is inherited from a parent workspace.
     */
    isLocked: boolean;

    /**
     * Changes the title. Ignored when the title cannot be changed.
     */
    onTitleChange: (title: string) => void;
}

/**
 * Props of the visualization description.
 *
 * @alpha
 */
export interface IAnalyticalDesignerVisualizationDescriptionProps extends IAnalyticalDesignerHeaderContext {
    /**
     * Current description of the visualization. Empty when it has none.
     */
    description: string;

    /**
     * Label of the action that adds a description.
     */
    addLabel: string;

    /**
     * Text shown in the empty description editor.
     */
    placeholder: string;

    /**
     * Whether the description can be changed.
     */
    isEditable: boolean;

    /**
     * Filters of the visualization, which references in the rich text description resolve against.
     */
    filters: IFilter[];

    /**
     * Number separators for the references in the description.
     */
    separators?: ISeparators;

    /**
     * Changes the description. Ignored when the description cannot be changed.
     */
    onDescriptionChange: (description: string) => void;
}

/**
 * Props of the visualization access.
 *
 * @remarks
 * Analytical Designer resolves this slot also where its own sharing is unavailable, for example when a host
 * embeds it, so that the host can render its own access control there. The access level is read only
 * after `onRequestAccessSummary` is called.
 *
 * @alpha
 */
export interface IAnalyticalDesignerVisualizationAccessProps extends IAnalyticalDesignerHeaderContext {
    /**
     * Whether the built-in sharing is available. The default renders nothing when it is not.
     */
    isDefaultAvailable: boolean;

    /**
     * Whether the user may change who can open the visualization.
     */
    canManageAccess: boolean;

    /**
     * The saved visualization whose access is managed. Undefined for a visualization that is not saved
     * yet; its access is then a draft applied on its first save.
     */
    target?: IObjectPermissionsObject;

    /**
     * Title of the visualization for the sharing UI, with the untitled placeholder for an empty title.
     */
    objectTitle: string;

    /**
     * Access level of the visualization: `private` when only its owner can open it, `shared` when some users or
     * groups can, and `public` when everyone in the workspace can. Undefined until requested, while loading, or
     * when the read failed.
     */
    accessLevel?: ShareStatus;

    /**
     * Whether the access level is being read.
     */
    isAccessLoading: boolean;

    /**
     * Whether the access level could not be read.
     */
    isAccessError: boolean;

    /**
     * Starts reading the access level, once. Ignored when the built-in sharing is unavailable.
     */
    onRequestAccessSummary: () => void;
}

/**
 * Props of the undo and redo controls, which are one control.
 *
 * @remarks
 * The default owns its localized tooltips and accessible names; a replacement supplies its own.
 *
 * @alpha
 */
export interface IAnalyticalDesignerUndoRedoProps extends IAnalyticalDesignerHeaderContext {
    /**
     * Whether there is nothing to undo, or the visualization is being saved.
     */
    isUndoDisabled: boolean;

    /**
     * Whether there is nothing to redo, or the visualization is being saved.
     */
    isRedoDisabled: boolean;

    /**
     * Undoes the last change. Ignored when undo is disabled.
     */
    onUndo: () => void;

    /**
     * Redoes the last undone change. Ignored when redo is disabled.
     */
    onRedo: () => void;
}

/**
 * Props of the control that clears the visualization.
 *
 * @alpha
 */
export interface IAnalyticalDesignerClearProps extends IAnalyticalDesignerHeaderContext {
    /**
     * Label of the control.
     */
    label: string;

    /**
     * Whether there is nothing to clear, or the visualization is being saved.
     */
    isDisabled: boolean;

    /**
     * Clears the visualization. Ignored when the control is disabled.
     */
    onClear: () => void;
}

/**
 * How the default Open control offers the visualizations.
 *
 * @remarks
 * - `dialog`: a dialog with the visualization picker.
 *
 * - `dropdown`: a dropdown list.
 *
 * @alpha
 */
export type AnalyticalDesignerInsightPickerVariant = "dialog" | "dropdown";

/**
 * Props of the control that opens a saved visualization, including its picker.
 *
 * @alpha
 */
export interface IAnalyticalDesignerOpenProps extends IAnalyticalDesignerHeaderContext {
    /**
     * Label of the control.
     */
    label: string;

    /**
     * Whether a visualization cannot be opened now, because one is being saved or opened.
     */
    isDisabled: boolean;

    /**
     * Whether a visualization is being opened.
     */
    isLoading: boolean;

    /**
     * Identifier of the visualization that is open. Undefined for a visualization that is not saved yet.
     */
    selectedInsightId?: string;

    /**
     * How the default offers the visualizations.
     */
    pickerVariant: AnalyticalDesignerInsightPickerVariant;

    /**
     * Only visualizations with one of these tags are offered. Undefined offers all.
     */
    includeTags?: string[];

    /**
     * Visualizations with one of these tags are not offered.
     */
    excludeTags?: string[];

    /**
     * Visualization class URLs Analytical Designer can edit. Other visualizations are shown as unknown.
     */
    enabledVisualizationUrls: string[];

    /**
     * Whether the picker searches semantically too.
     */
    isSemanticSearchEnabled: boolean;

    /**
     * Opens a saved visualization.
     *
     * @remarks
     * Analytical Designer asks for confirmation when the current visualization has unsaved changes. The call
     * requests the opening; the `insightOpened` event reports it. Ignored while `isDisabled` is true.
     */
    onOpenInsight: (ref: ObjRef) => void;
}

/**
 * Props of the control that leaves the editor without saving.
 *
 * @alpha
 */
export interface IAnalyticalDesignerCancelProps extends IAnalyticalDesignerHeaderContext {
    /**
     * Label of the control.
     */
    label: string;

    /**
     * Whether leaving is refused now, because the visualization is being saved.
     */
    isDisabled: boolean;

    /**
     * Requests leaving the editor, with the same flow as `IAnalyticalDesignerVisualizationInfoProps.onRequestBack`.
     * Ignored while `isDisabled` is true.
     */
    onCancel: () => void;
}

/**
 * Props of the control that saves the visualization as a new one.
 *
 * @alpha
 */
export interface IAnalyticalDesignerSaveAsProps extends IAnalyticalDesignerHeaderContext {
    /**
     * Label of the control. It changes while the visualization is being saved as a new one.
     */
    label: string;

    /**
     * Whether the visualization cannot be saved as a new one now.
     */
    isDisabled: boolean;

    /**
     * Whether the visualization is being saved as a new one.
     */
    isSaving: boolean;

    /**
     * Starts saving the visualization as a new one. Ignored when the control is disabled.
     */
    onSaveAs: () => void;
}

/**
 * Props of the control that saves the visualization.
 *
 * @alpha
 */
export interface IAnalyticalDesignerSaveProps extends IAnalyticalDesignerHeaderContext {
    /**
     * Label of the control. It changes while the visualization is being saved.
     */
    label: string;

    /**
     * Whether the visualization cannot be saved now.
     */
    isDisabled: boolean;

    /**
     * Whether the visualization is being saved.
     */
    isSaving: boolean;

    /**
     * Why the control is disabled, when there is a reason to tell the user.
     */
    disabledTooltip?: string;

    /**
     * Starts saving the visualization. Ignored when the control is disabled.
     */
    onSave: () => void;
}

/**
 * Props of the control that embeds the visualization.
 *
 * @alpha
 */
export interface IAnalyticalDesignerEmbedProps extends IAnalyticalDesignerHeaderContext {
    /**
     * Accessible name of the control.
     */
    label: string;

    /**
     * Label of the choice that shows the code embedding the visualization.
     */
    embedInsightLabel: string;

    /**
     * Whether the visualization cannot be embedded, because it is empty.
     */
    isEmbedInsightDisabled: boolean;

    /**
     * Why the visualization cannot be embedded.
     */
    embedInsightDisabledReason?: string;

    /**
     * Label of the choice that opens the documentation about embedding Analytical Designer.
     */
    documentationLabel: string;

    /**
     * Address of the documentation about embedding Analytical Designer.
     */
    documentationUrl: string;

    /**
     * Opens the dialog with the code embedding the visualization. Ignored when it cannot be embedded.
     */
    onEmbedInsight: () => void;
}

/**
 * An action in the options menu.
 *
 * @alpha
 */
export interface IAnalyticalDesignerOptionsAction {
    type: "action";

    /**
     * Stable identifier of the item. Built-in actions are `openInAnalyticalDesigner`, `exportXlsx`,
     * `exportPdf`, `exportCsv`, `exportCsvRaw` and `changeTimezone`. Prefix a custom identifier with
     * `custom:`.
     */
    id: string;

    /**
     * Label of the action.
     */
    label: string;

    /**
     * Whether the action is disabled.
     */
    isDisabled: boolean;

    /**
     * Why the action is disabled.
     */
    disabledTooltip?: string;

    /**
     * Starts the action. A built-in action starts its usual flow, such as an export dialog, and ignores
     * the call while it is disabled.
     */
    onSelect: () => void;
}

/**
 * A section label in the options menu. It labels the actions after it, up to the next section or separator.
 *
 * @alpha
 */
export interface IAnalyticalDesignerOptionsSection {
    type: "section";

    /**
     * Stable identifier of the item. The built-in section is `exportSection`.
     */
    id: string;

    /**
     * Label of the section.
     */
    label: string;
}

/**
 * A separator in the options menu.
 *
 * @alpha
 */
export interface IAnalyticalDesignerOptionsSeparator {
    type: "separator";

    /**
     * Stable identifier of the item. The built-in separator is `timezoneSeparator`.
     */
    id: string;
}

/**
 * An item of the options menu.
 *
 * @alpha
 */
export type AnalyticalDesignerOptionsItem =
    | IAnalyticalDesignerOptionsAction
    | IAnalyticalDesignerOptionsSection
    | IAnalyticalDesignerOptionsSeparator;

/**
 * Props of the options menu, including its trigger.
 *
 * @remarks
 * The default drops sections without actions and separators that separate nothing, so filtered items need
 * no cleanup.
 *
 * @alpha
 */
export interface IAnalyticalDesignerOptionsProps extends IAnalyticalDesignerHeaderContext {
    /**
     * Text of the trigger.
     */
    label: string;

    /**
     * Accessible name of the trigger.
     */
    accessibleName: string;

    /**
     * Whether the trigger is disabled.
     */
    isDisabled: boolean;

    /**
     * Items of the menu in their order.
     */
    items: readonly AnalyticalDesignerOptionsItem[];
}

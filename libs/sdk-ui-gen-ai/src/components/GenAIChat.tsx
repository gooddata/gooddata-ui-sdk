// (C) 2024-2026 GoodData Corporation

import { BackendProvider, WorkspaceProvider, useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";
import { type DashboardSelectorEvaluator } from "@gooddata/sdk-ui-dashboard";

import { useDashboardAmbientContext } from "../context/hooks/useDashboardAmbientContext.js";
import { IntlWrapper } from "../localization/IntlWrapper.js";
import { PermissionsProvider } from "../permissions/PermissionsContext.js";
import { usePermissions } from "../permissions/usePermissions.js";

import { ConfigProvider, type GenAIAssistantMode, type LinkHandlerEvent } from "./ConfigContext.js";
import { CustomizationProvider } from "./CustomizationProvider.js";
import { type IGenAIAssistantSlots } from "./customized/types.js";
import { GenAIChatWrapper } from "./GenAIChatWrapper.js";
import { GenAiStore, type GenAiStoreProps } from "./GenAiStore.js";

/**
 * Properties for the GenAIAssistant component.
 * @public
 */
export type GenAIAssistantProps = Omit<GenAiStoreProps, "children"> & {
    /**
     * The locale to use for the chat UI.
     */
    locale?: string;
    /**
     * When provided, references to the metadata objects will be rendered as clickable links.
     * Otherwise, the metadata objects will be rendered as plain text (using object title).
     */
    onLinkClick?: (linkClickEvent: LinkHandlerEvent) => string | undefined;

    /**
     * When true, allows the chat to render links that open in a new tab or window. This
     * is handy only when embedding the chat in same environment where GD platform is running because
     * chat always create full URLs to the links.
     */
    allowNativeLinks?: boolean;

    /**
     * This will disable manage permissions for the user even if the user has them defined.
     */
    disableManage?: boolean;

    /**
     * This will disable analyze permissions for the user even if the user has them defined.
     */
    disableAnalyze?: boolean;

    /**
     * This will disable full control permissions for the user even if the user has them defined.
     */
    disableFullControl?: boolean;

    /**
     * Selector that is used to automatically build ambient context for the chat.
     * If its provided, the chat will automatically load the dashboards and related data
     * from it.
     */
    dashboardSelector?: DashboardSelectorEvaluator;

    /**
     * Customizations for the Gen AI assistant.
     */
    slots?: IGenAIAssistantSlots;

    /**
     * Additional class name applied to the root element.
     */
    className?: string;

    /**
     * Display mode of the assistant. Adapts the internal layout to a narrow or to a wide container;
     * the assistant always fills its parent element, so this does not resize it.
     * On small screens the fullscreen layout is always used.
     */
    mode?: GenAIAssistantMode;

    /**
     * Called when the display mode changes on its own, e.g. after `setFullscreenAction` is dispatched,
     * so that the embedding application can keep its own chrome in sync.
     */
    onModeChange?: (mode: GenAIAssistantMode) => void;
};

/**
 * Properties for the GenAIChat component.
 * @deprecated This is an old name. Use {@link GenAIAssistantProps} instead.
 * @public
 */
export type GenAIChatProps = GenAIAssistantProps;

/**
 * UI component that renders the Gen AI assistant.
 * @public
 */
export function GenAIAssistant(props: GenAIAssistantProps) {
    const {
        backend,
        workspace,
        locale,
        colorPalette,
        eventHandlers,
        settings,
        objectTypes,
        catalogItems,
        dashboards,
        visualizations,
        includeTags,
        excludeTags,
        isPreview,
        allowInteractionIntelligence,
        providedStore,
        onDispatcher,
        onLinkClick,
        mode,
        allowNativeLinks,
    } = props;
    const effectiveBackend = useBackendStrict(backend);
    const effectiveWorkspace = useWorkspaceStrict(workspace);

    return (
        <IntlWrapper locale={locale}>
            <GenAiStore
                backend={effectiveBackend}
                workspace={effectiveWorkspace}
                onDispatcher={onDispatcher}
                colorPalette={colorPalette}
                mode={mode}
                eventHandlers={eventHandlers}
                allowNativeLinks={allowNativeLinks}
                onLinkClick={onLinkClick}
                settings={settings}
                objectTypes={objectTypes}
                includeTags={includeTags}
                excludeTags={excludeTags}
                catalogItems={catalogItems}
                dashboards={dashboards}
                visualizations={visualizations}
                isPreview={isPreview}
                allowInteractionIntelligence={allowInteractionIntelligence}
                providedStore={providedStore}
            >
                <BackendProvider backend={effectiveBackend}>
                    <WorkspaceProvider workspace={effectiveWorkspace}>
                        <PermissionsProvider>
                            <GenAIContent {...props} />
                        </PermissionsProvider>
                    </WorkspaceProvider>
                </BackendProvider>
            </GenAiStore>
        </IntlWrapper>
    );
}

/**
 * UI component that renders the Gen AI chat.
 * @deprecated This is an old name. Use {@link GenAIAssistant} instead.
 * @public
 */
export const GenAIChat = GenAIAssistant;

function GenAIContent(props: GenAIChatProps) {
    const { slots, dashboardSelector, className, catalogItems } = props;
    const { permissions, loading } = usePermissions();

    useDashboardAmbientContext(dashboardSelector);

    return (
        <ConfigProvider
            catalogItems={catalogItems}
            canFullControl={props.disableFullControl ? false : (permissions.canManageProject ?? false)}
            canManage={props.disableManage ? false : (permissions.canManageProject ?? false)}
            canAnalyze={props.disableAnalyze ? false : (permissions.canCreateVisualization ?? false)}
        >
            <CustomizationProvider slots={slots}>
                <GenAIChatWrapper initializing={loading} className={className} />
            </CustomizationProvider>
        </ConfigProvider>
    );
}

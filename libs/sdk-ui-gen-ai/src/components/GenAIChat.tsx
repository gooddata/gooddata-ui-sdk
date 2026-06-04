// (C) 2024-2026 GoodData Corporation

import { type ComponentType } from "react";

import { BackendProvider, WorkspaceProvider, useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";

import { IntlWrapper } from "../localization/IntlWrapper.js";
import { PermissionsProvider } from "../permissions/PermissionsContext.js";
import { usePermissions } from "../permissions/usePermissions.js";

import { ConfigProvider, type LinkHandlerEvent } from "./ConfigContext.js";
import { CustomizationProvider } from "./CustomizationProvider.js";
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
    onLinkClick?: (linkClickEvent: LinkHandlerEvent) => void;

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
     * Custom React node rendered when no conversation exists yet.
     */
    LandingScreenComponentProvider?: () => ComponentType;

    /**
     * Custom React component rendered below the input as a disclaimer.
     */
    DisclaimerComponentProvider?: () => ComponentType | null;

    /**
     * Additional class name applied to the root element.
     */
    className?: string;
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
        includeTags,
        excludeTags,
        isPreview,
        providedStore,
        onDispatcher,
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
                eventHandlers={eventHandlers}
                settings={settings}
                objectTypes={objectTypes}
                includeTags={includeTags}
                excludeTags={excludeTags}
                catalogItems={catalogItems}
                isPreview={isPreview}
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
    const {
        onLinkClick,
        catalogItems,
        LandingScreenComponentProvider,
        DisclaimerComponentProvider,
        className,
    } = props;
    const { permissions, loading } = usePermissions();

    return (
        <ConfigProvider
            linkHandler={onLinkClick}
            catalogItems={catalogItems}
            allowNativeLinks={props.allowNativeLinks ?? false}
            canFullControl={props.disableFullControl ? false : (permissions.canManageProject ?? false)}
            canManage={props.disableManage ? false : (permissions.canManageProject ?? false)}
            canAnalyze={props.disableAnalyze ? false : (permissions.canCreateVisualization ?? false)}
        >
            <CustomizationProvider
                landingScreenComponentProvider={LandingScreenComponentProvider}
                disclaimerComponentProvider={DisclaimerComponentProvider}
            >
                <GenAIChatWrapper initializing={loading} className={className} />
            </CustomizationProvider>
        </ConfigProvider>
    );
}

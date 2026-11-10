// (C) 2026 GoodData Corporation

import {
    type CSSProperties,
    Component,
    type MouseEvent,
    type ReactNode,
    useEffect,
    useLayoutEffect,
    useRef,
} from "react";

import {
    type PluggableApplicationRegistryItem,
    getPluggableApplicationHref,
    getPluggableApplicationLocalizedTitle,
    isExternalPluggableApplicationRegistryItem,
} from "@gooddata/sdk-model";
import {
    type IAppHeaderOptions,
    type IHostUiNotification,
    type IPlatformContext,
} from "@gooddata/sdk-pluggable-application-model";

const BLOCK = "gdc-host-ui-template-name";

export interface IHostUiState {
    ctx: IPlatformContext;
    applications: PluggableApplicationRegistryItem[];
    pathname: string;
    header: IAppHeaderOptions | undefined;
    pageTitle: string | undefined;
    chat: { showChatItem: boolean; isOpen: boolean };
    notification: IHostUiNotification | undefined;
}

export interface IHostUiProps {
    state: IHostUiState;
    appContainer: HTMLElement;
    navigate: (url: string) => void;
    onChatToggle?: () => void;
    onError?: (error: string, context: string) => void;
}

interface INavigationItem {
    id: string;
    title: string;
    href: string;
    isExternal: boolean;
    isActive: boolean;
}

const EMBEDDED_PREFIX = "/embedded";

export function getNavigationItems(
    applications: PluggableApplicationRegistryItem[],
    ctx: IPlatformContext,
    embeddedOrPlainPathname: string,
): INavigationItem[] {
    // Iframe routes repeat the regular routes under /embedded, and application hrefs never carry it.
    const pathname = embeddedOrPlainPathname.startsWith(`${EMBEDDED_PREFIX}/`)
        ? embeddedOrPlainPathname.slice(EMBEDDED_PREFIX.length)
        : embeddedOrPlainPathname;
    return [...applications]
        .filter((app) => app.applicationScope !== "workspace" || ctx.currentWorkspaceId !== undefined)
        .sort((a, b) => a.menuOrder - b.menuOrder)
        .map((app) => {
            const href = getPluggableApplicationHref(app, ctx.currentWorkspaceId);
            const isExternal = isExternalPluggableApplicationRegistryItem(app);
            return {
                id: app.id,
                title: getPluggableApplicationLocalizedTitle(app, ctx.preferredLocale),
                href,
                isExternal,
                isActive: !isExternal && (pathname === href || pathname.startsWith(`${href}/`)),
            };
        });
}

// The header colors of the organization theme, the same ones the default host header uses.
function getHeaderThemeStyle(ctx: IPlatformContext): CSSProperties {
    const header = ctx.theme?.header;
    return {
        ...(header?.backgroundColor ? { [`--${BLOCK}-header-background`]: header.backgroundColor } : {}),
        ...(header?.color ? { [`--${BLOCK}-header-color`]: header.color } : {}),
        ...(header?.activeColor ? { [`--${BLOCK}-header-active`]: header.activeColor } : {}),
    } as CSSProperties;
}

export function HostUi({ state, appContainer, navigate, onChatToggle, onError }: IHostUiProps) {
    const { ctx, applications, pathname, header, pageTitle, chat, notification } = state;
    const items = getNavigationItems(applications, ctx, pathname);
    const brand = ctx.organization?.title ?? ctx.organization?.id ?? "{applicationTemplateTitle}";
    const documentTitle = pageTitle ?? items.find((item) => item.isActive)?.title;
    const isHeaderHidden = ctx.embeddingMode === "iframe" || ctx.isExportMode === true;

    useEffect(() => {
        // Exports print the document title, so it carries no brand there, as in the default host header.
        if (ctx.isExportMode) {
            document.title = documentTitle ?? "";
            return;
        }
        document.title = documentTitle ? `${documentTitle} - ${brand}` : brand;
    }, [documentTitle, brand, ctx.isExportMode]);

    return (
        <div className={BLOCK} style={getHeaderThemeStyle(ctx)}>
            {isHeaderHidden ? null : (
                // The pathname key resets a failed header when the user moves to another page.
                <HostUiErrorBoundary key={pathname} onError={onError}>
                    <HostHeader
                        brand={brand}
                        items={items}
                        login={ctx.user.login}
                        header={header}
                        chat={chat}
                        notification={notification}
                        navigate={navigate}
                        onChatToggle={onChatToggle}
                    />
                </HostUiErrorBoundary>
            )}
            <AppSlot appContainer={appContainer} />
        </div>
    );
}

interface IHostHeaderProps {
    brand: string;
    items: INavigationItem[];
    login: string;
    header: IAppHeaderOptions | undefined;
    chat: IHostUiState["chat"];
    notification: IHostUiNotification | undefined;
    navigate: (url: string) => void;
    onChatToggle?: () => void;
}

function HostHeader({
    brand,
    items,
    login,
    header,
    chat,
    notification,
    navigate,
    onChatToggle,
}: IHostHeaderProps) {
    const onLinkClick = (event: MouseEvent<HTMLAnchorElement>, item: INavigationItem) => {
        if (item.isExternal || event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) {
            return;
        }
        event.preventDefault();
        navigate(item.href);
    };

    return (
        <>
            <header className={`${BLOCK}__header`}>
                <span className={`${BLOCK}__brand`}>{brand}</span>
                <nav className={`${BLOCK}__nav`}>
                    {items.map((item) => (
                        <a
                            key={item.id}
                            href={item.href}
                            className={
                                item.isActive ? `${BLOCK}__link ${BLOCK}__link--active` : `${BLOCK}__link`
                            }
                            aria-current={item.isActive ? "page" : undefined}
                            onClick={(event) => onLinkClick(event, item)}
                        >
                            {item.title}
                        </a>
                    ))}
                </nav>
                {header?.helpMenuItems?.map((helpItem) =>
                    helpItem.href ? (
                        <a
                            key={helpItem.key}
                            href={helpItem.href}
                            target={helpItem.target ?? "_blank"}
                            rel="noopener noreferrer"
                            className={`${BLOCK}__link`}
                        >
                            {helpItem.label ?? helpItem.key}
                        </a>
                    ) : null,
                )}
                {chat.showChatItem ? (
                    <button
                        type="button"
                        className={`${BLOCK}__button`}
                        aria-pressed={chat.isOpen}
                        onClick={onChatToggle}
                    >
                        AI assistant
                    </button>
                ) : null}
                <span className={`${BLOCK}__user`}>{login}</span>
            </header>
            {notification?.type === "newDeploymentAvailable" ? (
                <div className={`${BLOCK}__notification`} role="status">
                    A new version is available.
                    <button
                        type="button"
                        className={`${BLOCK}__button`}
                        onClick={() => window.location.reload()}
                    >
                        Reload
                    </button>
                </div>
            ) : null}
        </>
    );
}

function AppSlot({ appContainer }: { appContainer: HTMLElement }) {
    const slotRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        slotRef.current?.appendChild(appContainer);
    }, [appContainer]);

    return <main ref={slotRef} className={`${BLOCK}__main`} />;
}

interface IHostUiErrorBoundaryProps {
    onError?: (error: string, context: string) => void;
    children: ReactNode;
}

// The host UI renders in its own React root, so the host error boundary does not see its errors.
class HostUiErrorBoundary extends Component<IHostUiErrorBoundaryProps, { hasError: boolean }> {
    override state = { hasError: false };

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    override componentDidCatch(error: Error) {
        this.props.onError?.(error.message, "gdc-host-ui-template-name");
    }

    override render() {
        return this.state.hasError ? (
            <p role="alert">The application header failed to load.</p>
        ) : (
            this.props.children
        );
    }
}

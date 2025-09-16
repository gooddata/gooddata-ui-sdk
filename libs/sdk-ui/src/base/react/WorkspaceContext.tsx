// (C) 2019-2025 GoodData Corporation

import { ComponentType, ReactNode, createContext, useContext } from "react";

import { invariant } from "ts-invariant";

import { wrapDisplayName } from "./wrapDisplayName.js";

const WorkspaceContext = createContext<string | undefined>(undefined);
WorkspaceContext.displayName = "WorkspaceContext";

/**
 * Props of the {@link WorkspaceProvider} component.
 * @public
 */
export interface IWorkspaceProviderProps {
    /**
     * Workspace with which the components should work with.
     */
    workspace: string;

    /**
     * React children
     */
    children?: ReactNode;
}

/**
 * WorkspaceProvider can be used to inject analytical workspace instance to all ui-sdk components in your app.
 *
 * @public
 */
export function WorkspaceProvider({ children, workspace }: IWorkspaceProviderProps) {
    return <WorkspaceContext.Provider value={workspace}>{children}</WorkspaceContext.Provider>;
}

/**
 * Hook to get workspace instance provided to {@link WorkspaceProvider}.
 *
 * @remarks
 * You can set a workspace override that will be returned if defined.
 * This makes the usage more ergonomic (see the following example).
 *
 * Note: For a better TypeScript experience without the hassle of undefined values, you can use the {@link useWorkspaceStrict} hook.
 *
 * @example
 * ```
 * // instead of
 * const fromContext = useWorkspace();
 * const effectiveWorkspace = fromArguments ?? fromContext.
 * // you can write
 * const workspace = useWorkspace(fromArguments);
 *```
 *
 * @param workspace - workspace to use instead of context value. If undefined, the context value is used.
 * @public
 */
export const useWorkspace = (workspace?: string): string | undefined => {
    const workspaceFromContext = useContext(WorkspaceContext);
    return workspace ?? workspaceFromContext;
};

/**
 * Hook to get workspace instance provided to {@link WorkspaceProvider}.
 *
 * @remarks
 * You can set a workspace override that will be returned if defined.
 * This makes the usage more ergonomic (see the following example).
 *
 * Note: Note: If you do not provide a workspace identifier to {@link WorkspaceProvider} or as a parameter for this hook,
 * an invariant error is raised.
 *
 * @example
 * ```
 * // instead of
 * const fromContext = useWorkspaceStrict();
 * const effectiveWorkspace = fromArguments ?? fromContext.
 * // you can write
 * const workspace = useWorkspaceStrict(fromArguments);
 * ```
 *
 * @param workspace - workspace to use instead of context value. If undefined, the context value is used.
 * @param context - provide context to improve error message in raised invariant (e.g. parent hook name).
 * @public
 */
export const useWorkspaceStrict = (workspace?: string, context = "useWorkspaceStrict"): string => {
    const workspaceFromContext = useContext(WorkspaceContext);
    const effectiveWorkspace = workspace ?? workspaceFromContext;
    invariant(
        effectiveWorkspace,
        `${context}: workspace must be defined. Either pass it as a parameter or make sure there is a WorkspaceProvider up the component tree.`,
    );
    return effectiveWorkspace;
};

/**
 * Wraps component into a WorkspaceContext consumer - injecting an instance of workspace from context into the
 * workspace prop.
 *
 * @internal
 */
export function withWorkspace<T extends { workspace?: string }>(
    Component: ComponentType<T>,
): ComponentType<T> {
    function ComponentWithInjectedWorkspace(props: T) {
        return (
            <WorkspaceContext.Consumer>
                {(workspace) => <Component {...props} workspace={props.workspace ?? workspace} />}
            </WorkspaceContext.Consumer>
        );
    }

    return wrapDisplayName("withWorkspace", Component)(ComponentWithInjectedWorkspace);
}

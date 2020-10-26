// (C) 2019 GoodData Corporation
import React from "react";
import { wrapDisplayName } from "./wrapDisplayName";

const WorkspaceContext = React.createContext<string | undefined>(undefined);
WorkspaceContext.displayName = "WorkspaceContext";

/**
 * @public
 */
export interface IWorkspaceProviderProps {
    /**
     * Workspace with which the components should work with.
     */
    workspace: string;
}

/**
 * WorkspaceProvider can be used to inject analytical workspace instance to all ui-sdk components in your app.
 *
 * @public
 */
export const WorkspaceProvider: React.FC<IWorkspaceProviderProps> = ({ children, workspace }) => {
    return <WorkspaceContext.Provider value={workspace}>{children}</WorkspaceContext.Provider>;
};

/**
 * Hook to get workspace instance provided to BackendProvider.
 * You can optionally set a workspace override that will be returned if defined.
 * This makes the usage more ergonomic (see the following example).
 *
 * @example
 * // instead of
 * const fromContext = useWorkspace();
 * const effectiveWorkspace = fromArguments ?? fromContext.
 * // you can write
 * const workspace = useWorkspace(fromArguments);
 *
 * @param workspace - workspace to use instead of context value. If undefined, the context value is used.
 * @public
 */
export const useWorkspace = (workspace?: string): string | undefined => {
    const workspaceFromContext = React.useContext(WorkspaceContext);
    return workspace ?? workspaceFromContext;
};

/**
 * Wraps component into a WorkspaceContext consumer - injecting an instance of workspace from context into the
 * workspace prop.
 *
 * @internal
 */
export function withWorkspace<T extends { workspace?: string }>(
    Component: React.ComponentType<T>,
): React.ComponentType<T> {
    const ComponentWithInjectedWorkspace: React.FC<T> = (props) => {
        return (
            <WorkspaceContext.Consumer>
                {(workspace) => <Component {...props} workspace={props.workspace ?? workspace} />}
            </WorkspaceContext.Consumer>
        );
    };

    return wrapDisplayName("withWorkspace", Component)(ComponentWithInjectedWorkspace);
}

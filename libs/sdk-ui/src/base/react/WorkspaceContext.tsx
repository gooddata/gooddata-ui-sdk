// (C) 2019 GoodData Corporation
import * as React from "react";
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
 *
 * @public
 */
export const useWorkspace = () => {
    const workspace = React.useContext(WorkspaceContext);

    return workspace;
};

/**
 * Wraps component into a WorkspaceContext consumer - injecting an instance of workspace from context into the
 * workspace prop.
 *
 * @internal
 */
export function withWorkspace<T extends { workspace?: string }>(Chart: React.ComponentType<T>) {
    const ComponentWithInjectedWorkspace: React.FC<T> = (props) => {
        return (
            <WorkspaceContext.Consumer>
                {(workspace) => <Chart workspace={workspace} {...props} />}
            </WorkspaceContext.Consumer>
        );
    };

    return wrapDisplayName("withWorkspace", Chart)(ComponentWithInjectedWorkspace);
}

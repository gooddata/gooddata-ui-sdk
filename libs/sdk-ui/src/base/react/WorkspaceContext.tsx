// (C) 2019 GoodData Corporation
import * as React from "react";
import { wrapDisplayName } from "./wrapDisplayName";
/**
 * @internal
 */
const WorkspaceContext = React.createContext<string>(undefined);
WorkspaceContext.displayName = "WorkspaceContext";

/**
 * @internal
 * TODO: Probably support also IAnalyticalWorkspace
 */
interface IWorkspaceProviderProps {
    workspace: string;
}

/**
 * WorkspaceProvider can be used to inject analytical workspace instance to all ui-sdk components in your app
 * @public
 */
export const WorkspaceProvider: React.FC<IWorkspaceProviderProps> = ({ children, workspace }) => {
    return <WorkspaceContext.Provider value={workspace}>{children}</WorkspaceContext.Provider>;
};

/**
 * Hook to get analytical backend instance provided to BackendProvider
 * @public
 */
export const useWorkspace = () => {
    const workspace = React.useContext(WorkspaceContext);
    return workspace;
};

export function withWorkspace<T extends { workspace?: string }>(Chart: React.ComponentType<T>) {
    const ComponentWithInjectedWorkspace: React.FC<T> = props => {
        return (
            <WorkspaceContext.Consumer>
                {workspace => <Chart workspace={workspace} {...props} />}
            </WorkspaceContext.Consumer>
        );
    };

    return wrapDisplayName("withWorkspace", Chart)(ComponentWithInjectedWorkspace);
}

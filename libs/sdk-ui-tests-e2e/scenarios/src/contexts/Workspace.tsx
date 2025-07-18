// (C) 2022-2025 GoodData Corporation

import { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { WorkspaceProvider as DefaultWorkspaceProvider } from "@gooddata/sdk-ui";
import identity from "lodash/identity";

import { workspace as defaultWorkspace } from "../constants";

import { useWorkspaceList } from "./WorkspaceList";

interface IWorkspaceContext {
    workspace: string;
    setWorkspace: (workspace: string) => void;
}

const WorkspaceContext = createContext<IWorkspaceContext>({
    workspace: defaultWorkspace,
    setWorkspace: identity,
});

export function WorkspaceProvider({ children }: { children?: ReactNode }) {
    const workspaceList = useWorkspaceList();
    const [workspace, setWorkspace] = useState<string>(defaultWorkspace);

    // if workspace was not set yet then try to use first workspace available
    useEffect(() => {
        if (!workspace && workspaceList.firstWorkspace) setWorkspace(workspaceList.firstWorkspace);
    }, [workspace, workspaceList]);

    return (
        <WorkspaceContext.Provider value={{ workspace, setWorkspace }}>
            <DefaultWorkspaceProvider workspace={workspace}>{children}</DefaultWorkspaceProvider>
        </WorkspaceContext.Provider>
    );
}

export function useWorkspace() {
    return useContext(WorkspaceContext);
}

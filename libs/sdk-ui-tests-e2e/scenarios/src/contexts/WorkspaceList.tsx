// (C) 2020-2025 GoodData Corporation

import { ReactNode, createContext, useContext, useEffect, useState } from "react";

import { isEmpty } from "lodash-es";

import { IPagedResource } from "@gooddata/sdk-backend-spi/esm/common/paging";
import { IAnalyticalWorkspace, IWorkspaceDescriptor } from "@gooddata/sdk-backend-spi/esm/workspace";

import { useAuth, useBackend } from "./Auth";
import { AuthStatus } from "./Auth/state";
import { workspaceFilter } from "../constants";
import { IWorkspaceSourceState, defaultSourceState } from "../utils";

export interface IWorkspaceListContext extends IWorkspaceSourceState {
    firstWorkspace?: string;
}

const WorkspaceListContext = createContext<IWorkspaceListContext>({
    ...defaultSourceState,
});

const filterWorkspaces = (workspaces: IWorkspaceDescriptor[], filter?: RegExp) => {
    if (filter) {
        return workspaces.filter((workspace) => workspace.title.match(filter));
    }
    return workspaces;
};

const getFirstWorkspace = (workspaces: IWorkspaceDescriptor[]) => {
    if (workspaces.length) {
        return workspaces[0].id.split("/").at(-1);
    }
    return undefined;
};

export function WorkspaceListProvider({ children }: { children?: ReactNode }) {
    const { authStatus } = useAuth();
    const backend = useBackend();
    const [workspaceListState, setWorkspaceListState] = useState<IWorkspaceSourceState>({
        ...defaultSourceState,
    });
    const [firstWorkspace, setFirstWorkspace] = useState<string | undefined>(undefined);

    useEffect(() => {
        const getWorkspaces = async () => {
            setWorkspaceListState({ isLoading: true });

            try {
                const workspaces: IWorkspaceDescriptor[] = [];
                let page: IPagedResource<IAnalyticalWorkspace> = await backend
                    .workspaces()
                    .forCurrentUser()
                    .query();

                while (!isEmpty(page.items)) {
                    const allDescriptors = await Promise.all(
                        page.items.map((workspace) => workspace.getDescriptor()),
                    );

                    workspaces.push(...allDescriptors);
                    page = await page.next();
                }

                const filteredWorkspaces = filterWorkspaces(workspaces, workspaceFilter);
                setWorkspaceListState({
                    isLoading: false,
                    data: filteredWorkspaces,
                });
                setFirstWorkspace(getFirstWorkspace(filteredWorkspaces));
            } catch (error: any) {
                setWorkspaceListState({ isLoading: false, error });
            }
        };

        setWorkspaceListState({ isLoading: false });

        if (authStatus === AuthStatus.AUTHORIZED) {
            getWorkspaces().catch(console.error);
        }
    }, [authStatus, backend]);

    return (
        <WorkspaceListContext.Provider value={{ ...workspaceListState, firstWorkspace }}>
            {children}
        </WorkspaceListContext.Provider>
    );
}

export const useWorkspaceList = () => useContext(WorkspaceListContext);

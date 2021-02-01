// (C) 2019-2021 GoodData Corporation

import { AxiosInstance, AxiosResponse } from "axios";
import { WorkspaceObjectModel } from "./gd-tiger-model/WorkspaceObjectModel";

/**
 * Tiger execution client factory
 *
 */
export const tigerWorkspaceClientFactory = (
    axios: AxiosInstance,
): {
    getWorkspaces: () => Promise<WorkspaceObjectModel.IWorkspace[]>;
} => {
    /**
     * Fetches projects available for the user.
     */
    const getWorkspaces = (): Promise<WorkspaceObjectModel.IWorkspace[]> => {
        const uri = "/api/workspaces";
        return axios
            .get(uri, {
                headers: {
                    Accept: "application/vnd.gooddata.api+json",
                },
            })
            .then((res: AxiosResponse<WorkspaceObjectModel.IWorkspace[]>) => res.data);
    };
    return {
        getWorkspaces,
    };
};

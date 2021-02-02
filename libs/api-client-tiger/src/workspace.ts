// (C) 2021 GoodData Corporation

import { AxiosInstance, AxiosResponse } from "axios";
import { WorkspaceObjectModel } from "./gd-tiger-model/WorkspaceObjectModel";
import { stringify } from "./utils/queryString";

/**
 * Tiger workspace client factory
 *
 */
export const tigerWorkspaceClientFactory = (
    axios: AxiosInstance,
): {
    getWorkspacesWithPaging: (page: number, size: number) => Promise<WorkspaceObjectModel.IWorkspaceResponse>;
} => {
    /**
     * Fetches projects available for the user.
     */
    const getWorkspacesWithPaging = (
        page: number,
        size: number,
    ): Promise<WorkspaceObjectModel.IWorkspaceResponse> => {
        const mergedOptions: WorkspaceObjectModel.IWorkspaceParams = {
            page,
            size,
        };

        const uri = `/api/workspaces?${stringify(mergedOptions)}`;

        return axios
            .get(uri, {
                headers: {
                    Accept: "application/vnd.gooddata.api+json",
                },
            })
            .then((res: AxiosResponse<WorkspaceObjectModel.IWorkspaceResponse>) => res.data);
    };
    return {
        getWorkspacesWithPaging,
    };
};

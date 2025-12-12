// (C) 2024 GoodData Corporation

import { type EntitiesApiGetEntityWorkspacesRequest } from "@gooddata/api-client-tiger";

// all these params are used for fetching workspace even if not needed for all methods to increase cache re-usage
export const GET_OPTIMIZED_WORKSPACE_PARAMS: Partial<EntitiesApiGetEntityWorkspacesRequest> = {
    include: ["parent"],
    metaInclude: ["config", "permissions"],
};

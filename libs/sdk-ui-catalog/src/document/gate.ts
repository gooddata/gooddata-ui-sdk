// (C) 2026 GoodData Corporation

import { useEnabledObjectTypes } from "../catalogItem/useCatalogEndpoints.js";
import { ObjectTypes } from "../objectType/constants.js";
import { useWorkspacePermission } from "../permission/PermissionsContext.js";

/**
 * Whether the user may create a Reports document from the catalog: the catalog lists documents and the
 * user holds the create grant. False until the permissions load.
 */
export function useCanCreateDocument(): boolean {
    const isListed = useEnabledObjectTypes().includes(ObjectTypes.DOCUMENT);
    const canCreate = useWorkspacePermission("canCreateDocument");
    return isListed && canCreate;
}

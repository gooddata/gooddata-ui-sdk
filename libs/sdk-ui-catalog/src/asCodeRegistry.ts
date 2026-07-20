// (C) 2026 GoodData Corporation

import type { AsCodeObjectType, IAsCodeDescriptor } from "./asCode/descriptor.js";
import { metricDescriptor } from "./metric/metricDescriptor.js";
import { ObjectTypes } from "./objectType/constants.js";
import type { ObjectType } from "./objectType/types.js";
import { parameterDescriptor } from "./parameter/parameterDescriptor.js";
import { useFeatureFlags } from "./permission/PermissionsContext.js";

/**
 * Every as-code descriptor, keyed by type — the one place the concrete descriptors are registered. The
 * key is the full `AsCodeObjectType` union, so a missing type is a compile error.
 * @internal
 */
export const asCodeDescriptors: Record<AsCodeObjectType, IAsCodeDescriptor> = {
    [ObjectTypes.METRIC]: metricDescriptor,
    [ObjectTypes.PARAMETER]: parameterDescriptor,
};

function isAsCodeObjectType(type: ObjectType): type is AsCodeObjectType {
    return Object.prototype.hasOwnProperty.call(asCodeDescriptors, type);
}

/**
 * The as-code descriptor for a catalog object type, or `undefined` if the type is not editable as code.
 * @internal
 */
export function getAsCodeDescriptor(type: ObjectType): IAsCodeDescriptor | undefined {
    return isAsCodeObjectType(type) ? asCodeDescriptors[type] : undefined;
}

/**
 * Whether this descriptor's editor is enabled by the feature flags. A descriptor with no `featureFlag`
 * is always editable; `undefined` (not an as-code type) never is.
 * @internal
 */
export function useIsAsCodeTypeEditable(descriptor: IAsCodeDescriptor | undefined): boolean {
    const flags = useFeatureFlags();
    if (descriptor === undefined) {
        return false;
    }
    return descriptor.featureFlag === undefined || Boolean(flags?.[descriptor.featureFlag]);
}

// (C) 2026 GoodData Corporation

import { useMemo } from "react";

import type { AsCodeObjectType, IAsCodeDescriptor } from "./asCode/descriptor.js";
import { computedAttributeDescriptor } from "./computedAttribute/computedAttributeDescriptor.js";
import { visualizationDescriptor } from "./insight/insightDescriptor.js";
import { metricDescriptor } from "./metric/metricDescriptor.js";
import { ObjectTypes } from "./objectType/constants.js";
import type { ObjectType } from "./objectType/types.js";
import { parameterDescriptor } from "./parameter/parameterDescriptor.js";
import { useFeatureFlags, useWorkspacePermission } from "./permission/PermissionsContext.js";

/** @internal */
export const asCodeDescriptors: Record<AsCodeObjectType, IAsCodeDescriptor> = {
    [ObjectTypes.METRIC]: metricDescriptor,
    // Key order drives the create-menu order.
    [ObjectTypes.COMPUTED_ATTRIBUTE]: computedAttributeDescriptor,
    [ObjectTypes.PARAMETER]: parameterDescriptor,
    [ObjectTypes.VISUALIZATION]: visualizationDescriptor,
};

function isAsCodeObjectType(type: ObjectType): type is AsCodeObjectType {
    return Object.prototype.hasOwnProperty.call(asCodeDescriptors, type);
}

/** @internal */
export function getAsCodeDescriptor(type: ObjectType): IAsCodeDescriptor | undefined {
    return isAsCodeObjectType(type) ? asCodeDescriptors[type] : undefined;
}

/** A descriptor with no `featureFlag` is always editable; `undefined` (not an as-code type) never is. @internal */
export function useIsAsCodeTypeEditable(descriptor: IAsCodeDescriptor | undefined): boolean {
    const flags = useFeatureFlags();
    if (descriptor === undefined) {
        return false;
    }
    return descriptor.featureFlag === undefined || Boolean(flags?.[descriptor.featureFlag]);
}

function useIsAsCodeTypeCreatable(descriptor: IAsCodeDescriptor): boolean {
    const isTypeEditable = useIsAsCodeTypeEditable(descriptor);
    const canManageProject = useWorkspacePermission("canManageProject");
    const createGate = descriptor.useCreateGate?.() ?? true;
    return isTypeEditable && canManageProject && createGate;
}

/** @internal */
export function useCreatableObjectTypes(): ReadonlySet<AsCodeObjectType> {
    // One unconditional hook call per registered type (fixed count for the rules of hooks).
    const metric = useIsAsCodeTypeCreatable(asCodeDescriptors[ObjectTypes.METRIC]);
    const parameter = useIsAsCodeTypeCreatable(asCodeDescriptors[ObjectTypes.PARAMETER]);
    const computedAttribute = useIsAsCodeTypeCreatable(asCodeDescriptors[ObjectTypes.COMPUTED_ATTRIBUTE]);
    const visualization = useIsAsCodeTypeCreatable(asCodeDescriptors[ObjectTypes.VISUALIZATION]);
    return useMemo(() => {
        // The `Record<AsCodeObjectType, …>` makes a newly registered type a compile error until listed here.
        const creatable: Record<AsCodeObjectType, boolean> = {
            [ObjectTypes.METRIC]: metric,
            [ObjectTypes.COMPUTED_ATTRIBUTE]: computedAttribute,
            [ObjectTypes.PARAMETER]: parameter,
            [ObjectTypes.VISUALIZATION]: visualization,
        };
        return new Set((Object.keys(creatable) as AsCodeObjectType[]).filter((type) => creatable[type]));
    }, [computedAttribute, metric, parameter, visualization]);
}

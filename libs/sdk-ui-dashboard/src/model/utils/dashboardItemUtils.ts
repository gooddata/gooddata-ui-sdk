// (C) 2021-2022 GoodData Corporation
import {
    DashboardItemDefinition,
    ExtendedDashboardItem,
    InternalDashboardItemDefinition,
    isCustomWidgetDefinition,
} from "../types/layoutTypes.js";
import {
    idRef,
    ObjRef,
    IDashboardObjectIdentity,
    isKpiWidgetDefinition,
    isInsightWidgetDefinition,
    isInsightWidget,
    isDashboardLayoutItem,
} from "@gooddata/sdk-model";
import { v4 as uuidv4 } from "uuid";

export function extractInsightRefsFromItems(items: ReadonlyArray<ExtendedDashboardItem>): ObjRef[] {
    const result: ObjRef[] = [];

    items.forEach((item) => {
        if (isInsightWidget(item.widget)) {
            result.push(item.widget.insight);
        }
    });

    return result;
}

const TemporaryIdentityPrefix = "@@GDC.DASH.TEMP";
function generateTemporaryIdentityForWidget(): IDashboardObjectIdentity {
    const id = `${TemporaryIdentityPrefix}-${uuidv4()}`;

    return {
        ref: idRef(id),
        identifier: id,
        uri: id,
    };
}

/**
 * Tests whether the provided object is/has a temporary identity. A temporary identity is used for those
 * objects which are not yet persisted however need to be reference-able from the dashboard itself.
 *
 * @param obj - object to test
 * @internal
 */
export function isTemporaryIdentity(obj: IDashboardObjectIdentity): boolean {
    return obj.identifier.startsWith(TemporaryIdentityPrefix);
}

/**
 * Adds temporary identity to all insight and KPI widget definitions found within the provided dashboard item
 * definitions.
 *
 * Having an identity for each widget is important for the dashboard; many places both internal and through
 * public API for different use-cases rely on identification of widget by reference.
 *
 * This function will map the input items so that the result never contains bare insight widget definitions
 * or kpi widget definitions (which do not have the identity).
 *
 * The identity assigned to those widgets is temporary one. It is a specially formatted identifier combined
 * with UUID. You can use {@link isTemporaryIdentity} function to test whether object has temporary
 * identity. When the dashboard gets saved, this temporary identity will change to permanent one that
 * will be assigned by the backend.
 *
 * @param items - items to map, will not be modified
 * @returns new array with the necessary items mapped to widgets with temporary identity.
 * @internal
 */
export function addTemporaryIdentityToWidgets(
    items: ReadonlyArray<DashboardItemDefinition>,
): InternalDashboardItemDefinition[] {
    return items.map((item) => {
        if (!isDashboardLayoutItem(item)) {
            return item;
        }

        if (
            isInsightWidgetDefinition(item.widget) ||
            isKpiWidgetDefinition(item.widget) ||
            isCustomWidgetDefinition(item.widget)
        ) {
            const temporaryIdentity = generateTemporaryIdentityForWidget();

            return {
                ...item,
                widget: {
                    ...item.widget,
                    ...temporaryIdentity,
                },
            } as any;
        }

        return item;
    });
}

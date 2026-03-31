// (C) 2020-2026 GoodData Corporation

import { type IntlShape } from "react-intl";

import {
    type IAttributeDisplayFormMetadataObject,
    type IDashboardAttributeFilter,
    type ObjRef,
    type bucketsAttributes,
    isLocalIdRef,
} from "@gooddata/sdk-model";

import { type ObjRefMap } from "../../../../../../_staging/metadata/objRefMap.js";
import {
    getDisabledOptionProps,
    getDisplayFormTitle,
    hasMatchingTargetDashboardAttributeFilterDisplayForm,
    isDateIntersectionAttribute,
} from "../drillFiltersConfigUtils.js";
import { messages } from "../messages.js";
import { type IDrillFiltersConfigOption } from "../types.js";

interface IMapIntersectionAttributeToOptionParams {
    insightAttribute: ReturnType<typeof bucketsAttributes>[number];
    allCatalogDisplayFormsMap: ObjRefMap<IAttributeDisplayFormMetadataObject>;
    allCatalogDateAttributeDisplayForms: Array<{ ref: ObjRef; title?: string }>;
    targetDashboardAttributeFilters: IDashboardAttributeFilter[];
    isDrillToDashboard: boolean;
    intl: IntlShape;
}

export function mapIntersectionAttributeToOption({
    insightAttribute,
    allCatalogDisplayFormsMap,
    allCatalogDateAttributeDisplayForms,
    targetDashboardAttributeFilters,
    isDrillToDashboard,
    intl,
}: IMapIntersectionAttributeToOptionParams): IDrillFiltersConfigOption {
    const displayFormRef = insightAttribute.attribute.displayForm;
    const isDateAttribute = isDateIntersectionAttribute(displayFormRef, allCatalogDateAttributeDisplayForms);

    const hasMatchingTargetFilter =
        isLocalIdRef(displayFormRef) ||
        hasMatchingTargetDashboardAttributeFilterDisplayForm(displayFormRef, targetDashboardAttributeFilters);

    return {
        id: insightAttribute.attribute.localIdentifier,
        title: getDisplayFormTitle({
            displayFormRef,
            allCatalogDisplayFormsMap,
        }),
        ...getDisabledOptionProps(
            isDrillToDashboard && (isDateAttribute || !hasMatchingTargetFilter),
            intl.formatMessage(
                isDateAttribute
                    ? messages.drillToDashboardDateIntersectionTooltip
                    : messages.drillToDashboardDashboardFilterTooltip,
            ),
            false,
        ),
    };
}

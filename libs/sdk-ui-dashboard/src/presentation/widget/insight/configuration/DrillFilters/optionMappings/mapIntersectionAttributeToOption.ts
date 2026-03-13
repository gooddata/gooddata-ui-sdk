// (C) 2020-2026 GoodData Corporation

import { type IntlShape } from "react-intl";

import {
    type IAttributeDisplayFormMetadataObject,
    type ObjRef,
    type bucketsAttributes,
} from "@gooddata/sdk-model";

import { type ObjRefMap } from "../../../../../../_staging/metadata/objRefMap.js";
import {
    getDisabledOptionProps,
    getDisplayFormTitle,
    isDateIntersectionAttribute,
} from "../drillFiltersConfigUtils.js";
import { messages } from "../messages.js";
import { type IDrillFiltersConfigOption } from "../types.js";

interface IMapIntersectionAttributeToOptionParams {
    insightAttribute: ReturnType<typeof bucketsAttributes>[number];
    allCatalogDisplayFormsMap: ObjRefMap<IAttributeDisplayFormMetadataObject>;
    allCatalogDateAttributeDisplayForms: Array<{ ref: ObjRef; title?: string }>;
    isDrillToDashboard: boolean;
    intl: IntlShape;
}

export function mapIntersectionAttributeToOption({
    insightAttribute,
    allCatalogDisplayFormsMap,
    allCatalogDateAttributeDisplayForms,
    isDrillToDashboard,
    intl,
}: IMapIntersectionAttributeToOptionParams): IDrillFiltersConfigOption {
    const isDateAttribute = isDateIntersectionAttribute(
        insightAttribute.attribute.displayForm,
        allCatalogDateAttributeDisplayForms,
    );

    return {
        id: insightAttribute.attribute.localIdentifier,
        title: getDisplayFormTitle({
            displayFormRef: insightAttribute.attribute.displayForm,
            allCatalogDisplayFormsMap,
        }),
        ...getDisabledOptionProps(
            isDrillToDashboard && isDateAttribute,
            intl.formatMessage(messages.drillToDashboardDateIntersectionTooltip),
            false,
        ),
    };
}

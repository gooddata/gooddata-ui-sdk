// (C) 2022-2026 GoodData Corporation

import { type AttributeDisplayFormType } from "@gooddata/sdk-model";

import { type IOrganizedCatalogItem } from "../../../typings/catalog.js";
import { type ICacheItemDisplayForm } from "../../../typings/state_objects.js";

const labelMatchesDisplayFormType = (label: ICacheItemDisplayForm, target: AttributeDisplayFormType) => {
    return (
        label.type === target ||
        (label as { displayFormType?: AttributeDisplayFormType }).displayFormType === target
    );
};

const isLabelType =
    (type: AttributeDisplayFormType): ((label: ICacheItemDisplayForm) => boolean) =>
    (label: ICacheItemDisplayForm) =>
        labelMatchesDisplayFormType(label, type);

const hasLocationMetadataRefs = (item: IOrganizedCatalogItem) => Boolean(item?.locationDisplayFormRef);
const hasAreaMetadataRefs = (item: IOrganizedCatalogItem) => Boolean(item?.areaDisplayFormRef);

export const hasLocationDisplayForm = (displayForms: readonly ICacheItemDisplayForm[]) => {
    const hasPinDisplayForm = displayForms?.some(isLabelType("GDC.geo.pin"));
    const hasLatitude = displayForms?.some(isLabelType("GDC.geo.pin_latitude"));
    const hasLongitude = displayForms?.some(isLabelType("GDC.geo.pin_longitude"));

    return Boolean(hasPinDisplayForm || (hasLatitude && hasLongitude));
};

export const hasAreaDisplayForm = (displayForms: readonly ICacheItemDisplayForm[]) => {
    return Boolean(displayForms?.some(isLabelType("GDC.geo.area")));
};

export const hasGeoDisplayForm = (displayForms: readonly ICacheItemDisplayForm[]) => {
    return hasLocationDisplayForm(displayForms) || hasAreaDisplayForm(displayForms);
};

export const isLocationCatalogItem = (item: IOrganizedCatalogItem) => {
    const hasLocationData = hasLocationDisplayForm(item.displayForms) || hasLocationMetadataRefs(item);
    return hasLocationData && !isAreaCatalogItem(item);
};

export const isAreaCatalogItem = (item: IOrganizedCatalogItem) => {
    return hasAreaDisplayForm(item.displayForms) || hasAreaMetadataRefs(item);
};

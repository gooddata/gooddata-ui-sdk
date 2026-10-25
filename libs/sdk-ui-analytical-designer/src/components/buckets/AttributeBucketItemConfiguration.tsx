// (C) 2021-2026 GoodData Corporation

import { type ObjRef, areObjRefsEqual } from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";
import { type IAlignPoint } from "@gooddata/sdk-ui-kit";

import { type ICacheItemDisplayForm, type ICatalogEntry } from "../../typings/state_objects.js";
import { CatalogItem } from "../catalog/item/CatalogItem.js";
import { hasGeoDisplayForm } from "../catalog/utils/locationAttribute.js";

import { AttributeBucketItemHyperlinkConfiguration } from "./AttributeBucketItemHyperlinkConfiguration.js";
import { AttributeDisplayFormDropdown } from "./AttributeDisplayFormDropdown.js";
import { ShowAllAttributeValuesSection } from "./ShowAllValues/ShowAllAttributeValuesSection.js";

const ALIGN_POINTS: IAlignPoint[] = [
    {
        align: "bl tl",
        offset: { x: -7, y: 1 },
    },
    {
        align: "tl bl",
        offset: { x: -7, y: -1 },
    },
];

export interface IAttributeBucketItemConfigurationOwnProps {
    attribute: ICatalogEntry;
    displayForms: ICacheItemDisplayForm[];
    selectedDisplayForm: ObjRef;
    onSelectDisplayForm: (displayForm: ObjRef) => void;
    propertiesContainTooltipText?: boolean;
    showAllValuesVisible: boolean;
    showAllValues: boolean;
    onChangeShowAllValues: (showAllValues: boolean) => void;
    localIdentifier: string;
    bucketLocalIdentifier?: string;
    isStaticHyperLinkDisplayFormTextEnabled: boolean;
}

export type AttributeBucketItemConfigurationProps = IAttributeBucketItemConfigurationOwnProps;

export function AttributeBucketItemConfiguration({
    attribute,
    displayForms,
    selectedDisplayForm,
    onSelectDisplayForm,
    propertiesContainTooltipText,
    showAllValuesVisible,
    showAllValues,
    onChangeShowAllValues,
    localIdentifier,
    bucketLocalIdentifier,
    isStaticHyperLinkDisplayFormTextEnabled,
}: AttributeBucketItemConfigurationProps) {
    const hasSomeGeoDisplayForm = hasGeoDisplayForm(displayForms);
    const hasGeoTooltip = hasSomeGeoDisplayForm && propertiesContainTooltipText;
    const isGeoLabelBucket =
        bucketLocalIdentifier === BucketNames.LOCATION || bucketLocalIdentifier === BucketNames.AREA;
    // Geo label buckets currently ignore "Display as" selection at runtime, so hide the selector in UI.
    const isDisplayFormDropdownVisible = displayForms.length > 1 && !hasGeoTooltip && !isGeoLabelBucket;
    const selectedDf = displayForms.find((df) => areObjRefsEqual(df.ref, selectedDisplayForm));

    return (
        <div className="adi-bucket-configuration adi-attribute-bucket-item-configuration s-attribute-configuration">
            <div className="adi-attribute-wrapper">
                <CatalogItem item={attribute} draggable={false} />
            </div>

            <ShowAllAttributeValuesSection
                showAllValues={showAllValues}
                onChangeShowAllValues={onChangeShowAllValues}
                visible={showAllValuesVisible}
            />

            {isDisplayFormDropdownVisible ? (
                <section className="adi-attribute-display-form-section s-attribute-configuration-display-form">
                    <AttributeDisplayFormDropdown
                        displayForms={displayForms}
                        selectedDisplayForm={selectedDisplayForm}
                        onSelect={onSelectDisplayForm}
                        alignPoints={ALIGN_POINTS}
                    />
                    {isStaticHyperLinkDisplayFormTextEnabled && selectedDf?.type === "GDC.link" ? (
                        <AttributeBucketItemHyperlinkConfiguration localIdentifier={localIdentifier} />
                    ) : null}
                </section>
            ) : null}
        </div>
    );
}

// (C) 2020-2026 GoodData Corporation

import { useState } from "react";

import { useIntl } from "react-intl";

import { type IAttributeDescriptor, type ObjRef } from "@gooddata/sdk-model";
import { useClientWorkspaceIdentifiers } from "@gooddata/sdk-ui";
import { Button, Dropdown, type IAlignPoint } from "@gooddata/sdk-ui-kit";

import { useDashboardSelector } from "../../../../../model/react/DashboardStoreProvider.js";
import { selectBackendCapabilities } from "../../../../../model/store/backendCapabilities/backendCapabilitiesSelectors.js";
import {
    selectAllCatalogAttributesMap,
    selectAllCatalogDisplayFormsMap,
} from "../../../../../model/store/catalog/catalogSelectors.js";
import { selectSettings } from "../../../../../model/store/config/configSelectors.js";
import { selectUnavailableObjects } from "../../../../../model/store/unavailableObjects/unavailableObjectsSelectors.js";
import { isLabelRestricted } from "../../../../../model/store/widgetDrills/drillRestrictionUtils.js";
import { AttributeUrlSection } from "../../../../drill/DrillConfigPanel/DrillToUrl/AttributeUrlSection.js";
import { CustomUrlEditor } from "../../../../drill/DrillConfigPanel/DrillToUrl/CustomUrlEditor.js";
import { CustomUrlSection } from "../../../../drill/DrillConfigPanel/DrillToUrl/CustomUrlSection.js";
import {
    type UrlDrillTarget,
    isDrillToAttributeUrlConfig,
    isDrillToCustomUrlConfig,
} from "../../../../drill/types.js";

import { useAttributesWithDisplayForms } from "./useAttributesWithDisplayForms.js";
import { useInvalidAttributeDisplayFormIdentifiers } from "./useInvalidAttributeDisplayFormIdentifier.js";

function useButtonValue(urlDrillTarget: UrlDrillTarget | undefined): string {
    const intl = useIntl();

    const displayForms = useDashboardSelector(selectAllCatalogDisplayFormsMap);
    const attributes = useDashboardSelector(selectAllCatalogAttributesMap);
    const unavailableObjects = useDashboardSelector(selectUnavailableObjects);

    if (isDrillToCustomUrlConfig(urlDrillTarget) && urlDrillTarget.customUrl) {
        return urlDrillTarget.customUrl;
    }

    if (isDrillToAttributeUrlConfig(urlDrillTarget) && urlDrillTarget.drillToAttributeDisplayForm) {
        const displayForm = displayForms.get(urlDrillTarget.drillToAttributeDisplayForm);
        const attribute = displayForm && attributes.get(displayForm.attribute);
        if (displayForm && attribute) {
            return `${attribute.attribute.title} (${displayForm.title})`;
        }
        // restricted or deleted labels are not in the catalog
        if (isLabelRestricted(urlDrillTarget.drillToAttributeDisplayForm, unavailableObjects)) {
            return intl.formatMessage({ id: "drill_modal_picker.restricted" });
        }
    }

    return intl.formatMessage({ id: "configurationPanel.drillIntoUrl.defaultButtonValue" });
}

const dropdownAlignPoints: IAlignPoint[] = [{ align: "bl tl" }, { align: "tl bl" }];

export interface IDrillUrlItemProps {
    widgetRef: ObjRef;
    urlDrillTarget?: UrlDrillTarget;
    attributes: IAttributeDescriptor[];
    onSelect: (selectedTarget: UrlDrillTarget) => void;
}

export function DrillTargetUrlItem(props: IDrillUrlItemProps) {
    const { onSelect, urlDrillTarget, attributes, widgetRef } = props;

    const capabilities = useDashboardSelector(selectBackendCapabilities);
    const settings = useDashboardSelector(selectSettings);

    const { allDisplayForms: targetAttributesFormsAll, linkDisplayForms: targetAttributesFormsWithLinks } =
        useAttributesWithDisplayForms(attributes);

    const invalidAttributeDisplayFormIdentifiers = useInvalidAttributeDisplayFormIdentifiers(
        urlDrillTarget,
        attributes,
    );

    const [showModal, setShowModal] = useState(false);
    const toggleModal = () => setShowModal(!showModal);

    const onCustomUrlHandler = (customUrl: string) => {
        setShowModal(false);
        onSelect({ customUrl });
    };

    const onAttributeUrlHandler = (
        insightAttributeDisplayForm: ObjRef,
        drillToAttributeDisplayForm: ObjRef,
    ) => {
        onSelect({
            insightAttributeDisplayForm,
            drillToAttributeDisplayForm,
        });
    };

    const { client, dataProduct } = useClientWorkspaceIdentifiers();

    const buttonValue = useButtonValue(urlDrillTarget);

    return (
        <>
            <Dropdown
                closeOnParentScroll
                alignPoints={dropdownAlignPoints}
                renderButton={({ toggleDropdown, isOpen }) => (
                    <Button
                        onClick={toggleDropdown}
                        className="gd-button gd-button-primary button-dropdown dropdown-button gd-button-small s-drill-to-url-button"
                        iconRight={isOpen ? "gd-icon-navigateup" : "gd-icon-navigatedown"}
                        value={buttonValue}
                    />
                )}
                renderBody={({ closeDropdown }) => (
                    <div className="gd-menu-wrapper gd-drill-to-url-body gd-drill-to-url-list s-gd-drill-to-url-body">
                        {capabilities.supportsHyperlinkAttributeLabels ? (
                            <AttributeUrlSection
                                attributeDisplayForms={targetAttributesFormsWithLinks}
                                onSelect={(insightAttributeDisplayForm, drillToAttributeDisplayForm) => {
                                    onAttributeUrlHandler(
                                        insightAttributeDisplayForm,
                                        drillToAttributeDisplayForm,
                                    );
                                    closeDropdown();
                                }}
                                selected={
                                    isDrillToAttributeUrlConfig(urlDrillTarget) &&
                                    urlDrillTarget.drillToAttributeDisplayForm
                                }
                            />
                        ) : null}
                        <CustomUrlSection
                            {...props}
                            urlDrillTarget={urlDrillTarget}
                            toggleModal={toggleModal}
                            closeDropdown={closeDropdown}
                        />
                        {showModal ? (
                            <CustomUrlEditor
                                widgetRef={widgetRef}
                                urlDrillTarget={urlDrillTarget}
                                attributeDisplayForms={targetAttributesFormsAll}
                                invalidAttributeDisplayFormIdentifiers={
                                    invalidAttributeDisplayFormIdentifiers
                                }
                                documentationLink={String(settings["drillIntoUrlDocumentationLink"] || "")}
                                enableClientIdParameter={!!client}
                                enableDataProductIdParameter={!!dataProduct}
                                enableWidgetIdParameter={!!capabilities.supportsWidgetEntity}
                                onSelect={(customUrl: string) => {
                                    onCustomUrlHandler(customUrl);
                                    closeDropdown();
                                }}
                                onClose={toggleModal}
                            />
                        ) : null}
                    </div>
                )}
            />
        </>
    );
}

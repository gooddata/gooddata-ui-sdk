// (C) 2020-2023 GoodData Corporation
import React, { useState } from "react";
import { useIntl } from "react-intl";
import { Button, Dropdown, IAlignPoint } from "@gooddata/sdk-ui-kit";
import { IAttributeDescriptor, ObjRef } from "@gooddata/sdk-model";
import { invariant } from "ts-invariant";
import {
    isDrillToAttributeUrlConfig,
    isDrillToCustomUrlConfig,
    UrlDrillTarget,
} from "../../../../drill/types.js";
import { CustomUrlSection } from "../../../../drill/DrillConfigPanel/DrillToUrl/CustomUrlSection.js";
import { CustomUrlEditor } from "../../../../drill/DrillConfigPanel/DrillToUrl/CustomUrlEditor.js";
import { useClientWorkspaceIdentifiers } from "@gooddata/sdk-ui";
import { AttributeUrlSection } from "../../../../drill/DrillConfigPanel/DrillToUrl/AttributeUrlSection.js";
import {
    selectAllCatalogDisplayFormsMap,
    useDashboardSelector,
    selectBackendCapabilities,
    selectSettings,
    selectAllCatalogAttributesMap,
} from "../../../../../model/index.js";

import { useInvalidAttributeDisplayFormIdentifiers } from "./useInvalidAttributeDisplayFormIdentifier.js";
import { useAttributesWithDisplayForms } from "./useAttributesWithDisplayForms.js";

function useButtonValue(urlDrillTarget: UrlDrillTarget | undefined): string {
    const intl = useIntl();

    const displayForms = useDashboardSelector(selectAllCatalogDisplayFormsMap);
    const attributes = useDashboardSelector(selectAllCatalogAttributesMap);

    if (isDrillToCustomUrlConfig(urlDrillTarget) && urlDrillTarget.customUrl) {
        return urlDrillTarget.customUrl;
    }

    if (isDrillToAttributeUrlConfig(urlDrillTarget) && urlDrillTarget.drillToAttributeDisplayForm) {
        const displayForm = displayForms.get(urlDrillTarget.drillToAttributeDisplayForm);
        invariant(displayForm, "inconsistent state in drill to URL button");
        const attribute = attributes.get(displayForm.attribute);
        invariant(attribute, "inconsistent state in drill to URL button");

        return `${attribute.attribute.title} (${displayForm.title})`;
    }

    return intl.formatMessage({ id: "configurationPanel.drillIntoUrl.defaultButtonValue" });
}

const dropdownAlignPoints: IAlignPoint[] = [{ align: "bl tl" }, { align: "tl bl" }];

export interface DrillUrlItemProps {
    urlDrillTarget?: UrlDrillTarget;
    attributes: IAttributeDescriptor[];
    onSelect: (selectedTarget: UrlDrillTarget) => void;
}

export const DrillTargetUrlItem: React.FunctionComponent<DrillUrlItemProps> = (props) => {
    const { onSelect, urlDrillTarget, attributes } = props;

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
                                urlDrillTarget={urlDrillTarget}
                                attributeDisplayForms={targetAttributesFormsAll}
                                invalidAttributeDisplayFormIdentifiers={
                                    invalidAttributeDisplayFormIdentifiers
                                }
                                documentationLink={String(settings.drillIntoUrlDocumentationLink || "")}
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
};

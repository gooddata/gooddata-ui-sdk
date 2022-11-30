// (C) 2020-2022 GoodData Corporation
import React, { useState } from "react";
import { IntlShape, useIntl } from "react-intl";
import { Button, Dropdown, IAlignPoint } from "@gooddata/sdk-ui-kit";
import { IAttributeDescriptor, IAttributeDisplayFormMetadataObject, ObjRef } from "@gooddata/sdk-model";
import {
    isDrillToAttributeUrlConfig,
    isDrillToCustomUrlConfig,
    UrlDrillTarget,
} from "../../../../drill/types";
import { CustomUrlSection } from "../../../../drill/DrillConfigPanel/DrillToUrl/CustomUrlSection";
import { CustomUrlEditor } from "../../../../drill/DrillConfigPanel/DrillToUrl/CustomUrlEditor";
import { useClientWorkspaceIdentifiers } from "@gooddata/sdk-ui";
import { AttributeUrlSection } from "../../../../drill/DrillConfigPanel/DrillToUrl/AttributeUrlSection";
import {
    selectAllCatalogDisplayFormsMap,
    useDashboardSelector,
    selectBackendCapabilities,
    selectSettings,
} from "../../../../../model";
import { ObjRefMap } from "../../../../../_staging/metadata/objRefMap";

import { useInvalidAttributeDisplayFormIdentifiers } from "./useInvalidAttributeDisplayFormIdentifier";
import { useAttributesWithDisplayForms } from "./useAttributesWithDisplayForms";

const getButtonValue = (
    urlDrillTarget: UrlDrillTarget | undefined,
    attributeDisplayForms: ObjRefMap<IAttributeDisplayFormMetadataObject>,
    intl: IntlShape,
) => {
    if (isDrillToCustomUrlConfig(urlDrillTarget) && urlDrillTarget.customUrl) {
        return urlDrillTarget.customUrl;
    }

    if (
        isDrillToAttributeUrlConfig(urlDrillTarget) &&
        urlDrillTarget.drillToAttributeDisplayForm &&
        urlDrillTarget.insightAttributeDisplayForm
    ) {
        const drillToAttributeDisplayForm = attributeDisplayForms.get(
            urlDrillTarget.drillToAttributeDisplayForm,
        );
        const insightAttributeDisplayForm = attributeDisplayForms.get(
            urlDrillTarget.insightAttributeDisplayForm,
        );

        return `${insightAttributeDisplayForm?.title} (${drillToAttributeDisplayForm?.title})`;
    }

    return intl.formatMessage({ id: "configurationPanel.drillIntoUrl.defaultButtonValue" });
};

const dropdownAlignPoints: IAlignPoint[] = [{ align: "bl tl" }, { align: "tl bl" }];

export interface DrillUrlItemProps {
    urlDrillTarget?: UrlDrillTarget;
    attributes: IAttributeDescriptor[];
    onSelect: (selectedTarget: UrlDrillTarget) => void;
}

export const DrillTargetUrlItem: React.FunctionComponent<DrillUrlItemProps> = (props) => {
    const { onSelect, urlDrillTarget } = props;

    const capabilities = useDashboardSelector(selectBackendCapabilities);
    const settings = useDashboardSelector(selectSettings);

    const { allDisplayForms: targetAttributesFormsAll, linkDisplayForms: targetAttributesFormsWithLinks } =
        useAttributesWithDisplayForms();

    const invalidAttributeDisplayFormIdentifiers = useInvalidAttributeDisplayFormIdentifiers(urlDrillTarget);

    const intl = useIntl();

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
    const displayForms = useDashboardSelector(selectAllCatalogDisplayFormsMap);

    const buttonValue = getButtonValue(urlDrillTarget, displayForms, intl);

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
                                closeDropdown={closeDropdown}
                            />
                        ) : null}
                        <CustomUrlSection
                            {...props}
                            urlDrillTarget={urlDrillTarget}
                            toggleModal={toggleModal}
                            closeDropdown={closeDropdown}
                        />
                    </div>
                )}
            />

            {showModal ? (
                <CustomUrlEditor
                    urlDrillTarget={urlDrillTarget}
                    attributeDisplayForms={targetAttributesFormsAll}
                    invalidAttributeDisplayFormIdentifiers={invalidAttributeDisplayFormIdentifiers}
                    documentationLink={String(settings.drillIntoUrlDocumentationLink || "")}
                    enableClientIdParameter={!!client}
                    enableDataProductIdParameter={!!dataProduct}
                    enableWidgetIdParameter={!!capabilities.supportsWidgetEntity}
                    onSelect={onCustomUrlHandler}
                    onClose={toggleModal}
                />
            ) : null}
        </>
    );
};

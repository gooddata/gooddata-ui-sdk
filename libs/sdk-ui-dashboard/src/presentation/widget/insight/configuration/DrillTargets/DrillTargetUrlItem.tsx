// (C) 2020-2022 GoodData Corporation
import React, { useState } from "react";
import { IntlShape, useIntl } from "react-intl";
import { Button, Dropdown } from "@gooddata/sdk-ui-kit";
import {
    IAttributeDescriptor,
    IAttributeDisplayFormMetadataObject,
    isCatalogAttribute,
    ObjRef,
} from "@gooddata/sdk-model";
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
    selectAllCatalogAttributesMap,
    selectAllCatalogDisplayFormsMap,
    selectDrillTargetsByWidgetRef,
    selectSelectedWidgetRef,
    useDashboardSelector,
    selectImplicitDrillsToUrlByWidgetRef,
} from "../../../../../model";
import invariant from "ts-invariant";
import { ObjRefMap } from "../../../../../_staging/metadata/objRefMap";

const getButtonValue = (
    urlDrillTarget: UrlDrillTarget,
    attributeDisplayForms: ObjRefMap<IAttributeDisplayFormMetadataObject>,
    attributeDisplayFormsLoading: boolean,
    intl: IntlShape,
) => {
    if (isDrillToCustomUrlConfig(urlDrillTarget) && urlDrillTarget.customUrl) {
        return urlDrillTarget.customUrl;
    } else if (
        isDrillToAttributeUrlConfig(urlDrillTarget) &&
        urlDrillTarget.drillToAttributeDisplayForm &&
        urlDrillTarget.insightAttributeDisplayForm
    ) {
        if (attributeDisplayFormsLoading) {
            return intl.formatMessage({ id: "dropdown.loading" });
        }
        const drillToAttributeDisplayForm = attributeDisplayForms.get(
            urlDrillTarget.drillToAttributeDisplayForm,
        );
        const insightAttributeDisplayForm = attributeDisplayForms.get(
            urlDrillTarget.insightAttributeDisplayForm,
        );

        return `${insightAttributeDisplayForm?.title} (${drillToAttributeDisplayForm?.title})`;
    } else {
        return intl.formatMessage({ id: "configurationPanel.drillIntoUrl.defaultButtonValue" });
    }
};

const dropdownAlignPoints = [
    {
        align: "bl tl",
    },
    {
        align: "tl bl",
    },
];

export interface DrillUrlItemProps {
    urlDrillTarget?: UrlDrillTarget;
    attributes: IAttributeDescriptor[];
    onSelect: (selectedTarget: UrlDrillTarget) => void;
}

export const DrillTargetUrlItem: React.FunctionComponent<DrillUrlItemProps> = (props) => {
    const { onSelect, urlDrillTarget } = props;

    const attributeDisplayFormsLoading = false; // todo
    const supportsAttributeHyperlinks = true; // todo
    const widgetRef = useDashboardSelector(selectSelectedWidgetRef);
    invariant(widgetRef, "mush have selected widget");
    const attributeUrlDisplayForms = useDashboardSelector(selectImplicitDrillsToUrlByWidgetRef(widgetRef));
    const drillTargets = useDashboardSelector(selectDrillTargetsByWidgetRef(widgetRef));
    const allAttributes = useDashboardSelector(selectAllCatalogAttributesMap);

    const targetAttributes = drillTargets?.availableDrillTargets?.attributes?.map((drillTarget) =>
        allAttributes.get({ identifier: drillTarget.attribute.attributeHeader.formOf.identifier }),
    );
    const targetAttributesForms = targetAttributes?.flatMap((item) =>
        isCatalogAttribute(item) ? item.displayForms : [],
    );

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

    if (!urlDrillTarget) {
        return null;
    }

    const buttonValue = getButtonValue(urlDrillTarget, displayForms, attributeDisplayFormsLoading, intl);

    return (
        <>
            <Dropdown
                alignPoints={dropdownAlignPoints}
                renderButton={({ toggleDropdown }) => (
                    <Button
                        onClick={toggleDropdown}
                        className="gd-button gd-button-primary button-dropdown dropdown-button gd-button-small s-drill-to-url-button"
                        // iconRight={dropdownIconRight} // TODO
                        value={buttonValue}
                    />
                )}
                renderBody={({ closeDropdown }) => (
                    <div className="gd-menu-wrapper gd-drill-to-url-body gd-drill-to-url-list s-gd-drill-to-url-body">
                        {supportsAttributeHyperlinks && (
                            <AttributeUrlSection
                                attributeDisplayForms={attributeUrlDisplayForms}
                                onSelect={(insightAttributeDisplayForm, drillToAttributeDisplayForm) => {
                                    onAttributeUrlHandler(
                                        insightAttributeDisplayForm,
                                        drillToAttributeDisplayForm,
                                    );
                                    closeDropdown();
                                }}
                                loading={attributeDisplayFormsLoading}
                                selected={
                                    isDrillToAttributeUrlConfig(urlDrillTarget) &&
                                    urlDrillTarget.drillToAttributeDisplayForm
                                }
                                closeDropdown={closeDropdown}
                            />
                        )}
                        <CustomUrlSection
                            {...props}
                            urlDrillTarget={urlDrillTarget}
                            toggleModal={toggleModal}
                            closeDropdown={closeDropdown}
                        />
                    </div>
                )}
            />

            {showModal && (
                <CustomUrlEditor
                    urlDrillTarget={urlDrillTarget}
                    attributeDisplayForms={targetAttributesForms}
                    invalidAttributeDisplayFormIdentifiers={[]} // TODO
                    loadingAttributeDisplayForms={attributeDisplayFormsLoading}
                    documentationLink={""} // TODO
                    enableClientIdParameter={!!client}
                    enableDataProductIdParameter={!!dataProduct}
                    enableWidgetIdParameter={true} // TODO
                    onSelect={onCustomUrlHandler}
                    onClose={toggleModal}
                />
            )}
        </>
    );
};

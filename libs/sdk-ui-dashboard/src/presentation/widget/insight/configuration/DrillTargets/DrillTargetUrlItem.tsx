// (C) 2020-2022 GoodData Corporation
import React, { useState } from "react";
import { IntlShape, useIntl } from "react-intl";
import { Button, Dropdown } from "@gooddata/sdk-ui-kit";
import { areObjRefsEqual, IAttributeDescriptor, isCatalogAttribute, ObjRef } from "@gooddata/sdk-model";
import {
    IAttributeDisplayForm,
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
    selectDrillTargetsByWidgetRef,
    selectSelectedWidgetRef,
    useDashboardSelector,
} from "../../../../../model";
import invariant from "ts-invariant";
import { selectImplicitDrillsToUrlByWidgetRef } from "../../../../../model/store/widgetDrills/widgetDrillSelectors";

const getButtonValue = (
    urlDrillTarget: UrlDrillTarget,
    attributeDisplayForms: IAttributeDisplayForm[],
    attributeDisplayFormsLoading: boolean,
    intl: IntlShape,
) => {
    if (isDrillToCustomUrlConfig(urlDrillTarget) && urlDrillTarget.customUrl) {
        return urlDrillTarget.customUrl;
    } else if (isDrillToAttributeUrlConfig(urlDrillTarget) && urlDrillTarget.drillToAttributeDisplayForm) {
        if (attributeDisplayFormsLoading) {
            return intl.formatMessage({ id: "dropdown.loading" });
        }
        const attributeDisplayForm = attributeDisplayForms.find((displayForm) =>
            areObjRefsEqual(displayForm.ref, urlDrillTarget.drillToAttributeDisplayForm),
        );

        if (!attributeDisplayForm) {
            return "";
        }

        return `${attributeDisplayForm.attributeTitle} (${attributeDisplayForm.displayFormTitle})`;
    } else {
        return intl.formatMessage({ id: "configurationPanel.drillIntoUrl.defaultButtonValue" });
    }
};

export interface IDrillUrlItemStateProps {}

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
    // documentationLink?: string;
    // attributeDisplayForms: IAttributeDisplayForm[];
    // attributeUrlDisplayForms: IAttributeDisplayForm[];
    // attributeDisplayFormsLoading: boolean;
    // enableClientIdParameter: boolean;
    // enableDataProductIdParameter: boolean;
    // enableWidgetIdParameter: boolean;
    // invalidAttributeDisplayFormIdentifiers: string[];
    // supportsAttributeHyperlinks: boolean;
}

export const DrillTargetUrlItem: React.FunctionComponent<DrillUrlItemProps> = (props) => {
    const {
        onSelect,
        urlDrillTarget,
        // documentationLink,
        // attributeDisplayForms,
        // attributeUrlDisplayForms,
        // attributeDisplayFormsLoading,
        // invalidAttributeDisplayFormIdentifiers,
        // enableClientIdParameter,
        // enableDataProductIdParameter,
        // enableWidgetIdParameter,
        // supportsAttributeHyperlinks,
    } = props;

    const attributeDisplayFormsLoading = false;
    const attributeUrlDisplayForms: IAttributeDisplayForm[] = [];
    const supportsAttributeHyperlinks = true;
    const widgetRef = useDashboardSelector(selectSelectedWidgetRef);
    invariant(widgetRef, "mush have selected widget");
    const attributeUrlDisplayFormsNew = useDashboardSelector(selectImplicitDrillsToUrlByWidgetRef(widgetRef));
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

    if (!urlDrillTarget) {
        return null;
    }

    const buttonValue = getButtonValue(
        urlDrillTarget,
        attributeUrlDisplayForms,
        attributeDisplayFormsLoading,
        intl,
    );

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
                                attributeDisplayForms={attributeUrlDisplayFormsNew}
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

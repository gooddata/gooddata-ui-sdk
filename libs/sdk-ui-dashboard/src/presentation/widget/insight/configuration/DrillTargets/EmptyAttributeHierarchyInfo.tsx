// (C) 2023-2025 GoodData Corporation

import React from "react";

import { FormattedMessage, useIntl } from "react-intl";

import { messages } from "@gooddata/sdk-ui";
import { Button } from "@gooddata/sdk-ui-kit";

import {
    selectCanManageAttributeHierarchy,
    useDashboardSelector,
    useDashboardUserInteraction,
} from "../../../../../model/index.js";

interface IEmptyAttributeHierarchyInfoProps {
    onOpenAttributeHierarchyDialog: () => void;
}

// TODO: the link will be hidden until the documentation is ready
//  the if condition should be removed then after the documentation is ready
const EMPTY_HIERARCHY_INFO_DOCUMENTATION_LINK = "";

function EmptyAttributeHierarchyInfo({ onOpenAttributeHierarchyDialog }: IEmptyAttributeHierarchyInfoProps) {
    const { formatMessage } = useIntl();
    const canManageAttributeHierarchy = useDashboardSelector(selectCanManageAttributeHierarchy);
    const userInteraction = useDashboardUserInteraction();

    const handleOpenAttributeHierarchyDialog = () => {
        userInteraction.attributeHierarchiesInteraction("attributeHierarchyDrillDownCreateClicked");
        onOpenAttributeHierarchyDialog();
    };

    const addAttributeHierarchyText = formatMessage(messages["createHierarchy"]);

    return (
        <>
            <div className="empty-attribute-hierarchy-info s-empty-attribute-hierarchy-info">
                <div className="empty-attribute-hierarchy-info-content s-empty-attribute-hierarchy-info-content">
                    <FormattedMessage id={messages["emptyHierarchyInfo"].id} tagName="span" />
                    {EMPTY_HIERARCHY_INFO_DOCUMENTATION_LINK ? (
                        <a
                            href={EMPTY_HIERARCHY_INFO_DOCUMENTATION_LINK}
                            className="gd-button-link-dimmed"
                            target="_blank"
                            rel="noreferrer"
                        >
                            <FormattedMessage id={messages["drillConfigLearnMore"].id} />
                        </a>
                    ) : null}
                </div>
                {canManageAttributeHierarchy ? (
                    <Button
                        className="gd-button-link gd-icon-plus gd-button-small add-attribute-hierarchy-button s-add-attribute-hierarchy-button"
                        value={addAttributeHierarchyText}
                        onClick={handleOpenAttributeHierarchyDialog}
                    />
                ) : null}
            </div>
        </>
    );
}

export default EmptyAttributeHierarchyInfo;

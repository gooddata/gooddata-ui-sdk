// (C) 2023 GoodData Corporation
import React from "react";
import {
    areObjRefsEqual,
    ICatalogAttributeHierarchy,
    isAttributeHierarchyReference,
    objRefToString,
} from "@gooddata/sdk-model";
import { Dropdown, DropdownButton } from "@gooddata/sdk-ui-kit";
import { messages } from "@gooddata/sdk-ui";

import { IDrillDownAttributeHierarchyConfig } from "../../../../drill/types.js";
import {
    selectIgnoredDrillDownHierarchiesByWidgetRef,
    selectCatalogAttributeHierarchies,
    useDashboardSelector,
} from "../../../../../model/index.js";
import { useIntl } from "react-intl";
import isEmpty from "lodash/isEmpty.js";
import { AttributeHierarchyList } from "./AttributeHierarchyList.js";

interface IDrillTargetDashboardItemProps {
    config: IDrillDownAttributeHierarchyConfig;
    onSelect: (targetItem: ICatalogAttributeHierarchy) => void;
}

const DROPDOWN_ALIGN_POINTS = [
    {
        align: "bl tl",
        offset: {
            x: 0,
            y: 4,
        },
    },
    {
        align: "tl bl",
        offset: {
            x: 0,
            y: -4,
        },
    },
];

const DrillTargetAttributeHierarchyItem: React.FC<IDrillTargetDashboardItemProps> = ({
    config,
    onSelect,
}) => {
    const intl = useIntl();
    const catalogAttributeHierarchies = useDashboardSelector(selectCatalogAttributeHierarchies);
    const ignoredDrillDownHierarchies = useDashboardSelector(
        selectIgnoredDrillDownHierarchiesByWidgetRef(config.widgetRef),
    );

    const attributeDescriptor = config.attributes.find(
        (attr) => attr.attributeHeader.localIdentifier === config.originLocalIdentifier,
    );

    let selectedCatalogAttributeHierarchy = config.complete
        ? catalogAttributeHierarchies.find((hierarchy) =>
              areObjRefsEqual(hierarchy.attributeHierarchy.ref, config.attributeHierarchyRef),
          )
        : null;

    const existBlacklistHierarchies = catalogAttributeHierarchies.filter((hierarchy) => {
        return ignoredDrillDownHierarchies.some((ref) => {
            if (isAttributeHierarchyReference(ref)) {
                return (
                    areObjRefsEqual(ref.attributeHierarchy, hierarchy.attributeHierarchy.ref) &&
                    objRefToString(ref.label) === attributeDescriptor?.attributeHeader.identifier
                );
            } else {
                return (
                    areObjRefsEqual(ref.dateHierarchyTemplate, hierarchy.attributeHierarchy.ref) &&
                    objRefToString(ref.dateDatasetAttribute) ===
                        attributeDescriptor?.attributeHeader.identifier
                );
            }
        });
    });

    const emptyHierarchyMessage = intl.formatMessage(messages.emtpyHierarchyInfo);
    const shouldShowEmptyMessage = isEmpty(existBlacklistHierarchies) && !config.complete;
    const buttonText =
        selectedCatalogAttributeHierarchy?.attributeHierarchy.title ??
        intl.formatMessage(messages.drilldownSelectHierarchy);
    return (
        <>
            {shouldShowEmptyMessage ? (
                <div className="drill-config-empty-hierarchy-target s-drill-config-empty-hierarchy-target">
                    {emptyHierarchyMessage}
                </div>
            ) : (
                <Dropdown
                    className="drill-config-hierarchy-target-select s-drill-config-hierarchy-target-select"
                    closeOnMouseDrag={false}
                    closeOnParentScroll={true}
                    closeOnOutsideClick={true}
                    alignPoints={DROPDOWN_ALIGN_POINTS}
                    renderButton={({ isOpen, toggleDropdown }) => (
                        <DropdownButton
                            value={buttonText}
                            onClick={toggleDropdown}
                            isOpen={isOpen}
                            isSmall={false}
                            disabled={config.complete}
                            iconLeft={config.complete ? "gd-icon-attribute-hierarchy" : ""}
                            className="gd-button-small s-visualization-button-target-hierarchy"
                        />
                    )}
                    renderBody={({ closeDropdown }) => {
                        return (
                            <AttributeHierarchyList
                                hierarchies={existBlacklistHierarchies}
                                onSelect={(hierarchy) => {
                                    onSelect(hierarchy);
                                    closeDropdown();
                                }}
                            />
                        );
                    }}
                />
            )}
        </>
    );
};

export default DrillTargetAttributeHierarchyItem;

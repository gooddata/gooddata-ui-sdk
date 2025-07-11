// (C) 2019-2025 GoodData Corporation
import React from "react";
import cx from "classnames";
import { IDashboardLayoutSizeByScreenSize } from "@gooddata/sdk-model";

import { IDashboardLayoutSectionFacade } from "../../../_staging/dashboard/flexibleLayout/index.js";
import { getRefsForSection } from "../refs.js";
import { useDashboardSelector, selectIsSectionInsertedByPlugin } from "../../../model/index.js";
import { SectionHotspot } from "../dragAndDrop/draggableWidget/SectionHotspot.js";
import { getLayoutConfiguration } from "../../../_staging/dashboard/flexibleLayout/layoutConfiguration.js";

import { SectionHeaderEditable } from "./EditableHeader/SectionHeaderEditable.js";

/**
 * @alpha
 */
export interface IDashboardLayoutSectionHeaderProps {
    section: IDashboardLayoutSectionFacade<unknown>;
    isEmptySection: boolean;
    parentLayoutItemSize: IDashboardLayoutSizeByScreenSize | undefined;
}

export const DashboardLayoutEditSectionHeader: React.FC<IDashboardLayoutSectionHeaderProps> = ({
    section,
    parentLayoutItemSize,
    isEmptySection,
}) => {
    const { sections } = getLayoutConfiguration(section.layout().raw());
    const refs = getRefsForSection(section);
    const isEditingDisabled = useDashboardSelector(selectIsSectionInsertedByPlugin(refs));
    if (isEmptySection) {
        return null;
    }
    const path = section.index();
    return (
        <div className="gd-fluid-layout-row-header s-fluid-layout-row-header">
            {path.parent && path.parent?.length >= 0 ? null : (
                <SectionHotspot index={path} targetPosition="above" itemSize={parentLayoutItemSize} />
            )}
            <div
                className={cx({
                    "gd-fluid-layout-row-header-container--with-headers": sections.areHeadersEnabled,
                    "gd-fluid-layout-row-header-container--no-headers": !sections.areHeadersEnabled,
                })}
            >
                {sections.areHeadersEnabled && !isEditingDisabled ? (
                    <SectionHeaderEditable
                        title={section.title()}
                        description={section.description()}
                        section={section}
                    />
                ) : null}
            </div>
        </div>
    );
};

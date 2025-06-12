// (C) 2019-2025 GoodData Corporation
import React from "react";
import cx from "classnames";
import { IDashboardLayoutSizeByScreenSize } from "@gooddata/sdk-model";

import { IDashboardLayoutSectionFacade } from "../../../_staging/dashboard/flexibleLayout/index.js";
import { getRefsForSection } from "../refs.js";
import { useDashboardSelector, selectIsSectionInsertedByPlugin } from "../../../model/index.js";
import { SectionHotspot } from "../dragAndDrop/draggableWidget/SectionHotspot.js";
import { useLayoutSectionsConfiguration } from "../../widget/common/useLayoutSectionsConfiguration.js";

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
    const { areSectionHeadersEnabled } = useLayoutSectionsConfiguration(section.layout().raw());
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
                    "gd-fluid-layout-row-header-container--with-headers": areSectionHeadersEnabled,
                    "gd-fluid-layout-row-header-container--no-headers": !areSectionHeadersEnabled,
                })}
            >
                {areSectionHeadersEnabled && !isEditingDisabled ? (
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

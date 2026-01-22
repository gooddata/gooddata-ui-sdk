// (C) 2019-2026 GoodData Corporation

import cx from "classnames";

import { type IDashboardLayoutSizeByScreenSize } from "@gooddata/sdk-model";

import { SectionHeaderEditable } from "./EditableHeader/SectionHeaderEditable.js";
import { type IDashboardLayoutSectionFacade } from "../../../_staging/dashboard/flexibleLayout/facade/interfaces.js";
import { getLayoutConfiguration } from "../../../_staging/dashboard/flexibleLayout/layoutConfiguration.js";
import { useDashboardSelector } from "../../../model/react/DashboardStoreProvider.js";
import { selectIsSectionInsertedByPlugin } from "../../../model/store/ui/uiSelectors.js";
import { SectionHotspot } from "../dragAndDrop/draggableWidget/SectionHotspot.js";
import { getRefsForSection } from "../refs.js";

/**
 * @alpha
 */
export interface IDashboardLayoutSectionHeaderProps {
    section: IDashboardLayoutSectionFacade<unknown>;
    isEmptySection: boolean;
    parentLayoutItemSize: IDashboardLayoutSizeByScreenSize | undefined;
}

export function DashboardLayoutEditSectionHeader({
    section,
    parentLayoutItemSize,
    isEmptySection,
}: IDashboardLayoutSectionHeaderProps) {
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
}

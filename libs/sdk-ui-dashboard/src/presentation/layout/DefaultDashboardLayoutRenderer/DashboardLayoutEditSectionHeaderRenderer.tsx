// (C) 2019-2022 GoodData Corporation
import * as React from "react";
import { DashboardLayoutItemRenderer } from "./DashboardLayoutItemRenderer";
import { DashboardLayoutSectionHeader } from "./DashboardLayoutSectionHeader";
import { IDashboardLayoutSectionHeaderRenderProps } from "./interfaces";
import { SectionHeaderEditable } from "./EditableHeader/SectionHeaderEditable";
import { emptyItemFacadeWithFullSize } from "./utils/emptyFacade";
import { SectionHotspot } from "../../dragAndDrop";

export function DashboardLayoutEditSectionHeaderRenderer(
    props: IDashboardLayoutSectionHeaderRenderProps<any>,
): JSX.Element | null {
    const { section, screen } = props;
    const sectionHeader = section.header();

    return sectionHeader ? (
        <DashboardLayoutItemRenderer
            DefaultItemRenderer={DashboardLayoutItemRenderer}
            item={emptyItemFacadeWithFullSize}
            screen={screen}
        >
            <DashboardLayoutSectionHeader
                title={sectionHeader.title}
                description={sectionHeader.description}
                renderBeforeHeader={<SectionHotspot index={section.index()} targetPosition="above" />}
                renderHeader={
                    <SectionHeaderEditable
                        title={sectionHeader.title || ""}
                        description={sectionHeader.description || ""}
                        index={section.index()}
                    />
                }
            />
        </DashboardLayoutItemRenderer>
    ) : null;
}

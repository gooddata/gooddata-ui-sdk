// (C) 2019-2022 GoodData Corporation
import * as React from "react";
import { DashboardLayoutItemRenderer } from "./DashboardLayoutItemRenderer";
import { DashboardLayoutSectionHeader } from "./DashboardLayoutSectionHeader";
import { IDashboardLayoutSectionHeaderRenderProps } from "./interfaces";
import { SectionHeaderEditable } from "./EditableHeader/SectionHeaderEditable";
import { emptyItemFacadeWithFullSize } from "./utils/emptyFacade";
import { SectionHotspot } from "../../dragAndDrop";
import { isPlaceholderWidget } from "../../../widgets";
import { DashboardLayoutSectionBorderLine } from "../../dragAndDrop/draggableWidget/DashboardLayoutSectionBorder";

export function DashboardLayoutEditSectionHeaderRenderer(
    props: IDashboardLayoutSectionHeaderRenderProps<any>,
): JSX.Element | null {
    const { section, screen } = props;
    const sectionHeader = section.header();

    // do not render the section hotspot if there is only one section in the layout and it has only placeholders in it
    const shouldRenderHotspot =
        section.index() > 0 || section.items().some((i) => !isPlaceholderWidget(i.widget()));

    return (
        <DashboardLayoutItemRenderer
            DefaultItemRenderer={DashboardLayoutItemRenderer}
            item={emptyItemFacadeWithFullSize}
            screen={screen}
        >
            <DashboardLayoutSectionHeader
                title={sectionHeader?.title}
                description={sectionHeader?.description}
                renderBeforeHeader={
                    shouldRenderHotspot ? (
                        <SectionHotspot index={section.index()} targetPosition="above" />
                    ) : (
                        <DashboardLayoutSectionBorderLine position="top" status="muted" />
                    )
                }
                renderHeader={
                    <SectionHeaderEditable
                        title={sectionHeader?.title || ""}
                        description={sectionHeader?.description || ""}
                        index={section.index()}
                    />
                }
            />
        </DashboardLayoutItemRenderer>
    );
}

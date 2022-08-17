// (C) 2019-2022 GoodData Corporation
import * as React from "react";
import { DashboardLayoutItemRenderer } from "./DashboardLayoutItemRenderer";
import { DashboardLayoutSectionHeader } from "./DashboardLayoutSectionHeader";
import { IDashboardLayoutSectionHeaderRenderProps } from "./interfaces";
import { SectionHeaderEditable } from "./EditableHeader/SectionHeaderEditable";
import { emptyItemFacadeWithFullSize } from "./utils/emptyFacade";
import { SectionHotspot } from "../../dragAndDrop";
import { isInitialPlaceholderWidget } from "../../../widgets";

export function DashboardLayoutEditSectionHeaderRenderer(
    props: IDashboardLayoutSectionHeaderRenderProps<any>,
): JSX.Element | null {
    const { section, screen } = props;
    const sectionHeader = section.header();

    const isInitialDropzone =
        section.index() === 0 && section.items().every((i) => isInitialPlaceholderWidget(i.widget()));

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
                    !isInitialDropzone && <SectionHotspot index={section.index()} targetPosition="above" />
                }
                renderHeader={
                    !isInitialDropzone && (
                        <SectionHeaderEditable
                            title={sectionHeader?.title || ""}
                            description={sectionHeader?.description || ""}
                            index={section.index()}
                        />
                    )
                }
            />
        </DashboardLayoutItemRenderer>
    );
}

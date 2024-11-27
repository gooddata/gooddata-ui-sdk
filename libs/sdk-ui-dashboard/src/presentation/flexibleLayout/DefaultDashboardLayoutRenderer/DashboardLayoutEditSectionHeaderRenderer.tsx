// (C) 2019-2024 GoodData Corporation
import * as React from "react";

import { isInitialPlaceholderWidget } from "../../../widgets/index.js";
import { DashboardLayoutItemViewRenderer } from "./DashboardLayoutItemViewRenderer.js";
import { getRefsForSection } from "../refs.js";
import { selectIsSectionInsertedByPlugin, useDashboardSelector } from "../../../model/index.js";

import { DashboardLayoutSectionHeader } from "./DashboardLayoutSectionHeader.js";
import { IDashboardLayoutSectionHeaderRenderProps } from "./interfaces.js";
import { SectionHeaderEditable } from "./EditableHeader/SectionHeaderEditable.js";
import { buildEmptyItemFacadeWithSetSize } from "./utils/emptyFacade.js";
import { determineWidthForScreen } from "../../../_staging/layout/sizing.js";
import { useScreenSize } from "../../dashboard/components/DashboardScreenSizeContext.js";
import { SectionHotspot } from "../dragAndDrop/draggableWidget/SectionHotspot.js";

export function DashboardLayoutEditSectionHeaderRenderer(
    props: IDashboardLayoutSectionHeaderRenderProps<any>,
): JSX.Element | null {
    const { section, parentLayoutItemSize } = props;
    const sectionHeader = section.header();
    const screen = useScreenSize();

    const isInitialDropzone =
        section.isFirst() && section.items().every((i) => isInitialPlaceholderWidget(i.widget()));

    const refs = getRefsForSection(section);
    const isEditingDisabled = useDashboardSelector(selectIsSectionInsertedByPlugin(refs));

    const gridWidth = determineWidthForScreen(screen, parentLayoutItemSize);
    const emptyItem = buildEmptyItemFacadeWithSetSize(gridWidth, section.index());

    return (
        <DashboardLayoutItemViewRenderer
            DefaultItemRenderer={DashboardLayoutItemViewRenderer}
            item={emptyItem}
        >
            <DashboardLayoutSectionHeader
                title={sectionHeader?.title}
                description={sectionHeader?.description}
                renderBeforeHeader={
                    !isInitialDropzone && (
                        <SectionHotspot
                            index={section.index()}
                            targetPosition="above"
                            itemSize={parentLayoutItemSize}
                        />
                    )
                }
                renderHeader={
                    !isInitialDropzone && !isEditingDisabled ? (
                        <SectionHeaderEditable
                            title={sectionHeader?.title || ""}
                            description={sectionHeader?.description || ""}
                            section={section.index()}
                        />
                    ) : undefined
                }
            />
        </DashboardLayoutItemViewRenderer>
    );
}

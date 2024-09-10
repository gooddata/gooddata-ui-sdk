// (C) 2019-2024 GoodData Corporation
import * as React from "react";
import { DashboardLayoutSectionHeader } from "./DashboardLayoutSectionHeader.js";
import { IDashboardLayoutSectionHeaderRenderProps } from "./interfaces.js";
import { SectionHeaderEditable } from "./EditableHeader/SectionHeaderEditable.js";
import { buildEmptyItemFacadeWithSetSize } from "./utils/emptyFacade.js";
import { SectionHotspot } from "../../dragAndDrop/index.js";
import { isInitialPlaceholderWidget } from "../../../widgets/index.js";
import { DashboardLayoutItemViewRenderer } from "./DashboardLayoutItemViewRenderer.js";
import { getRefsForSection } from "../refs.js";
import { selectIsSectionInsertedByPlugin, useDashboardSelector } from "../../../model/index.js";
import { useMemo } from "react";
import { GRID_COLUMNS_COUNT } from "./constants.js";
import { implicitLayoutItemSizeFromXlSize } from "./utils/sizing.js";

export function DashboardLayoutEditSectionHeaderRenderer(
    props: IDashboardLayoutSectionHeaderRenderProps<any>,
): JSX.Element | null {
    const { section, screen } = props;
    const sectionHeader = section.header();

    const isInitialDropzone =
        section.index() === 0 && section.items().every((i) => isInitialPlaceholderWidget(i.widget()));

    const refs = getRefsForSection(section);
    const isEditingDisabled = useDashboardSelector(selectIsSectionInsertedByPlugin(refs));

    // TODO handle undefined size?
    const possibleSectionSizes = implicitLayoutItemSizeFromXlSize(section.raw().size!);
    const sectionSize = possibleSectionSizes[screen];

    const gridWith = sectionSize?.gridWidth ?? GRID_COLUMNS_COUNT;

    const emptyItem = useMemo(() => {
        return buildEmptyItemFacadeWithSetSize(gridWith);
    }, [gridWith]);

    return (
        <DashboardLayoutItemViewRenderer
            DefaultItemRenderer={DashboardLayoutItemViewRenderer}
            item={emptyItem}
            screen={screen}
        >
            <DashboardLayoutSectionHeader
                title={sectionHeader?.title}
                description={sectionHeader?.description}
                renderBeforeHeader={
                    !isInitialDropzone && <SectionHotspot index={section.index()} targetPosition="above" />
                }
                renderHeader={
                    !isInitialDropzone && !isEditingDisabled ? (
                        <SectionHeaderEditable
                            title={sectionHeader?.title || ""}
                            description={sectionHeader?.description || ""}
                            index={section.index()}
                        />
                    ) : undefined
                }
            />
        </DashboardLayoutItemViewRenderer>
    );
}

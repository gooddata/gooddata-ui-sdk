// (C) 2022-2025 GoodData Corporation
import {
    useDashboardSelector,
    useDashboardDispatch,
    selectWidgetsOverlayState,
    selectSectionModification,
    uiActions,
} from "../../../model/index.js";
import { IDashboardLayoutSectionFacade } from "../../../_staging/dashboard/legacyFluidLayout/index.js";
import { getRefsForSection } from "../refs.js";
import { DashboardItemOverlay } from "./DashboardItemOverlay.js";

interface IDashboardLayoutSectionOverlayControllerProps {
    section: IDashboardLayoutSectionFacade<unknown>;
}

export function DashboardLayoutSectionOverlayController({
    section,
}: IDashboardLayoutSectionOverlayControllerProps) {
    const dispatch = useDashboardDispatch();

    const refs = getRefsForSection(section);
    const overlayShow = useDashboardSelector(selectWidgetsOverlayState(refs));
    const sectionModifications = useDashboardSelector(selectSectionModification(refs));
    return (
        <DashboardItemOverlay
            type="column"
            onHide={() =>
                dispatch(
                    uiActions.toggleWidgetsOverlay({
                        refs: section.items().map((item) => item.ref()),
                        visible: false,
                    }),
                )
            }
            render={overlayShow}
            modifications={sectionModifications}
        />
    );
}

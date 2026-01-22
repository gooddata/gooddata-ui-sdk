// (C) 2022-2026 GoodData Corporation

import { DashboardItemOverlay } from "./DashboardItemOverlay.js";
import { type IDashboardLayoutSectionFacade } from "../../../_staging/dashboard/flexibleLayout/facade/interfaces.js";
import { useDashboardDispatch, useDashboardSelector } from "../../../model/react/DashboardStoreProvider.js";
import { uiActions } from "../../../model/store/ui/index.js";
import { selectSectionModification, selectWidgetsOverlayState } from "../../../model/store/ui/uiSelectors.js";
import { getRefsForSection } from "../refs.js";

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

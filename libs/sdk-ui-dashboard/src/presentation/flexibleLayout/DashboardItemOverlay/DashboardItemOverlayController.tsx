// (C) 2022-2025 GoodData Corporation

import { DashboardItemOverlay } from "./DashboardItemOverlay.js";
import { IDashboardLayoutSectionFacade } from "../../../_staging/dashboard/flexibleLayout/index.js";
import {
    selectSectionModification,
    selectWidgetsOverlayState,
    uiActions,
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../model/index.js";
import { getRefsForSection } from "../refs.js";

interface IDashboardLayoutSectionOverlayControllerProps {
    section: IDashboardLayoutSectionFacade<unknown>;
}

export function DashboardLayoutSectionOverlayController(
    props: IDashboardLayoutSectionOverlayControllerProps,
) {
    const { section } = props;
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

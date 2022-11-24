// (C) 2022 GoodData Corporation
import React from "react";
import {
    useDashboardSelector,
    useDashboardDispatch,
    selectWidgetsOverlayState,
    selectSectionModification,
    uiActions,
} from "../../../model";

import { IDashboardLayoutSectionFacade } from "../../../_staging/dashboard/fluidLayout";
import { getRefsForSection } from "../refs";

import { DashboardItemOverlay } from "./DashboardItemOverlay";

interface IDashboardLayoutSectionOverlayControllerProps {
    section: IDashboardLayoutSectionFacade<unknown>;
}

export const DashboardLayoutSectionOverlayController: React.FC<
    IDashboardLayoutSectionOverlayControllerProps
> = (props) => {
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
                        visible: false,
                        refs: section.items().map((item) => item.ref()),
                    }),
                )
            }
            render={overlayShow}
            modifications={sectionModifications}
        />
    );
};

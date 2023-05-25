// (C) 2022-2023 GoodData Corporation
import React from "react";
import {
    useDashboardSelector,
    useDashboardDispatch,
    selectWidgetsOverlayState,
    selectSectionModification,
    uiActions,
} from "../../../model/index.js";
import { IDashboardLayoutSectionFacade } from "../../../_staging/dashboard/fluidLayout/index.js";
import { getRefsForSection } from "../refs.js";
import { DashboardItemOverlay } from "./DashboardItemOverlay.js";

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
                        refs: section.items().map((item) => item.ref()),
                        visible: false,
                    }),
                )
            }
            render={overlayShow}
            modifications={sectionModifications}
        />
    );
};

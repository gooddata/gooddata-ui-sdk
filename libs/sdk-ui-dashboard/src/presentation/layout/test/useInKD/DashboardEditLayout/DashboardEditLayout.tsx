// (C) 2007-2022 GoodData Corporation
import { objRefToString } from "@gooddata/sdk-model";
import React, { Fragment } from "react";

import { DashboardLayout } from "../../../DefaultDashboardLayoutRenderer/DashboardLayout.js";
import { DashboardEditLayoutItemRenderer } from "./DashboardEditLayoutItemRenderer.js";
import { DashboardEditLayoutRowRenderer } from "./DashboardEditLayoutRowRenderer.js";
import { DashboardEditLayoutSectionHeaderRenderer } from "./DashboardEditLayoutSectionHeaderRenderer.js";
import { DashboardEditLayoutSectionRenderer } from "./DashboardEditLayoutSectionRenderer.js";
import { IDashboardEditLayout } from "./DashboardEditLayoutTypes.js";
import { DashboardEditLayoutWidgetRenderer } from "./DashboardEditLayoutWidgetRenderer.js";

export interface IDashboardEditLayoutStateProps {
    isDragging?: boolean;
    isResizingColumn?: boolean;
    isResizingRow?: boolean;
    shouldRenderSectionHotspots?: boolean;
    layout: IDashboardEditLayout;
    rowIdsByRowOrder?: any;
    isEnableKDWidgetCustomHeight?: boolean;
    shouldUseRowRenderer?: boolean;
    isEditMode?: boolean;
}

export interface IDashboardEditLayoutDispatchProps {
    removeDropZones?: () => void;
}

export type IDashboardEditLayoutProps = IDashboardEditLayoutStateProps & IDashboardEditLayoutDispatchProps;

export const RenderDashboardEditLayout: React.FC<IDashboardEditLayoutProps> = (props) => {
    const { layout, rowIdsByRowOrder, shouldUseRowRenderer } = props;

    return (
        layout && (
            <DashboardLayout
                layout={layout}
                sectionKeyGetter={(p) =>
                    rowIdsByRowOrder?.[p.section.index()] ?? p.section.index().toString()
                }
                sectionRenderer={(renderProps) => <DashboardEditLayoutSectionRenderer {...renderProps} />}
                sectionHeaderRenderer={(renderProps) => (
                    <DashboardEditLayoutSectionHeaderRenderer {...renderProps} />
                )}
                itemKeyGetter={(p) =>
                    // We want to rerender kpi/insight, when we resize the widget (to recalculate rendered visualization size).
                    objRefToString(p.item.widget()!.ref) + p.item.sizeForScreen(p.screen)!.gridWidth
                }
                itemRenderer={(renderProps) => <DashboardEditLayoutItemRenderer {...renderProps} />}
                widgetRenderer={(renderProps) => <DashboardEditLayoutWidgetRenderer {...renderProps} />}
                gridRowRenderer={(renderProps) =>
                    shouldUseRowRenderer ? (
                        <DashboardEditLayoutRowRenderer
                            layoutItems={renderProps.items}
                            screen={renderProps.screen}
                            section={renderProps.section}
                        >
                            {renderProps.children}
                        </DashboardEditLayoutRowRenderer>
                    ) : (
                        <Fragment>{renderProps.children}</Fragment>
                    )
                }
            />
        )
    );
};

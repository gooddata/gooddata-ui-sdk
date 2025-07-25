// (C) 2007-2025 GoodData Corporation
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

const screen = "xl"; // Todo: figure out what this was supposed to be?

export const RenderDashboardEditLayout: React.FC<IDashboardEditLayoutProps> = (props) => {
    const { layout, rowIdsByRowOrder, shouldUseRowRenderer } = props;

    return (
        layout && (
            // @ts-ignore
            <DashboardLayout
                layout={layout}
                sectionKeyGetter={(p) =>
                    rowIdsByRowOrder?.[p.section.index() as unknown as number] ?? p.section.index().toString()
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
                            screen={screen}
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

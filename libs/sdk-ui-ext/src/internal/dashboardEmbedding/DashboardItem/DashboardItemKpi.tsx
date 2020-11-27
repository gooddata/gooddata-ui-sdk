// (C) 2020 GoodData Corporation
import React from "react";
import cx from "classnames";

import { DashboardItemContent } from "./DashboardItemContent";
import { DashboardItemContentWrapper } from "./DashboardItemContentWrapper";

interface IDashboardItemKpiProps {
    /**
     * Render prop for the content itself.
     */
    children: (params: { clientWidth: number }) => React.ReactNode;
    /**
     * Render prop for the item headline.
     */
    renderHeadline?: () => React.ReactNode;
    /**
     * Render prop for content rendered inside the main content before the kpi container.
     */
    renderBeforeKpi?: () => React.ReactNode;
    /**
     * Render prop for content rendered inside the main content after the kpi container.
     */
    renderAfterKpi?: () => React.ReactNode;
    /**
     * Render prop for content rendered before the main content.
     */
    renderBeforeContent?: () => React.ReactNode;
    /**
     * Render prop for content rendered after the main content.
     */
    renderAfterContent?: () => React.ReactNode;
    /**
     * Class name applied to the main content.
     */
    contentClassName?: string;
    /**
     * Class name applied to the kpi container.
     */
    kpiClassName?: string;
    /**
     * Ref forwarded to the main content container.
     */
    contentRef?: React.Ref<HTMLDivElement>;
}

export const DashboardItemKpi: React.FC<IDashboardItemKpiProps> = ({
    children,
    contentClassName,
    kpiClassName,
    renderHeadline = () => null,
    renderBeforeKpi = () => null,
    renderAfterKpi = () => null,
    renderBeforeContent = () => null,
    renderAfterContent = () => null,
    contentRef,
}) => {
    return (
        <DashboardItemContentWrapper>
            {({ clientWidth }) => (
                <>
                    {renderBeforeContent()}
                    <DashboardItemContent className={contentClassName} ref={contentRef}>
                        {renderBeforeKpi()}
                        <div className={cx("kpi", kpiClassName)}>
                            {renderHeadline()}
                            {children({ clientWidth })}
                        </div>
                        {renderAfterKpi()}
                    </DashboardItemContent>
                    {renderAfterContent()}
                </>
            )}
        </DashboardItemContentWrapper>
    );
};

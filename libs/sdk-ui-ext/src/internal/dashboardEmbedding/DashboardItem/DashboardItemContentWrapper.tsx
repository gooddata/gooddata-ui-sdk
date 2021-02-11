// (C) 2020 GoodData Corporation
import React, { forwardRef, memo } from "react";
import Measure from "react-measure";

interface IDashboardItemContentWrapperProps {
    children: (params: { clientWidth: number }) => React.ReactNode;
}

interface IDashboardItemContentWrapperMeasureProxyProps extends IDashboardItemContentWrapperProps {
    clientWidth: number;
}

// this is to make sure the item content re-renders only when width changes, nothing else
// as we do not pass anything other than width down to the children,
// but react-measure re-renders on any change to the client rect
const DashboardItemContentWrapperMeasureProxy = memo(
    forwardRef<HTMLDivElement, IDashboardItemContentWrapperMeasureProxyProps>(
        ({ children, clientWidth }, ref) => {
            return (
                <div className="dash-item-content-wrapper" ref={ref}>
                    {children({ clientWidth })}
                </div>
            );
        },
    ),
);
DashboardItemContentWrapperMeasureProxy.displayName = "DashboardItemContentWrapperMeasureProxy";

export const DashboardItemContentWrapper: React.FC<IDashboardItemContentWrapperProps> = ({ children }) => {
    return (
        <Measure client>
            {({ measureRef, contentRect }) => (
                <DashboardItemContentWrapperMeasureProxy
                    ref={measureRef}
                    clientWidth={contentRect.client?.width}
                >
                    {children}
                </DashboardItemContentWrapperMeasureProxy>
            )}
        </Measure>
    );
};

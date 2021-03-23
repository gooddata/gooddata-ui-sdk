// (C) 2020 GoodData Corporation
import React from "react";
import Measure from "react-measure";

interface IDashboardItemContentWrapperProps {
    children: (params: { clientWidth: number; clientHeight: number }) => React.ReactNode;
}

export const DashboardItemContentWrapper: React.FC<IDashboardItemContentWrapperProps> = ({ children }) => {
    return (
        <Measure client>
            {({ measureRef, contentRect }) => {
                return (
                    <div className="dash-item-content-wrapper" ref={measureRef}>
                        {children({
                            clientWidth: contentRect.client?.width,
                            clientHeight: contentRect.client?.height,
                        })}
                    </div>
                );
            }}
        </Measure>
    );
};

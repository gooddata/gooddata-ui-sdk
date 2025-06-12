// (C) 2020 GoodData Corporation
import React from "react";
import DefaultMeasure from "react-measure";
import { defaultImport } from "default-import";

// There are known compatibility issues between CommonJS (CJS) and ECMAScript modules (ESM).
// In ESM, default exports of CJS modules are wrapped in default properties instead of being exposed directly.
// https://github.com/microsoft/TypeScript/issues/52086#issuecomment-1385978414
const Measure = defaultImport(DefaultMeasure);

interface IDashboardItemContentWrapperProps {
    children: (params: {
        clientWidth: number | undefined;
        clientHeight: number | undefined;
    }) => React.ReactNode;
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

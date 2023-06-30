// (C) 2023 GoodData Corporation

import React, { ReactNode } from "react";

type ConfigDummySectionProps = {
    children: ReactNode;
};

export const ConfigDummySection: React.FC<ConfigDummySectionProps> = ({ children }) => {
    return (
        <div className={"adi-bucket-configuration"} aria-label="Configuration section">
            {children}
        </div>
    );
};

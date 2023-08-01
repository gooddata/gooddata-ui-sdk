// (C) 2023 GoodData Corporation

import React, { ReactNode } from "react";

type ConfigDummySectionProps = {
    id: string;
    children: ReactNode;
};

export const ConfigDummySection: React.FC<ConfigDummySectionProps> = ({ id, children }) => {
    const className = `adi-bucket-configuration s-config-section-${id}`;
    return (
        <div className={className} aria-label="Configuration section">
            {children}
        </div>
    );
};

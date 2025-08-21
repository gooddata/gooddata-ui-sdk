// (C) 2023-2025 GoodData Corporation

import React, { ReactNode } from "react";

type ConfigDummySectionProps = {
    id: string;
    children: ReactNode;
};

export function ConfigDummySection({ id, children }: ConfigDummySectionProps) {
    const className = `adi-bucket-configuration s-config-section-${id}`;
    return (
        <div className={className} aria-label="Configuration section">
            {children}
        </div>
    );
}

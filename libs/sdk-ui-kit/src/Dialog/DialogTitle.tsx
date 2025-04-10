// (C) 2022-2025 GoodData Corporation
import { Typography } from "../Typography/index.js";
import React from "react";

export const DialogTitle: React.FC<
    Partial<React.ComponentProps<typeof Typography>> & { children: React.ReactNode; id: string }
> = (overrideProps) => {
    return <Typography tagName="h3" className="gd-dialog-header-title" {...overrideProps} />;
};

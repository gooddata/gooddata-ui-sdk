// (C) 2025 GoodData Corporation
import { useState } from "react";
import { v4 as uuid } from "uuid";

export const useId = (): string => {
    const [id] = useState<string>(uuid());
    return id;
};

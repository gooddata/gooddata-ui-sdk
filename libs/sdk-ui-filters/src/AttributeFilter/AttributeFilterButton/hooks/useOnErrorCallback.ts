// (C) 2022 GoodData Corporation

import { useEffect, useMemo } from "react";

/**
 * Resolves errors for {@link AttributeFilterButton} component.
 */
export const useOnErrorCallback = (onError: (error: any) => void, errors: Array<any>) => {
    const error = useMemo(() => errors.find((error) => !!error), [errors]);
    return useEffect(() => {
        if (onError && error) {
            onError(error);
        }
    }, errors);
};

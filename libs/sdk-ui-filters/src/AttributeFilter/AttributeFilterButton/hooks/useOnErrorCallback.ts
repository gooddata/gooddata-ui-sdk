// (C) 2022 GoodData Corporation

import { useEffect } from "react";

export const useOnErrorCallback = (onError: (error: any) => void, errors: Array<any>) => {
    const error = errors.find((error) => !!error);
    return useEffect(() => {
        if (onError && error) {
            onError(error);
        }
    }, errors);
};

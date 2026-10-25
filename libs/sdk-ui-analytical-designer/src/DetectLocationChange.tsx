// (C) 2007-2026 GoodData Corporation

import { type PropsWithChildren, useEffect } from "react";

import { useDispatch } from "react-redux";
import { useLocation } from "react-router";

import { locationChanged } from "./store/router/router_actions.js";
import { type AppDispatch } from "./store/types.js";

export function DetectLocationChange({ children }: PropsWithChildren) {
    const location = useLocation();
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        const action = locationChanged(location.hash);
        dispatch(action);
    }, [location, dispatch]);

    return <>{children}</>;
}

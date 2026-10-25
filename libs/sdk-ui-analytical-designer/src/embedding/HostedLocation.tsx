// (C) 2026 GoodData Corporation

import { type PropsWithChildren, useEffect, useState } from "react";

import { useDispatch } from "react-redux";

import { locationChanged } from "../store/router/router_actions.js";
import { type AppDispatch } from "../store/types.js";

import { registerVirtualNavigate } from "./virtualLocation.js";

interface IHostedLocationProps {
    /** Mount-time location, a hash route anchored at "/". */
    initialLocation?: string;
}

// A fresh object per navigation, as a router yields: navigating to the current location must still
// dispatch LOCATION_CHANGED.
interface IVirtualLocation {
    hash: string;
}

function toVirtualLocation(to: string): IVirtualLocation {
    const hashStart = to.indexOf("#");
    return { hash: hashStart === -1 ? "" : to.slice(hashStart) };
}

/**
 * The location of a hosted-component AD, kept in state instead of a router: AD routes by hash only,
 * and a host with its own react-router tree cannot mount a second Router. Navigation arrives through
 * the virtual-navigate registration setLocation uses in hosted mode.
 */
export function HostedLocation({ initialLocation, children }: PropsWithChildren<IHostedLocationProps>) {
    const [location, setLocation] = useState(() => toVirtualLocation(initialLocation ?? "/"));
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => registerVirtualNavigate((to) => setLocation(toVirtualLocation(to))), []);

    useEffect(() => {
        dispatch(locationChanged(location.hash));
    }, [location, dispatch]);

    return <>{children}</>;
}

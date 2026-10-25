// (C) 2026 GoodData Corporation

import { useSelector } from "react-redux";

import { type IAppState } from "./types.js";

/**
 * Do not add a `useAppDispatch` here — components call `useDispatch<AppDispatch>()` from
 * react-redux directly. Vitest runs with `isolate: false`, so a module re-exporting a react-redux
 * hook is evaluated once per worker and links to whichever mock was installed first, making
 * dispatch assertions order-dependent. Prefer `useSelector` over `useAppSelector` for the same
 * reason.
 */
export const useAppSelector = <TSelected>(
    selector: (state: IAppState) => TSelected,
    equalityFn?: (left: TSelected, right: TSelected) => boolean,
): TSelected => useSelector(selector, equalityFn);

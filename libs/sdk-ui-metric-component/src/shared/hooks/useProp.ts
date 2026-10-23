// (C) 2021-2026 GoodData Corporation

import {
    type Dispatch,
    type MutableRefObject,
    type SetStateAction,
    useEffect,
    useRef,
    useState,
} from "react";

export function useProp<S>(defaultValue: S): [S, Dispatch<SetStateAction<S>>, MutableRefObject<boolean>] {
    const first = useRef(true);
    const [state, setState] = useState(defaultValue);

    useEffect(() => {
        first.current = false;
    }, []);
    useEffect(() => {
        if (!first.current) {
            setState(defaultValue);
        }
    }, [defaultValue]);
    return [state, setState, first];
}

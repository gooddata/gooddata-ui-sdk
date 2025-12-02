// (C) 2025 GoodData Corporation

import { ReactNode, createContext, useCallback, useContext, useMemo, useState } from "react";

import { GoodDataSdkError } from "@gooddata/sdk-ui";

interface IRuntimeErrorContext {
    runtimeError: GoodDataSdkError | undefined;
    setRuntimeError: (error: GoodDataSdkError | undefined) => void;
}

const RuntimeErrorContext = createContext<IRuntimeErrorContext | undefined>(undefined);

interface IRuntimeErrorProviderProps {
    children: ReactNode;
}

export function RuntimeErrorProvider({ children }: IRuntimeErrorProviderProps) {
    const [runtimeError, setRuntimeErrorState] = useState<GoodDataSdkError | undefined>(undefined);

    const setRuntimeError = useCallback((error: GoodDataSdkError | undefined) => {
        setRuntimeErrorState(error);
    }, []);

    const value = useMemo(
        () => ({
            runtimeError,
            setRuntimeError,
        }),
        [runtimeError, setRuntimeError],
    );

    return <RuntimeErrorContext.Provider value={value}>{children}</RuntimeErrorContext.Provider>;
}

export function useRuntimeError(): IRuntimeErrorContext {
    const context = useContext(RuntimeErrorContext);

    if (!context) {
        throw new Error("useRuntimeError must be used within RuntimeErrorProvider");
    }

    return context;
}

// (C) 2020-2021 GoodData Corporation
import invariant from "ts-invariant";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";

function ambientInvariantFactory<T>(itemName: string, providerName: string) {
    return (item: T | undefined | null, contextName: string): asserts item => {
        return invariant(
            item,
            `The ${itemName} in ${contextName} must be defined. Either pass it as a config prop or make sure there is a ${providerName} up the component tree.`,
        );
    };
}

export const backendInvariant: (
    item: IAnalyticalBackend | undefined | null,
    contextName: string,
) => asserts item = ambientInvariantFactory("backend", "BackendProvider");

export const workspaceInvariant: (
    item: string | undefined | null,
    contextName: string,
) => asserts item = ambientInvariantFactory("workspace", "WorkspaceProvider");

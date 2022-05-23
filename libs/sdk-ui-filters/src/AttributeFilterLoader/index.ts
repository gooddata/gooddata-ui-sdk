// (C) 2022 GoodData Corporation
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { IAttributeFilter } from "@gooddata/sdk-model";
import { EnhancedStore } from "@reduxjs/toolkit";
import { Task } from "redux-saga";

import { createAttributeFilterStore, AttributeFilterState, actions } from "./internal";

/**
 * @alpha
 */
export class AttributeFilterLoader {
    private store: EnhancedStore<AttributeFilterState>;
    private rootSagaTask: Task;

    private constructor(
        private readonly backend: IAnalyticalBackend,
        private readonly workspace: string,
        private readonly attributeFilter: IAttributeFilter,
    ) {
        this.initializeStore();
    }

    private initializeStore() {
        const { store, rootSagaTask } = createAttributeFilterStore({
            backend: this.backend,
            workspace: this.workspace,
            attributeFilter: this.attributeFilter,
            eventListener: (action, nextState) => {
                // eslint-disable-next-line no-console
                console.log("Action fired:", { action, nextState });

                // Concrete action listening
                if (actions.attributeElementsRequest.match(action)) {
                    // React somehow
                }
            },
        });
        this.store = store;
        this.rootSagaTask = rootSagaTask;
    }

    public static for(backend: IAnalyticalBackend, workspace: string, attributeFilter: IAttributeFilter) {
        return new AttributeFilterLoader(backend, workspace, attributeFilter);
    }

    public init() {
        this.store.dispatch(actions.init());
    }

    public reset() {
        this.rootSagaTask.cancel();
        this.initializeStore();
    }
}

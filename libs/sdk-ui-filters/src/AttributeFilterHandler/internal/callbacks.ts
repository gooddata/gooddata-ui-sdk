// (C) 2022 GoodData Corporation
import {
    actions,
    selectInvertableCommittedSelection,
    selectInvertableWorkingSelection,
    AttributeFilterHandlerEventListener,
} from "./redux/index.js";
import {
    Callback,
    CallbackRegistration,
    Unsubscribe,
    InvertableAttributeElementSelection,
    OnInitStartCallbackPayload,
    OnInitSuccessCallbackPayload,
    OnInitErrorCallbackPayload,
    OnInitCancelCallbackPayload,
    OnLoadAttributeStartCallbackPayload,
    OnLoadAttributeSuccessCallbackPayload,
    OnLoadAttributeErrorCallbackPayload,
    OnLoadAttributeCancelCallbackPayload,
    OnLoadInitialElementsPageStartCallbackPayload,
    OnLoadInitialElementsPageSuccessCallbackPayload,
    OnLoadInitialElementsPageErrorCallbackPayload,
    OnLoadInitialElementsPageCancelCallbackPayload,
    OnLoadNextElementsPageStartCallbackPayload,
    OnLoadNextElementsPageSuccessCallbackPayload,
    OnLoadNextElementsPageErrorCallbackPayload,
    OnLoadNextElementsPageCancelCallbackPayload,
    OnLoadCustomElementsStartCallbackPayload,
    OnLoadCustomElementsSuccessCallbackPayload,
    OnLoadCustomElementsErrorCallbackPayload,
    OnLoadCustomElementsCancelCallbackPayload,
    OnSelectionChangedCallbackPayload,
    OnSelectionCommittedCallbackPayload,
} from "../types/index.js";
import { GoodDataSdkError } from "@gooddata/sdk-ui";

const newCallbackRegistrations = () => {
    return {
        // Init
        initStart: newCallbackHandler<OnInitStartCallbackPayload>(),
        initSuccess: newCallbackHandler<OnInitSuccessCallbackPayload>(),
        initError: newCallbackHandler<OnInitErrorCallbackPayload>(),
        initCancel: newCallbackHandler<OnInitCancelCallbackPayload>(),

        // Attribute
        loadAttributeStart: newCallbackHandler<OnLoadAttributeStartCallbackPayload>(),
        loadAttributeSuccess: newCallbackHandler<OnLoadAttributeSuccessCallbackPayload>(),
        loadAttributeError: newCallbackHandler<OnLoadAttributeErrorCallbackPayload>(),
        loadAttributeCancel: newCallbackHandler<OnLoadAttributeCancelCallbackPayload>(),

        // Initial elements page
        loadInitialElementsPageStart: newCallbackHandler<OnLoadInitialElementsPageStartCallbackPayload>(),
        loadInitialElementsPageSuccess: newCallbackHandler<OnLoadInitialElementsPageSuccessCallbackPayload>(),
        loadInitialElementsPageError: newCallbackHandler<OnLoadInitialElementsPageErrorCallbackPayload>(),
        loadInitialElementsPageCancel: newCallbackHandler<OnLoadInitialElementsPageCancelCallbackPayload>(),

        // Next elements page
        loadNextElementsPageStart: newCallbackHandler<OnLoadNextElementsPageStartCallbackPayload>(),
        loadNextElementsPageSuccess: newCallbackHandler<OnLoadNextElementsPageSuccessCallbackPayload>(),
        loadNextElementsPageError: newCallbackHandler<OnLoadNextElementsPageErrorCallbackPayload>(),
        loadNextElementsPageCancel: newCallbackHandler<OnLoadNextElementsPageCancelCallbackPayload>(),

        // Custom elements
        loadCustomElementsStart: newCallbackHandler<OnLoadCustomElementsStartCallbackPayload>(),
        loadCustomElementsSuccess: newCallbackHandler<OnLoadCustomElementsSuccessCallbackPayload>(),
        loadCustomElementsError: newCallbackHandler<OnLoadCustomElementsErrorCallbackPayload>(),
        loadCustomElementsCancel: newCallbackHandler<OnLoadCustomElementsCancelCallbackPayload>(),

        // Selection
        selectionChanged:
            newCallbackHandler<OnSelectionChangedCallbackPayload<InvertableAttributeElementSelection>>(),
        selectionCommitted:
            newCallbackHandler<OnSelectionCommittedCallbackPayload<InvertableAttributeElementSelection>>(),

        update: newCallbackHandler<void>(),
    };
};
const newCallbackRegistrationsWithGlobalUnsubscribe = () => {
    const registeredCallbacks: Unsubscribe[] = [];

    const registrations = newCallbackRegistrations();

    const registerCallback = <T>(
        cb: Callback<T>,
        registerFn: {
            invoke: (payload: T) => void;
            subscribe: CallbackRegistration<T>;
        },
    ): Unsubscribe => {
        const registeredCallback = registerFn.subscribe(cb);
        registeredCallbacks.push(registeredCallback);
        return registeredCallback;
    };

    const unsubscribeAll = () => {
        registeredCallbacks.forEach((unsubscribe) => {
            unsubscribe();
        });
    };

    return {
        registrations,
        registerCallback,
        unsubscribeAll,
    };
};

function logError(activity: string, error: GoodDataSdkError): void {
    const cause = error.getCause();
    const formattedCause = cause ? `\nInner error: ${cause}` : "";
    console.error(`Error while ${activity}: ${error.getMessage()}${formattedCause}`);
}

/**
 * @internal
 */
export const newAttributeFilterCallbacks = () => {
    const { registerCallback, registrations, unsubscribeAll } =
        newCallbackRegistrationsWithGlobalUnsubscribe();

    const eventListener: AttributeFilterHandlerEventListener = (action, select) => {
        // Init
        if (actions.initStart.match(action)) {
            registrations.initStart.invoke(action.payload);
        } else if (actions.initSuccess.match(action)) {
            registrations.initSuccess.invoke(action.payload);
        } else if (actions.initError.match(action)) {
            logError("initializing", action.payload.error);
            registrations.initError.invoke(action.payload);
        } else if (actions.initCancel.match(action)) {
            registrations.initCancel.invoke(action.payload);
        }

        // Attribute
        if (actions.loadAttributeStart.match(action)) {
            registrations.loadAttributeStart.invoke(action.payload);
        } else if (actions.loadAttributeSuccess.match(action)) {
            registrations.loadAttributeSuccess.invoke(action.payload);
        } else if (actions.loadAttributeError.match(action)) {
            logError("loading attribute", action.payload.error);
            registrations.loadAttributeError.invoke(action.payload);
        } else if (actions.loadAttributeCancel.match(action)) {
            registrations.loadAttributeCancel.invoke(action.payload);
        }

        // Initial elements page
        if (actions.loadInitialElementsPageStart.match(action)) {
            registrations.loadInitialElementsPageStart.invoke(action.payload);
        } else if (actions.loadInitialElementsPageSuccess.match(action)) {
            registrations.loadInitialElementsPageSuccess.invoke(action.payload);
        } else if (actions.loadInitialElementsPageError.match(action)) {
            logError("loading initial elements page", action.payload.error);
            registrations.loadInitialElementsPageError.invoke(action.payload);
        } else if (actions.loadInitialElementsPageCancel.match(action)) {
            registrations.loadInitialElementsPageCancel.invoke(action.payload);
        }

        // Next elements page
        if (actions.loadNextElementsPageStart.match(action)) {
            registrations.loadNextElementsPageStart.invoke(action.payload);
        } else if (actions.loadNextElementsPageSuccess.match(action)) {
            registrations.loadNextElementsPageSuccess.invoke(action.payload);
        } else if (actions.loadNextElementsPageError.match(action)) {
            logError("loading next elements page", action.payload.error);
            registrations.loadNextElementsPageError.invoke(action.payload);
        } else if (actions.loadNextElementsPageCancel.match(action)) {
            registrations.loadNextElementsPageCancel.invoke(action.payload);
        }

        // Custom elements
        if (actions.loadCustomElementsStart.match(action)) {
            registrations.loadCustomElementsStart.invoke(action.payload);
        } else if (actions.loadCustomElementsSuccess.match(action)) {
            registrations.loadCustomElementsSuccess.invoke(action.payload);
        } else if (actions.loadCustomElementsError.match(action)) {
            logError("loading custom elements", action.payload.error);
            registrations.loadCustomElementsError.invoke(action.payload);
        } else if (actions.loadCustomElementsCancel.match(action)) {
            registrations.loadCustomElementsCancel.invoke(action.payload);
        }

        // Selection
        if (
            [
                actions.changeSelection.match,
                actions.revertSelection.match,
                actions.invertSelection.match,
                actions.clearSelection.match,
            ].some((m) => m(action))
        ) {
            registrations.selectionChanged.invoke({
                selection: select(selectInvertableWorkingSelection),
            });
        }
        if (actions.commitSelection.match(action)) {
            registrations.selectionCommitted.invoke({
                selection: select(selectInvertableCommittedSelection),
            });
        }

        if (
            [
                actions.initStart.match,
                actions.initSuccess.match,
                actions.initError.match,
                actions.initCancel.match,

                actions.loadAttributeStart.match,
                actions.loadAttributeSuccess.match,
                actions.loadAttributeError.match,
                actions.loadAttributeCancel.match,

                actions.loadInitialElementsPageStart.match,
                actions.loadInitialElementsPageSuccess.match,
                actions.loadInitialElementsPageError.match,
                actions.loadInitialElementsPageCancel.match,

                actions.loadNextElementsPageStart.match,
                actions.loadNextElementsPageSuccess.match,
                actions.loadNextElementsPageError.match,
                actions.loadNextElementsPageCancel.match,

                actions.changeSelection.match,
                actions.revertSelection.match,
                actions.invertSelection.match,
                actions.clearSelection.match,
                actions.commitSelection.match,

                actions.setLimit.match,
                actions.setOrder.match,
                actions.setSearch.match,
                actions.setLimitingMeasures.match,
                actions.setLimitingAttributeFilters.match,
                actions.setLimitingDateFilters.match,
            ].some((m) => m(action))
        ) {
            registrations.update.invoke();
        }
    };

    return {
        registrations,
        registerCallback,
        unsubscribeAll,
        eventListener,
    };
};

/**
 * @internal
 */
function newCallbackHandler<T>() {
    let subscribers: Array<Callback<T>> = [];

    const subscribe: CallbackRegistration<T> = (cb) => {
        subscribers.push(cb);
        return function unsubscribe() {
            subscribers = subscribers.filter((i) => i != cb);
        };
    };

    const invoke = (payload: T) => {
        subscribers.forEach((cb) => cb(payload));
    };

    return {
        invoke,
        subscribe,
    };
}

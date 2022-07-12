// (C) 2022 GoodData Corporation
import { IAttributeMetadataObject } from "@gooddata/sdk-model";
import {
    Callback,
    CallbackPayload,
    CallbackRegistration,
    Unsubscribe,
    IElementsLoadResult,
} from "../../types/common";
import { InvertableAttributeElementSelection } from "../../types";
import { actions } from "../../internal";
import { newCallbackHandler } from "../common";
import { AttributeFilterEventListener } from "../../internal/store/types";
import { selectInvertableCommitedSelection, selectInvertableWorkingSelection } from "./selectors";

const newCallbackRegistrations = () => {
    return {
        // Init
        initStart: newCallbackHandler(),
        initSuccess: newCallbackHandler(),
        initError: newCallbackHandler<{ error: Error }>(),
        initCancel: newCallbackHandler(),

        // Attribute
        attributeLoadStart: newCallbackHandler(),
        attributeLoadSuccess: newCallbackHandler<{ attribute: IAttributeMetadataObject }>(),
        attributeLoadError: newCallbackHandler<{ error: Error }>(),
        attributeLoadCancel: newCallbackHandler(),

        // Elements
        elementsRangeLoadStart: newCallbackHandler(),
        elementsRangeLoadSuccess: newCallbackHandler<IElementsLoadResult>(),
        elementsRangeLoadError: newCallbackHandler<{ error: Error }>(),
        elementsRangeLoadCancel: newCallbackHandler(),

        // Selection
        selectionChanged: newCallbackHandler<{ selection: InvertableAttributeElementSelection }>(),
        selectionCommited: newCallbackHandler<{ selection: InvertableAttributeElementSelection }>(),
    };
};
const newCallbackRegistrationsWithGlobalUnsubscribe = () => {
    const registeredCallbacks: Unsubscribe[] = [];

    const registrations = newCallbackRegistrations();

    const registerCallback = <T extends object, TCallback extends Callback<T>>(
        cb: TCallback,
        registerFn: {
            invoke: (payload: CallbackPayload<T>) => void;
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

/**
 * @internal
 */
export const newAttributeFilterCallbacks = () => {
    const { registerCallback, registrations, unsubscribeAll } =
        newCallbackRegistrationsWithGlobalUnsubscribe();

    const eventListener: AttributeFilterEventListener = (action, select) => {
        // Init

        if (actions.init.match(action)) {
            registrations.initStart.invoke({ correlation: action.payload.correlationId });
        } else if (actions.initSuccess.match(action)) {
            registrations.initSuccess.invoke({ correlation: action.payload.correlationId });
        } else if (actions.initError.match(action)) {
            registrations.initError.invoke({
                error: action.payload.error,
                correlation: action.payload.correlationId,
            });
        } else if (actions.initCancel.match(action)) {
            registrations.initCancel.invoke({ correlation: action.payload.correlationId });
        }

        // Attribute

        if (actions.attributeRequest.match(action)) {
            registrations.attributeLoadStart.invoke({
                correlation: action.payload.correlationId,
            });
        } else if (actions.attributeSuccess.match(action)) {
            registrations.attributeLoadSuccess.invoke({
                attribute: action.payload.attribute,
                correlation: action.payload.correlationId,
            });
        } else if (actions.attributeError.match(action)) {
            registrations.attributeLoadError.invoke({
                error: action.payload.error,
                correlation: action.payload.correlationId,
            });
        } else if (actions.attributeCancel.match(action)) {
            registrations.attributeLoadCancel.invoke({
                correlation: action.payload.correlationId,
            });
        }

        // Attribute Elements

        if (actions.loadElementsRangeRequest.match(action)) {
            registrations.elementsRangeLoadStart.invoke({
                correlation: action.payload.correlationId,
            });
        } else if (actions.loadElementsRangeSuccess.match(action)) {
            registrations.elementsRangeLoadSuccess.invoke({
                attributeElements: action.payload.attributeElements,
                limit: action.payload.limit,
                offset: action.payload.offset,
                totalCount: action.payload.totalCount,
                correlation: action.payload.correlationId,
            });
        } else if (actions.loadElementsRangeError.match(action)) {
            registrations.elementsRangeLoadError.invoke({
                error: action.payload.error,
                correlation: action.payload.correlationId,
            });
        } else if (actions.loadElementsRangeCancel.match(action)) {
            registrations.elementsRangeLoadCancel.invoke({
                correlation: action.payload.correlationId,
            });
        }

        // Selection

        if (
            [
                actions.changeSelection.match,
                actions.revertSelection.match,
                actions.invertSelection.match,
            ].some((m) => m(action))
        ) {
            registrations.selectionChanged.invoke({
                selection: select(selectInvertableWorkingSelection),
            });
        }

        if (actions.commitSelection.match(action)) {
            registrations.selectionCommited.invoke({
                selection: select(selectInvertableCommitedSelection),
            });
        }
    };

    return {
        registrations,
        registerCallback,
        unsubscribeAll,
        eventListener,
    };
};

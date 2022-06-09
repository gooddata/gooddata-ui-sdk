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
import { actions, selectLimit, selectOffset } from "../../internal";
import { newCallbackHandler } from "../common";
import { AttributeFilterEventListener } from "../../internal/store/types";
import { selectInvertableCommitedSelection, selectInvertableWorkingSelection } from "./selectors";

const newCallbackRegistrations = () => {
    return {
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
        // Attribute

        if (actions.attributeRequest.match(action)) {
            registrations.attributeLoadStart.invoke({
                correlation: action.payload.correlationId,
            });
        }

        if (actions.attributeSuccess.match(action)) {
            registrations.attributeLoadSuccess.invoke({
                attribute: action.payload.attribute,
                correlation: action.payload.correlationId,
            });
        }

        if (actions.attributeError.match(action)) {
            registrations.attributeLoadError.invoke({
                error: action.payload.error,
                correlation: action.payload.correlationId,
            });
        }

        if (actions.attributeCancel.match(action)) {
            registrations.attributeLoadCancel.invoke({
                correlation: action.payload.correlationId,
            });
        }

        // Attribute Elements

        if (actions.attributeElementsRequest.match(action)) {
            registrations.elementsRangeLoadStart.invoke({
                correlation: action.payload.correlationId,
            });
        }

        if (actions.attributeElementsSuccess.match(action)) {
            registrations.elementsRangeLoadSuccess.invoke({
                items: action.payload.attributeElements,
                limit: select(selectLimit),
                offset: select(selectOffset),
                totalCount: action.payload.totalCount,
                correlation: action.payload.correlationId,
            });
        }

        if (actions.attributeElementsError.match(action)) {
            registrations.elementsRangeLoadError.invoke({
                error: action.payload.error,
                correlation: action.payload.correlationId,
            });
        }

        if (actions.attributeElementsCancel.match(action)) {
            registrations.elementsRangeLoadCancel.invoke({
                correlation: action.payload.correlationId,
            });
        }

        // Selection

        if (actions.changeSelection.match(action)) {
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

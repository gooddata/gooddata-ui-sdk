// (C) 2022-2026 GoodData Corporation

import type {
    LinkHandlerEvent,
    GenAIConversations as OriginalGenAIConversations,
} from "@gooddata/sdk-ui-gen-ai";

import { CustomElementAdapter, GET_COMPONENT, LOAD_COMPONENT } from "../common/CustomElementAdapter.js";
import { type CustomElementContext } from "../context.js";

import { type ICommonPropertiesDefinition, getProperties, setActions } from "./common.js";

type IGenAIAssistantLinkClick = Omit<LinkHandlerEvent, "preventDefault">;
type IGenAIConversations = typeof OriginalGenAIConversations;

export class GenAIConversations extends CustomElementAdapter<IGenAIConversations> {
    //HANDLES: CLICK

    declare onLinkClick?: (event: CustomEvent<IGenAIAssistantLinkClick>) => void;

    //DISPATCHER

    declare _dispatch?: ICommonPropertiesDefinition["_dispatch"];
    declare _onDispatcher?: ICommonPropertiesDefinition["_onDispatcher"];

    set onDispatcher(onDispatcher: (action: any) => void) {
        this._onDispatcher = onDispatcher;
        if (this._dispatch && onDispatcher) {
            onDispatcher(this._dispatch);
        }
    }
    get onDispatcher(): ((action: any) => void) | undefined {
        return this._onDispatcher;
    }

    //COMPONENT

    static get observedAttributes() {
        return ["workspace", "locale", "objectTypes"];
    }

    override getLiveProperties() {
        return ["onLinkClick", "onDispatcher"];
    }

    override connectedCallback() {
        super.connectedCallback();
        void setActions(this);
    }

    override async [LOAD_COMPONENT]() {
        return (await import("@gooddata/sdk-ui-gen-ai")).GenAIConversations;
    }

    override [GET_COMPONENT](Component: IGenAIConversations, { backend, workspaceId }: CustomElementContext) {
        const props = getProperties(this, "<gd-ai-conversations>");

        return <Component backend={backend} workspace={workspaceId} {...props} />;
    }
}

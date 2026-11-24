// (C) 2026 GoodData Corporation

import { runSaga } from "redux-saga";
import { describe, expect, it, vi } from "vitest";

import { type IChatConversationLocal } from "../../model.js";
import { messagesSliceReducer, saveVisualizationSuccessAction } from "../messages/messagesSlice.js";
import { OptionsDispatcher } from "../options.js";

import { onVisualizationSuccessSave } from "./onVisualizationSuccessSave.js";

const conversationA: IChatConversationLocal = {
    id: "thread-a",
    localId: "local-a",
    title: "Conversation A",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
};
const conversationB: IChatConversationLocal = {
    ...conversationA,
    id: "thread-b",
    localId: "local-b",
    title: "Conversation B",
};
const savedVisualizationHref = "/workspace/workspace-id/analyze/#/saved-visualization-id/edit";

async function runSave(
    payload: Partial<ReturnType<typeof saveVisualizationSuccessAction>["payload"]> = {},
    {
        allowNativeLinks = false,
        currentConversation = conversationB,
        conversations = [conversationA, conversationB],
    }: {
        allowNativeLinks?: boolean;
        currentConversation?: IChatConversationLocal;
        conversations?: IChatConversationLocal[];
    } = {},
) {
    const onLinkClick = vi.fn(() => undefined);
    const navigate = vi.spyOn(window.location, "href", "set").mockImplementation(() => {});
    const optionsDispatcher = new OptionsDispatcher();
    optionsDispatcher.setOnLinkClick(onLinkClick, allowNativeLinks);

    await runSaga(
        {
            context: { workspace: "workspace-id", optionsDispatcher },
            getState: () => ({
                messages: {
                    ...messagesSliceReducer(undefined, { type: "test/init" }),
                    currentConversation,
                    conversations,
                },
            }),
        },
        onVisualizationSuccessSave,
        saveVisualizationSuccessAction({
            visualizationId: "draft-visualization-id",
            assistantMessageId: "assistant-message-id",
            savedVisualizationId: "saved-visualization-id",
            conversationId: conversationA.localId,
            explore: true,
            ...payload,
        }),
    ).toPromise();

    return { onLinkClick, navigate };
}

describe("onVisualizationSuccessSave", () => {
    it.each([
        {
            name: "background conversation",
            currentConversation: conversationB,
            conversations: [conversationA, conversationB],
        },
        {
            name: "current conversation absent from the list",
            currentConversation: conversationA,
            conversations: [],
        },
    ])(
        "attributes the explore callback to the originating $name",
        async ({ currentConversation, conversations }) => {
            const { onLinkClick, navigate } = await runSave({}, { currentConversation, conversations });

            expect(onLinkClick).toHaveBeenCalledExactlyOnceWith({
                id: "saved-visualization-id",
                type: "visualization",
                workspaceId: "workspace-id",
                newTab: true,
                preventDefault: expect.any(Function),
                itemUrl: savedVisualizationHref,
                visualizationStatus: "saved",
                action: "open",
                conversationId: conversationA.localId,
            });
            expect(navigate).not.toHaveBeenCalled();
        },
    );

    it.each([false, true])(
        "does not explore when disabled with native links %s",
        async (allowNativeLinks) => {
            const { onLinkClick, navigate } = await runSave({ explore: false }, { allowNativeLinks });

            expect(onLinkClick).not.toHaveBeenCalled();
            expect(navigate).not.toHaveBeenCalled();
        },
    );

    describe.each([false, true])("with native links %s", (allowNativeLinks) => {
        it.each(["missing-origin", undefined, ""])(
            "does not explore an unresolved origin '%s'",
            async (conversationId) => {
                const { onLinkClick, navigate } = await runSave(
                    { conversationId },
                    { allowNativeLinks, currentConversation: { ...conversationB, id: "" } },
                );

                expect(onLinkClick).not.toHaveBeenCalled();
                expect(navigate).not.toHaveBeenCalled();
            },
        );
    });

    it("uses native navigation instead of the callback when allowed", async () => {
        const { onLinkClick, navigate } = await runSave({}, { allowNativeLinks: true });

        expect(navigate).toHaveBeenCalledExactlyOnceWith(savedVisualizationHref);
        expect(onLinkClick).not.toHaveBeenCalled();
    });
});

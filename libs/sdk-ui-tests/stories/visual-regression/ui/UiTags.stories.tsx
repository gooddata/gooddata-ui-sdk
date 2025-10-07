// (C) 2025 GoodData Corporation

import { ReactNode, useState } from "react";

import { IntlProvider } from "react-intl";
import { action } from "storybook/actions";

import { IAccessibilityConfigBase, UiCheckbox, UiTagDef, UiTags, UiTagsProps } from "@gooddata/sdk-ui-kit";

import { wrapWithTheme } from "../themeWrapper.js";

const smallTags: UiTagDef[] = [
    { id: "tag1", label: "Tag 1" },
    { id: "tag2", label: "Tag 2" },
    { id: "tag3", label: "Tag 3" },
    { id: "tag4", label: "Tag 4" },
    { id: "tag5", label: "Tag 5" },
    { id: "tag6", label: "Tag 6" },
    { id: "tag7", label: "Tag 7" },
    { id: "tag8", label: "Tag 8" },
    { id: "tag9", label: "Tag 9" },
    { id: "tag10", label: "Tag 10" },
    { id: "tag11", label: "Tag 11" },
    { id: "tag12", label: "Tag 12" },
    { id: "tag13", label: "Tag 13" },
];
const smallTags1: UiTagDef[] = [
    { id: "tag1", label: "Tag 1", isDeletable: false },
    { id: "tag2", label: "Tag 2" },
    { id: "tag3", label: "Tag 3" },
    { id: "tag4", label: "Tag 4", isDeletable: false },
    { id: "tag5", label: "Tag 5" },
    { id: "tag6", label: "Tag 6" },
    { id: "tag7", label: "Tag 7", isDeletable: false },
    { id: "tag8", label: "Tag 8" },
    { id: "tag9", label: "Tag 9" },
    { id: "tag10", label: "Tag 10", isDeletable: false },
    { id: "tag11", label: "Tag 11" },
    { id: "tag12", label: "Tag 12" },
    { id: "tag13", label: "Tag 13", isDeletable: false },
];
const longTags: UiTagDef[] = [
    { id: "tag1", label: "ThisIsReallyLongTagNameThatShouldBeTruncatedAndCanNotBeLongerThanOneLine1" },
    { id: "tag2", label: "ThisIsReallyLongTagNameThatShouldBeTruncatedAndCanNotBeLongerThanOneLine2" },
    { id: "tag3", label: "ThisIsReallyLongTagNameThatShouldBeTruncatedAndCanNotBeLongerThanOneLine3" },
    { id: "tag4", label: "ThisIsReallyLongTagNameThatShouldBeTruncatedAndCanNotBeLongerThanOneLine3" },
];
const fruitsTags: UiTagDef[] = [
    { id: "fig", label: "Fig" },
    { id: "date", label: "Date" },
    { id: "apple", label: "Apple" },
    { id: "banana", label: "Banana" },
    { id: "cherry", label: "Cherry" },
    { id: "elderberry", label: "Elderberry" },
    { id: "grape", label: "Grape" },
    { id: "honeydew", label: "Honeydew" },
    { id: "kiwi", label: "Kiwi" },
    { id: "lemon", label: "Lemon" },
    { id: "mango", label: "Mango" },
    { id: "nectarine", label: "Nectarine" },
    { id: "orange", label: "Orange" },
    { id: "peach", label: "Peach" },
    { id: "quince", label: "Quince" },
    { id: "raspberry", label: "Raspberry" },
    { id: "strawberry", label: "Strawberry" },
    { id: "watermelon", label: "Watermelon" },
];

function Example({ title, children }: { title: string; children: ReactNode }) {
    return (
        <>
            <h4>{title}</h4>
            <div>{children}</div>
        </>
    );
}

// Default aria attributes for the tags
const defaultAriaAttributes: IAccessibilityConfigBase = {
    ariaLabelledBy: "test-tags-label",
};

function UiTagsExamples() {
    return (
        <IntlProvider locale="en-US" messages={{}}>
            <div className="library-component screenshot-target">
                <Example title="Basic Tags, one line, limited width, no tags">
                    <div style={{ width: 300 }}>
                        <UiTags
                            tags={[]}
                            onTagAdd={action("onTagAdd")}
                            onTagRemove={action("onTagRemove")}
                            onTagClick={action("onTagClick")}
                            accessibilityConfig={defaultAriaAttributes}
                            addLabel="Add tag"
                        />
                    </div>
                </Example>
                <Example title="Basic Tags, one line, limited width, 2 small tags">
                    <div style={{ width: 300 }}>
                        <UiTags
                            tags={smallTags.slice(0, 2)}
                            onTagAdd={action("onTagAdd")}
                            onTagRemove={action("onTagRemove")}
                            onTagClick={action("onTagClick")}
                            accessibilityConfig={defaultAriaAttributes}
                            addLabel="Add tag"
                        />
                    </div>
                </Example>
                <Example title="Basic Tags, one line, limited width, 13 small tags">
                    <div style={{ width: 300 }}>
                        <UiTags
                            tags={smallTags}
                            onTagAdd={action("onTagAdd")}
                            onTagRemove={action("onTagRemove")}
                            onTagClick={action("onTagClick")}
                            accessibilityConfig={defaultAriaAttributes}
                            addLabel="Add tag"
                        />
                    </div>
                </Example>
                <Example title="Basic Tags, one line, limited width, 4 long tags">
                    <div style={{ width: 300 }}>
                        <UiTags
                            tags={longTags}
                            onTagAdd={action("onTagAdd")}
                            onTagRemove={action("onTagRemove")}
                            onTagClick={action("onTagClick")}
                            accessibilityConfig={defaultAriaAttributes}
                            addLabel="Add tag"
                        />
                    </div>
                </Example>

                <Example title="Basic Tags, one line, limited width, 13 small tags, readonly">
                    <div style={{ width: 300 }}>
                        <UiTags
                            readOnly
                            tags={smallTags}
                            onTagAdd={action("onTagAdd")}
                            onTagRemove={action("onTagRemove")}
                            onTagClick={action("onTagClick")}
                            accessibilityConfig={defaultAriaAttributes}
                            addLabel="Add tag"
                        />
                    </div>
                </Example>
                <Example title="Basic Tags, one line, limited width, 13 small tags, disable delete">
                    <div style={{ width: 300 }}>
                        <UiTags
                            canDeleteTags={false}
                            tags={smallTags}
                            onTagAdd={action("onTagAdd")}
                            onTagRemove={action("onTagRemove")}
                            onTagClick={action("onTagClick")}
                            accessibilityConfig={defaultAriaAttributes}
                            addLabel="Add tag"
                        />
                    </div>
                </Example>
                <Example title="Basic Tags, one line, limited width, 13 small tags, disable create">
                    <div style={{ width: 300 }}>
                        <UiTags
                            canCreateTag={false}
                            tags={smallTags}
                            onTagAdd={action("onTagAdd")}
                            onTagRemove={action("onTagRemove")}
                            onTagClick={action("onTagClick")}
                            accessibilityConfig={defaultAriaAttributes}
                            addLabel="Add tag"
                        />
                    </div>
                </Example>

                <Example title="Basic Tags, one line, limited width, 13 small tags, some not deletable">
                    <div style={{ width: 300 }}>
                        <UiTags
                            tags={smallTags1}
                            onTagAdd={action("onTagAdd")}
                            onTagRemove={action("onTagRemove")}
                            onTagClick={action("onTagClick")}
                            accessibilityConfig={defaultAriaAttributes}
                            addLabel="Add tag"
                        />
                    </div>
                </Example>

                <Example title="Basic Tags, multi line, limited width, 13 small tags">
                    <div style={{ width: 300 }}>
                        <UiTags
                            tags={smallTags}
                            mode="multi-line"
                            onTagAdd={action("onTagAdd")}
                            onTagRemove={action("onTagRemove")}
                            onTagClick={action("onTagClick")}
                            accessibilityConfig={defaultAriaAttributes}
                            addLabel="Add tag"
                        />
                    </div>
                </Example>
                <Example title="Basic Tags, multi line, limited width, 4 long tags">
                    <div style={{ width: 300 }}>
                        <UiTags
                            tags={longTags}
                            mode="multi-line"
                            onTagAdd={action("onTagAdd")}
                            onTagRemove={action("onTagRemove")}
                            onTagClick={action("onTagClick")}
                            accessibilityConfig={defaultAriaAttributes}
                            addLabel="Add tag"
                        />
                    </div>
                </Example>
            </div>
        </IntlProvider>
    );
}

function InteractiveUiTagsTest() {
    const [tags, setTags] = useState<UiTagDef[]>(fruitsTags);
    const [canCreateTag, setCanCreateTag] = useState(true);
    const [canRemoveTag, setCanRemoveTag] = useState(true);
    const [readOnly, setReadOnly] = useState(false);
    const [mode, setMode] = useState<UiTagsProps["mode"]>("single-line");
    const [lastClickedTag, setLastClickedTag] = useState<UiTagDef | undefined>();

    return (
        <IntlProvider locale="en-US" messages={{}}>
            <div style={{ width: 330 }}>
                <UiTags
                    tags={tags}
                    readOnly={readOnly}
                    mode={mode}
                    canCreateTag={canCreateTag}
                    canDeleteTags={canRemoveTag}
                    onTagAdd={(tag: UiTagDef) => {
                        setTags([...tags, tag]);
                    }}
                    onTagRemove={(tag: UiTagDef) => {
                        setTags(tags.filter((t) => t.id !== tag.id));
                    }}
                    onTagClick={setLastClickedTag}
                    accessibilityConfig={defaultAriaAttributes}
                    addLabel="Add tag"
                />
            </div>
            <div style={{ position: "absolute", top: 20, right: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 5 }}>
                    <UiCheckbox checked={canCreateTag} onChange={() => setCanCreateTag(!canCreateTag)} />
                    <div>Allow create</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 5 }}>
                    <UiCheckbox checked={canRemoveTag} onChange={() => setCanRemoveTag(!canRemoveTag)} />
                    <div>Allow remove</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 5 }}>
                    <UiCheckbox checked={readOnly} onChange={() => setReadOnly(!readOnly)} />
                    <div>Read only</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 5 }}>
                    <select value={mode} onChange={(e) => setMode(e.target.value as UiTagsProps["mode"])}>
                        <option value="single-line" selected>
                            Single line
                        </option>
                        <option value="multi-line">Multi line</option>
                    </select>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 5, width: 300 }}>
                    Last clicked tag: <strong>{lastClickedTag?.label || "none"}</strong>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 5 }}>
                    <button onClick={() => setTags([])}>Clear tags</button>
                    <button onClick={() => setTags(fruitsTags)}>Reset tags</button>
                </div>
            </div>
        </IntlProvider>
    );
}

export default {
    title: "15 Ui/UiTags",
};

export function Default() {
    return <UiTagsExamples />;
}
Default.parameters = { kind: "default", screenshot: true };

export const Themed = () => wrapWithTheme(<UiTagsExamples />);
Themed.parameters = { kind: "themed", screenshot: true };

export function Interactive() {
    return <InteractiveUiTagsTest />;
}
Interactive.parameters = { kind: "interactive" };

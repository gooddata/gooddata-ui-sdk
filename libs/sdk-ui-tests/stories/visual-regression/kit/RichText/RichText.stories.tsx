// (C) 2024-2025 GoodData Corporation

import React, { useState } from "react";
import { RichText } from "@gooddata/sdk-ui-kit";
import { BackendProvider, IntlWrapper, WorkspaceProvider } from "@gooddata/sdk-ui";

import { wrapWithTheme } from "../../themeWrapper.js";

import "@gooddata/sdk-ui-kit/styles/css/main.css";
import "./styles.scss";
import { recordedBackend } from "@gooddata/sdk-backend-mockingbird";
import { ReferenceRecordings } from "@gooddata/reference-workspace";

const placeholder = `# Heading
**bold text**
_italic text_
[text](url)`;

const markdown = `# Heading 1

This is a paragraph with **bold text**, _italic text_ and [link](https://gooddata.com).

Here is a list:
- Item 1
- Item 2
- Item 3
`;

const emptyElement = (
    <div
        style={{
            height: "100px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: "20px",
        }}
    >
        Add some markdown
    </div>
);

const headerStyle = { marginBottom: "6px" };

const RichTextTest: React.FC = () => {
    const workspace = "foo";
    const backend = recordedBackend(ReferenceRecordings.Recordings);

    const [richTextValue, setRichTextValue] = useState(markdown);
    const [renderMode, setRenderMode] = useState<"view" | "edit">("view");

    return (
        <IntlWrapper>
            <BackendProvider backend={backend}>
                <WorkspaceProvider workspace={workspace}>
                    <div className="library-component screenshot-target">
                        <div>
                            <h3 style={headerStyle}>Fully interactive RichText</h3>
                            Change state on click in/out and input new markdown.
                            <div onClick={() => setRenderMode("edit")} onBlur={() => setRenderMode("view")}>
                                <RichText
                                    className="custom-rich-text"
                                    value={richTextValue}
                                    renderMode={renderMode}
                                    onChange={(text) => setRichTextValue(text)}
                                    emptyElement={<div>Empty</div>}
                                />
                            </div>
                        </div>
                        <div>
                            <h3 style={headerStyle}>RichText in edit mode</h3>
                            <RichText
                                className="custom-rich-text"
                                value={markdown}
                                renderMode="edit"
                                editRows={5}
                            />
                        </div>
                        <div>
                            <h3 style={headerStyle}>RichText in view mode</h3>
                            <RichText className="custom-rich-text" value={markdown} renderMode="view" />
                        </div>
                        <div>
                            <h3 style={headerStyle}>Empty RichText in edit mode with custom placeholder</h3>
                            <RichText
                                className="custom-rich-text"
                                value=""
                                editPlaceholder={placeholder}
                                renderMode="edit"
                                editRows={5}
                            />
                        </div>
                        <div>
                            <h3 style={headerStyle}>Empty RichText in view mode with custom empty element</h3>
                            <RichText
                                className="custom-rich-text"
                                value=""
                                emptyElement={emptyElement}
                                renderMode="view"
                            />
                        </div>
                    </div>
                </WorkspaceProvider>
            </BackendProvider>
        </IntlWrapper>
    );
};

export default {
    title: "12 UI Kit/RichText",
};

export const FullFeatured = () => <RichTextTest />;
FullFeatured.parameters = { kind: "full-featured", screenshot: true };

export const Themed = () => wrapWithTheme(<RichTextTest />);
Themed.parameters = { kind: "themed", screenshot: true };

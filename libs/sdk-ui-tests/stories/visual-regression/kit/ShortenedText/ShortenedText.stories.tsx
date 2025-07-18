// (C) 2007-2025 GoodData Corporation
import { ShortenedText } from "@gooddata/sdk-ui-kit";

import { wrapWithTheme } from "../../themeWrapper.js";

import "./ShortenedText.css";

function ShortenedTextExamples() {
    return (
        <div className="screenshot-target shortened-text-wrapper">
            <div style={{ width: 150 }}>
                <ShortenedText
                    className="example-long-text"
                    tooltipAlignPoints={[{ align: "bc tc", offset: { x: 0, y: 0 } }]}
                >
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt
                    ut labore et dolore magna aliqua.
                </ShortenedText>
            </div>

            <p>Shortened text which fits into its container is not shortened</p>

            <div className="example-wrapper-large">
                <ShortenedText>test</ShortenedText>
            </div>

            <p>
                Shortened text can be configured to use custom <code>tagName</code> and{" "}
                <code>classNames</code>
            </p>
            <div className="example-wrapper-large">
                <ShortenedText tagName="div" className="foo">
                    test
                </ShortenedText>
            </div>

            <p>Shortened text with shortening when it does not fit into its container</p>
            <div className="example-wrapper-small">
                <ShortenedText className="example-long-text">very long text and more and more</ShortenedText>
            </div>

            <p>
                Shortened text with shortening and provided custom align points via{" "}
                <code>tooltipAlignPoints</code>
            </p>
            <div className="example-wrapper-small">
                <ShortenedText
                    className="example-long-text"
                    tooltipAlignPoints={[{ align: "bc tc", offset: { x: 0, y: 0 } }]}
                >
                    very long text and more and more
                </ShortenedText>
            </div>

            <p>Shortened text with position of ellipsis at the end</p>
            <div className="example-wrapper-small">
                <ShortenedText className="example-long-text" ellipsisPosition="end">
                    very long text and more and more
                </ShortenedText>
            </div>
        </div>
    );
}

export default {
    title: "12 UI Kit/ShortenedText",
};

export const FullFeatured = () => <ShortenedTextExamples />;
FullFeatured.parameters = { kind: "full-featured", screenshot: true };

export const Themed = () => wrapWithTheme(<ShortenedTextExamples />);
Themed.parameters = { kind: "themed", screenshot: true };

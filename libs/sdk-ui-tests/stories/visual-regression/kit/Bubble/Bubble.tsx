// (C) 2007-2020 GoodData Corporation
import React, { Component } from "react";
import { Bubble, BubbleHoverTrigger, BubbleFocusTrigger, Button } from "@gooddata/sdk-ui-kit";
import { storiesOf } from "../../../_infra/storyRepository.js";
import { UiKit } from "../../../_infra/storyGroups.js";
import { wrapWithTheme } from "../../themeWrapper.js";

import "./styles.scss";

const alignOptions = ["tl", "tc", "tr", "cl", "cc", "cr", "bl", "bc", "br"];
const alignmentPoints: string[] = [];

for (let i = 0; i < alignOptions.length; i += 1) {
    for (let j = 0; j < alignOptions.length; j += 1) {
        alignmentPoints.push(`${alignOptions[i]} ${alignOptions[j]}`);
    }
}

class BubbleExamples extends Component {
    public readonly state = {
        dots: "",
    };

    private interval: number | undefined = undefined;

    componentDidMount(): void {
        // Trigger align on the bubbles that are rendered in the same loop
        // with the target node
        window.setTimeout(() => {
            window.dispatchEvent(new Event("resize"));
        }, 0);

        this.interval = window.setInterval(() => {
            this.setState({
                dots: this.state.dots.length >= 15 ? "" : `${this.state.dots}...`,
            });
        }, 3000);
    }

    componentWillUnmount(): void {
        clearInterval(this.interval);
    }

    renderAlignmentExamples() {
        return alignmentPoints.map((alignment, i) => {
            const bubbleTargetId = `bubble-align-example-target-${i}`;

            return (
                <div className="bubble-align-example" key={bubbleTargetId}>
                    <div className={`bubble-align-example-target ${bubbleTargetId}`} />
                    <Bubble alignTo={`.${bubbleTargetId}`} alignPoints={[{ align: alignment }]}>
                        Aligment:
                        <br />
                        {alignment}
                    </Bubble>
                </div>
            );
        });
    }

    renderAlignPoints() {
        return alignOptions.map((point) => {
            const bubbleAlignPoint = `bubble-align-point-${point}`;
            return (
                <div key={bubbleAlignPoint} className={`bubble-align-point ${bubbleAlignPoint}`}>
                    {point}
                </div>
            );
        });
    }

    render() {
        return (
            <div className="library-component screenshot-target">
                <h4>Triggers</h4>
                <h4>Hover</h4>
                <BubbleHoverTrigger>
                    <Button tagName="span" value="Hover over this link..." className="gd-button-link" />

                    <Bubble
                        className="bubble-primary"
                        alignPoints={[{ align: "cr cl", offset: { x: -5, y: 0 } }]}
                    >
                        This is bubble content.
                        <br />
                        <Button value="Click here!" className="gd-button-positive" />
                    </Bubble>
                </BubbleHoverTrigger>
                <h4>Color Skins</h4>
                <p>Hover over this link to see bubble skins</p>
                <BubbleHoverTrigger>
                    <Button tagName="span" value="Primary" className="gd-button-link primary-skin" />

                    <Bubble className="bubble-primary" alignPoints={[{ align: "cr cl" }]}>
                        This is bubble content.
                    </Bubble>
                </BubbleHoverTrigger>
                <BubbleHoverTrigger>
                    <Button tagName="span" value="Secondary" className="gd-button-link secondary-skin" />

                    <Bubble className="bubble-secondary" alignPoints={[{ align: "cr cl" }]}>
                        This is bubble content.
                    </Bubble>
                </BubbleHoverTrigger>
                <BubbleHoverTrigger>
                    <Button tagName="span" value="Negative" className="gd-button-link negative-skin" />

                    <Bubble className="bubble-negative" alignPoints={[{ align: "cr cl" }]}>
                        This is bubble content.
                    </Bubble>
                </BubbleHoverTrigger>
                <BubbleHoverTrigger>
                    <Button tagName="span" value="Light" className="gd-button-link light-skin" />

                    <Bubble className="bubble-light" alignPoints={[{ align: "cr cl" }]}>
                        This is bubble content.
                    </Bubble>
                </BubbleHoverTrigger>
                <BubbleHoverTrigger>
                    <Button tagName="span" value="Dark" className="gd-button-link dark-skin" />

                    <Bubble className="bubble-dark" alignPoints={[{ align: "cr cl" }]}>
                        This is bubble content.
                    </Bubble>
                </BubbleHoverTrigger>
                <BubbleHoverTrigger>
                    <Button tagName="span" value="Warning" className="gd-button-link warning-skin" />

                    <Bubble className="bubble-warning" alignPoints={[{ align: "cr cl" }]}>
                        This is bubble content.
                    </Bubble>
                </BubbleHoverTrigger>
                <h5>Focus</h5>
                <p>Bubble can be also shown on focus:</p>
                <BubbleFocusTrigger tagName="abbr">
                    <input />
                    <Bubble className="bubble-negative" alignPoints={[{ align: "tc bc" }]}>
                        Loading{this.state.dots}
                    </Bubble>
                </BubbleFocusTrigger>
                <h4>Timings</h4>
                <p>
                    Bubble can be shown{" "}
                    <BubbleHoverTrigger tagName="abbr" showDelay={10}>
                        with almost no delay
                        <Bubble className="bubble-secondary" alignPoints={[{ align: "bc tc" }]}>
                            Like this!
                        </Bubble>
                    </BubbleHoverTrigger>
                    , or can be hidden with{" "}
                    <BubbleHoverTrigger tagName="abbr" hideDelay={1000}>
                        longer delay
                        <Bubble
                            className="bubble-primary"
                            alignPoints={[{ align: "tc bc" }, { align: "tc br" }]}
                        >
                            This bubble will hide <strong>1000ms</strong> later after your pointer leave the
                            trigger.
                        </Bubble>
                    </BubbleHoverTrigger>
                    .
                </p>
                <p>
                    Use <code>showDelay</code> and <code>hideDelay</code> props to change the delays.
                </p>
                <BubbleHoverTrigger tagName="abbr" hideDelay={1000} showDelay={500}>
                    More info...
                    <Bubble className="bubble-primary" alignPoints={[{ align: "cr tl" }]}>
                        Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor
                        incididunt ut labore et dolore magna aliqua.
                    </Bubble>
                </BubbleHoverTrigger>
                <h4>Aligment points</h4>
                <div className="bubble-align-example bubble-align-point-example">
                    <div className="bubble-align-example-target">{this.renderAlignPoints()}</div>
                </div>
                <h4>Aligment examples</h4>
                {this.renderAlignmentExamples()}
                <h4>Overwrite default positions</h4>
                You can overwrite default positions by setting <code>arrowDirections</code>
                and <code>arrowOffsets</code>.
                <div>
                    <div className="bubble-align-example">
                        <div className="bubble-align-example-target bubble-align-example-target-ow1" />
                        <Bubble
                            alignTo=".bubble-align-example-target-ow1"
                            arrowDirections={{ "bl tr": "top" }}
                            arrowOffsets={{ "bl tr": [11, 7] }}
                            alignPoints={[{ align: "bl tr" }]}
                        >
                            Overwritten:
                            <br />
                            bl tr
                        </Bubble>
                    </div>

                    <div className="bubble-align-example">
                        <div className="bubble-align-example-target bubble-align-example-target-ow2" />
                        <Bubble
                            alignTo=".bubble-align-example-target-ow2"
                            arrowDirections={{ "br tl": "top" }}
                            arrowOffsets={{ "br tl": [-11, 7] }}
                            alignPoints={[{ align: "br tl" }]}
                        >
                            Overwritten:
                            <br />
                            br tl
                        </Bubble>
                    </div>
                </div>
            </div>
        );
    }
}

storiesOf(`${UiKit}/Bubble`)
    .add(
        "full-featured",
        () => {
            return <BubbleExamples />;
        },
        {
            screenshots: {
                "primary-skin": {
                    hoverSelector: ".primary-skin",
                    postInteractionWait: 1000,
                },
                "secondary-skin": {
                    hoverSelector: ".secondary-skin",
                    postInteractionWait: 1000,
                },
                "negative-skin": {
                    hoverSelector: ".negative-skin",
                    postInteractionWait: 1000,
                },
                "light-skin": {
                    hoverSelector: ".light-skin",
                    postInteractionWait: 1000,
                },
                "dark-skin": {
                    hoverSelector: ".dark-skin",
                    postInteractionWait: 1000,
                },
                "warning-skin": {
                    hoverSelector: ".warning-skin",
                    postInteractionWait: 1000,
                },
            },
        },
    )
    .add("themed", () => wrapWithTheme(<BubbleExamples />), { screenshot: true });

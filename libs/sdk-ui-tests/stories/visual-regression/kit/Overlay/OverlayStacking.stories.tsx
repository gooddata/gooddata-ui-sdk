// (C) 2022-2025 GoodData Corporation
import { Overlay, OverlayController, OverlayControllerProvider } from "@gooddata/sdk-ui-kit";
import { FormattedMessage, IntlProvider } from "react-intl";

import { useState } from "react";

import "../styles/goodstrap.scss";

function OverlayStackingExample() {
    const [state, setState] = useState(0);

    const onButtonClick = () => setState(state + 1);

    return (
        <OverlayControllerProvider overlayController={OverlayController.getInstance()}>
            <div style={{ width: "100%", height: "100%" }}>
                <button className="stacking-overlays-controls open-first" onClick={onButtonClick}>
                    <FormattedMessage id="gs.examples.overlayStacking.openOverlay" />
                </button>
                {state > 0 && (
                    <Overlay isModal={true} alignPoints={[{ align: "cc cc" }]}>
                        <div
                            className="overlay-first"
                            style={{
                                width: "500px",
                                height: "400px",
                                padding: "20px",
                                background: "blue",
                                color: "black",
                            }}
                        >
                            <button onClick={onButtonClick} className="open-stacked">
                                <FormattedMessage id="gs.examples.overlayStacking.openChildOverlay" />
                            </button>
                        </div>
                    </Overlay>
                )}
                {state > 1 && (
                    <Overlay isModal={true} alignPoints={[{ align: "cc cc" }]}>
                        <div
                            className="overlay-stacked"
                            style={{
                                width: "250px",
                                height: "200px",
                                padding: "20px",
                                background: "limegreen",
                                color: "black",
                            }}
                        ></div>
                    </Overlay>
                )}
            </div>
        </OverlayControllerProvider>
    );
}

function OverlayStackingExamples() {
    return (
        <IntlProvider
            locale="en"
            messages={{
                "gs.examples.overlayStacking.openOverlay": "Open Overlay",
                "gs.examples.overlayStacking.openChildOverlay": "Open stacked Overlay",
            }}
        >
            <div className="library-component screenshot-target" style={{ width: 800, height: 600 }}>
                <OverlayStackingExample />
            </div>
        </IntlProvider>
    );
}

export default {
    title: "12 UI Kit/Overlay Stacking",
};

export const FullFeatured = () => <OverlayStackingExamples />;
FullFeatured.parameters = {
    kind: "full-featured",
    screenshots: {
        "open-first": {
            clickSelector: ".open-first",
            postInteractionWait: 1000,
        },
        "open-stacked": {
            clickSelectors: [".open-first", ".open-stacked"],
        },
    },
};

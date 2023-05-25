// (C) 2022 GoodData Corporation
import { Overlay, OverlayController, OverlayControllerProvider } from "@gooddata/sdk-ui-kit";
import { injectIntl, FormattedMessage, IntlShape, IntlProvider } from "react-intl";
import { storiesOf } from "../../../_infra/storyRepository.js";
import { UiKit } from "../../../_infra/storyGroups.js";
import React, { useState } from "react";

import "../styles/goodstrap.scss";

export const OverlayStackingExample: React.FC<{ intl: IntlShape }> = () => {
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
};

const LocalizedOverlayStackingExample = injectIntl(OverlayStackingExample);

export const OverlayStackingExamples: React.FC = () => {
    return (
        <IntlProvider
            locale="en"
            messages={{
                "gs.examples.overlayStacking.openOverlay": "Open Overlay",
                "gs.examples.overlayStacking.openChildOverlay": "Open stacked Overlay",
            }}
        >
            <div className="library-component screenshot-target" style={{ width: 800, height: 600 }}>
                <LocalizedOverlayStackingExample />
            </div>
        </IntlProvider>
    );
};

storiesOf(`${UiKit}/Overlay Stacking`).add("full-featured", () => <OverlayStackingExamples />, {
    screenshots: {
        "open-first": {
            clickSelector: ".open-first",
            postInteractionWait: 1000,
        },
        "open-stacked": {
            clickSelectors: [".open-first", ".open-stacked"],
        },
    },
});

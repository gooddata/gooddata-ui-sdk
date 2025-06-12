// (C) 2020 GoodData Corporation
import { ScrollGradient } from "@gooddata/sdk-ui-kit";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";
import React from "react";
import { v4 as uuid } from "uuid";

import { storiesOf } from "../../../_infra/storyRepository.js";
import { UiKit } from "../../../_infra/storyGroups.js";
import { wrapWithTheme } from "../../themeWrapper.js";

import "@gooddata/sdk-ui-kit/styles/css/scrollGradient.css";

const GradientTextBase: React.FC<{ backgroundColor?: string }> = ({ backgroundColor }) => (
    <div className="library-component screenshot-target">
        <div style={{ display: "flex", gap: 30, alignItems: "flex-start" }}>
            <div>
                <h4>Long content</h4>
                <div style={{ width: 200, maxHeight: 400, display: "flex" }}>
                    <ScrollGradient key={uuid()} backgroundColor={backgroundColor}>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras auctor faucibus maximus.
                        Phasellus dignissim ligula et ipsum imperdiet consectetur. Maecenas quis feugiat
                        turpis. Vestibulum eu tellus non lacus lacinia rutrum ac vitae nisl. Pellentesque
                        fermentum placerat eros, nec rhoncus lacus posuere sed. Quisque commodo massa id nulla
                        volutpat ultrices eu id nulla. Sed eget arcu felis. In egestas eu ex in placerat.
                        Praesent ut lorem eu sapien ullamcorper interdum. Donec vitae lorem rhoncus,
                        vestibulum nulla sit amet, suscipit enim. Mauris consequat velit dignissim, ultricies
                        quam non, iaculis leo. Donec congue, orci nec condimentum mattis, erat enim tristique
                        felis, ut laoreet quam arcu at enim. Sed aliquet enim id magna lacinia consectetur.
                        Morbi vestibulum felis nisl, fringilla tristique lectus tempor et. Duis est turpis,
                        consequat ut enim at, fermentum tincidunt sem. Nulla ut ex porta, luctus eros ut,
                        efficitur orci. Morbi et eleifend purus. Suspendisse lorem enim, imperdiet at mi eget,
                        rhoncus posuere felis. Quisque pretium condimentum cursus. In ac orci sit amet urna
                        facilisis viverra. Proin ut lorem eu urna condimentum faucibus vel non mauris. Aenean
                        porttitor gravida tempor. Curabitur facilisis dolor sed enim malesuada, in tincidunt
                        tortor maximus. Curabitur ac massa ac libero ornare aliquet sit amet a felis. Fusce
                        luctus placerat eros, eget tincidunt diam. In vel risus pharetra, mollis velit eu,
                        fermentum risus. Donec facilisis finibus arcu. Fusce vel purus fermentum, vestibulum
                        purus vel, congue leo. In egestas congue justo, eu tempus augue gravida eget. Morbi
                        facilisis felis dolor, sed sollicitudin leo iaculis et. In tristique massa eu ipsum
                        vehicula rutrum. Sed fermentum condimentum risus, et posuere enim volutpat id. Proin
                        malesuada metus vel ipsum condimentum feugiat. Donec bibendum, elit eu convallis
                        ultricies, justo lorem egestas risus, a consectetur enim dolor et massa.
                    </ScrollGradient>
                </div>
            </div>
            <div>
                <h4>Short content</h4>
                <div style={{ width: 200, maxHeight: 400, display: "flex" }}>
                    <ScrollGradient key={uuid()} backgroundColor={backgroundColor}>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras auctor faucibus maximus.
                        Phasellus dignissim ligula et ipsum imperdiet consectetur.
                    </ScrollGradient>
                </div>
            </div>
            <div>
                <h4>Long content bigger gradient</h4>
                <div style={{ width: 200, maxHeight: 400, display: "flex" }}>
                    <ScrollGradient key={uuid()} size={80} backgroundColor={backgroundColor}>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras auctor faucibus maximus.
                        Phasellus dignissim ligula et ipsum imperdiet consectetur. Maecenas quis feugiat
                        turpis. Vestibulum eu tellus non lacus lacinia rutrum ac vitae nisl. Pellentesque
                        fermentum placerat eros, nec rhoncus lacus posuere sed. Quisque commodo massa id nulla
                        volutpat ultrices eu id nulla. Sed eget arcu felis. In egestas eu ex in placerat.
                        Praesent ut lorem eu sapien ullamcorper interdum. Donec vitae lorem rhoncus,
                        vestibulum nulla sit amet, suscipit enim. Mauris consequat velit dignissim, ultricies
                        quam non, iaculis leo. Donec congue, orci nec condimentum mattis, erat enim tristique
                        felis, ut laoreet quam arcu at enim. Sed aliquet enim id magna lacinia consectetur.
                        Morbi vestibulum felis nisl, fringilla tristique lectus tempor et. Duis est turpis,
                        consequat ut enim at, fermentum tincidunt sem. Nulla ut ex porta, luctus eros ut,
                        efficitur orci. Morbi et eleifend purus. Suspendisse lorem enim, imperdiet at mi eget,
                        rhoncus posuere felis. Quisque pretium condimentum cursus. In ac orci sit amet urna
                        facilisis viverra. Proin ut lorem eu urna condimentum faucibus vel non mauris. Aenean
                        porttitor gravida tempor. Curabitur facilisis dolor sed enim malesuada, in tincidunt
                        tortor maximus. Curabitur ac massa ac libero ornare aliquet sit amet a felis. Fusce
                        luctus placerat eros, eget tincidunt diam. In vel risus pharetra, mollis velit eu,
                        fermentum risus. Donec facilisis finibus arcu. Fusce vel purus fermentum, vestibulum
                        purus vel, congue leo. In egestas congue justo, eu tempus augue gravida eget. Morbi
                        facilisis felis dolor, sed sollicitudin leo iaculis et. In tristique massa eu ipsum
                        vehicula rutrum. Sed fermentum condimentum risus, et posuere enim volutpat id. Proin
                        malesuada metus vel ipsum condimentum feugiat. Donec bibendum, elit eu convallis
                        ultricies, justo lorem egestas risus, a consectetur enim dolor et massa.
                    </ScrollGradient>
                </div>
            </div>
            <div>
                <h4>Long content smaller gradient</h4>
                <div style={{ width: 200, maxHeight: 400, display: "flex" }}>
                    <ScrollGradient key={uuid()} size={8} backgroundColor={backgroundColor}>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras auctor faucibus maximus.
                        Phasellus dignissim ligula et ipsum imperdiet consectetur. Maecenas quis feugiat
                        turpis. Vestibulum eu tellus non lacus lacinia rutrum ac vitae nisl. Pellentesque
                        fermentum placerat eros, nec rhoncus lacus posuere sed. Quisque commodo massa id nulla
                        volutpat ultrices eu id nulla. Sed eget arcu felis. In egestas eu ex in placerat.
                        Praesent ut lorem eu sapien ullamcorper interdum. Donec vitae lorem rhoncus,
                        vestibulum nulla sit amet, suscipit enim. Mauris consequat velit dignissim, ultricies
                        quam non, iaculis leo. Donec congue, orci nec condimentum mattis, erat enim tristique
                        felis, ut laoreet quam arcu at enim. Sed aliquet enim id magna lacinia consectetur.
                        Morbi vestibulum felis nisl, fringilla tristique lectus tempor et. Duis est turpis,
                        consequat ut enim at, fermentum tincidunt sem. Nulla ut ex porta, luctus eros ut,
                        efficitur orci. Morbi et eleifend purus. Suspendisse lorem enim, imperdiet at mi eget,
                        rhoncus posuere felis. Quisque pretium condimentum cursus. In ac orci sit amet urna
                        facilisis viverra. Proin ut lorem eu urna condimentum faucibus vel non mauris. Aenean
                        porttitor gravida tempor. Curabitur facilisis dolor sed enim malesuada, in tincidunt
                        tortor maximus. Curabitur ac massa ac libero ornare aliquet sit amet a felis. Fusce
                        luctus placerat eros, eget tincidunt diam. In vel risus pharetra, mollis velit eu,
                        fermentum risus. Donec facilisis finibus arcu. Fusce vel purus fermentum, vestibulum
                        purus vel, congue leo. In egestas congue justo, eu tempus augue gravida eget. Morbi
                        facilisis felis dolor, sed sollicitudin leo iaculis et. In tristique massa eu ipsum
                        vehicula rutrum. Sed fermentum condimentum risus, et posuere enim volutpat id. Proin
                        malesuada metus vel ipsum condimentum feugiat. Donec bibendum, elit eu convallis
                        ultricies, justo lorem egestas risus, a consectetur enim dolor et massa.
                    </ScrollGradient>
                </div>
            </div>
        </div>
    </div>
);

const GradientTextNormal: React.FC = () => {
    return <GradientTextBase />;
};

const GradientTextThemed: React.FC = () => {
    const theme = useTheme();

    return <GradientTextBase backgroundColor={theme?.palette?.complementary?.c0} />;
};

const GradientTextCustom: React.FC = () => {
    return (
        <div style={{ background: "#FF4455" }}>
            <GradientTextBase backgroundColor="#FF4455" />
        </div>
    );
};

storiesOf(`${UiKit}/ScrollGradient`)
    .add("full-featured", () => <GradientTextNormal />, { screenshot: true })
    .add("themed", () => wrapWithTheme(<GradientTextThemed />), { screenshot: true })
    .add("custom", () => wrapWithTheme(<GradientTextCustom />), { screenshot: true });

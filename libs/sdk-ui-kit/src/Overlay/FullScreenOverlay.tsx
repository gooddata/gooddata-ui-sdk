// (C) 2007-2022 GoodData Corporation
import merge from "lodash/merge.js";
import { Overlay } from "./Overlay.js";
import { IOverlayProps, IOverlayState } from "./typings.js";

/**
 * @internal
 */

export class FullScreenOverlay extends Overlay<IOverlayState> {
    constructor(props: IOverlayProps<any>) {
        super(props);

        this.state = merge(this.state, {
            position: {},
            overflow: "auto",
            scrollTop: 0,
        });
    }

    UNSAFE_componentWillMount(): void {
        const { body } = document;

        const { overflow } = getComputedStyle(body);
        const { scrollTop } = body;

        this.setState({
            overflow,
            scrollTop,
        });

        body.style.overflow = "hidden";
        body.scrollTop = 0;
    }

    componentWillUnmount(): void {
        super.componentWillUnmount();

        const { body } = document;
        body.style.overflow = this.state.overflow;
        body.scrollTop = this.state.scrollTop;
    }

    protected getOverlayStyles = (): React.CSSProperties => {
        const zIndex = this.getZIndex();
        const additionalStyles = zIndex ? { zIndex } : {};

        return {
            position: "fixed",
            left: 0,
            top: 0,
            bottom: 0,
            right: 0,
            ...additionalStyles,
        };
    };
}

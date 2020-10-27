// (C) 2007-2020 GoodData Corporation
import merge from "lodash/merge";
import { Overlay, IOverlayProps, IOverlayState } from "../Overlay";

export default class ReactFullScreenOverlay extends Overlay<IOverlayState> {
    constructor(props: IOverlayProps<any>) {
        super(props);

        this.state = merge(this.state, {
            position: {},
            overflow: "auto",
            scrollTop: 0,
        });
    }

    componentWillMount() {
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

    componentWillUnmount() {
        super.componentWillUnmount();

        const { body } = document;
        body.style.overflow = this.state.overflow;
        body.scrollTop = this.state.scrollTop;
    }

    getOverlayStyles() {
        return {
            position: "fixed",
            left: 0,
            top: 0,
            bottom: 0,
            right: 0,
        };
    }
}

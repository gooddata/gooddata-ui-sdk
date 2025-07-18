// (C) 2020-2025 GoodData Corporation
import { CSSProperties, PureComponent, createRef, ReactNode } from "react";

interface IScrollNotificationDiv {
    style?: CSSProperties;
    children?: ReactNode;
}

export class ScrollNotificationDiv extends PureComponent<IScrollNotificationDiv> {
    private divRef: any;

    constructor(props: IScrollNotificationDiv) {
        super(props);
        this.divRef = createRef();
    }

    public render() {
        return (
            <div ref={this.divRef} onScroll={this.onScroll} style={this.props.style}>
                {this.props.children}
            </div>
        );
    }

    private onScroll = () => {
        if (this.divRef) {
            const node = this.divRef.current;
            node.dispatchEvent(new CustomEvent("goodstrap.scrolled", { bubbles: true }));
        }
    };
}

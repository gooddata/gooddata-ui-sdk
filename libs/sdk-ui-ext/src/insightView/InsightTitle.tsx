// (C) 2021-2025 GoodData Corporation

import OriginalLinesEllipsis from "react-lines-ellipsis";
import responsiveHOC from "react-lines-ellipsis/lib/responsiveHOC.js";

import { IInsightTitleProps } from "../internal/index.js";

// This fixes the infinite render loop with 0.15.x version,
// we cannot upgrade to 0.16.0 which has solved the infinite loop
// as it has yet another error, see https://github.com/xiaody/react-lines-ellipsis/issues/140
class LinesEllipsis extends OriginalLinesEllipsis {
    override componentDidUpdate(
        prevProps: Record<string, unknown>,
        prevState: Record<string, unknown>,
        shapshot: unknown,
    ) {
        if (JSON.stringify(prevProps) === JSON.stringify(this.props)) {
            prevProps = this.props;
        }

        super.componentDidUpdate?.(prevProps, prevState, shapshot);
    }
}

const ResponsiveEllipsis = responsiveHOC()(LinesEllipsis);

/**
 * @public
 */
function InsightTitle({ title }: IInsightTitleProps) {
    return (
        <div className="insight-title-outer">
            <div className="insight-title">
                <ResponsiveEllipsis
                    text={title}
                    maxLine={2}
                    ellipsis="..."
                    className="item-headline-inner s-headline"
                />
            </div>
        </div>
    );
}

export default InsightTitle;

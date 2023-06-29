// (C) 2007-2019 GoodData Corporation
import React from "react";
import { ConfigPanelClassName } from "@gooddata/sdk-ui-ext/internal";

export interface IConfigurationPanelWrapperProps {
    className?: string;
    expandAllClassName?: string;
    children?: React.ReactNode;
}

/**
 * Wrapper into which configuration panel should be rendered. The only added value provided here-in is the
 * ability to expand all panels using a click on a single element. This is essential for two reasons when
 * taking screenshots using backstop:
 *
 * 1  if plug viz has no configuration, there is no header, trying to click non-existent header from backstop
 *    will fail
 *
 * 2  if plug viz has more than one config sections (100% of them) then expanding all of them using the common
 *    header selector (adi-bucket-item-header) will only expand the first section in the panel.
 *
 *    (note: sections also have their unique selectors, but doing that leads to problem #1 as not all visualizations
 *     have all the sections).
 *
 * In the end, this wrapper allows to generate stories in a generic fashion - without having to customize what
 * config sections are available.
 */
export class ConfigurationPanelWrapper extends React.Component<IConfigurationPanelWrapperProps> {
    public static DefaultExpandAllClassName = "config-panel-expand-all";

    public static defaultProps = {
        className: ConfigPanelClassName,
        expandAllClassName: ConfigurationPanelWrapper.DefaultExpandAllClassName,
    };

    private componentRef: any = null;

    constructor(props: IConfigurationPanelWrapperProps) {
        super(props);

        this.state = { ready: false };
        this.componentRef = React.createRef();
    }

    public render() {
        const { className, expandAllClassName } = this.props;

        return (
            <>
                <div
                    className={expandAllClassName}
                    style={{ cursor: "pointer" }}
                    onClick={this.expandAllSections}
                >
                    Expand all
                </div>
                <div ref={this.componentRef} className={className}>
                    {this.props.children}
                </div>
            </>
        );
    }

    private expandAllSections = () => {
        const element = this.componentRef.current;
        const sections = element.getElementsByClassName("adi-bucket-item-header collapsed");

        for (const section of sections) {
            section.click();
        }
    };
}

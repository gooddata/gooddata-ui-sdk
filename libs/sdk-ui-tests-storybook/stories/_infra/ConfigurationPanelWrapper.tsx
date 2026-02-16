// (C) 2007-2026 GoodData Corporation

import { type ReactNode, useCallback, useRef, useState } from "react";

import { ConfigPanelClassName } from "@gooddata/sdk-ui-ext/internal";

export interface IConfigurationPanelWrapperProps {
    className?: string;
    expandAllClassName?: string;
    children?: ReactNode;
}

const DefaultExpandAllClassName = "config-panel-expand-all";

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
export function ConfigurationPanelWrapper({
    className = ConfigPanelClassName,
    expandAllClassName = DefaultExpandAllClassName,
    children,
}: IConfigurationPanelWrapperProps) {
    const componentRef = useRef<HTMLDivElement>(null);
    const [expanded, setExpanded] = useState(false);

    const expandAllSections = useCallback(() => {
        setExpanded((pre) => !pre);

        const element = componentRef.current;
        const sections = element?.getElementsByClassName("adi-bucket-item-header collapsed");

        if (sections) {
            for (const section of Array.from(sections)) {
                (section as HTMLElement).click();
            }
        }
    }, [componentRef, setExpanded]);

    return (
        <>
            <div className={expandAllClassName} style={{ cursor: "pointer" }} onClick={expandAllSections}>
                {expanded ? "Collapse" : "Expand"}
            </div>
            <div ref={componentRef} className={className} style={{ display: expanded ? "block" : "none" }}>
                {children}
            </div>
        </>
    );
}

ConfigurationPanelWrapper.DefaultExpandAllClassName = DefaultExpandAllClassName;

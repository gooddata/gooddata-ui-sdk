/**
 * Highcharts pattern fill plugin
 *
 * Version         3.0.3
 * Author:         Torstein Honsi
 *                 Stephane Vanraes
 * Last revision:  2016-10-05
 * License:        MIT License
 *
 * Remark:         The latest version is not compatible with earlier versions.
 *
 * Usage:          Add a 'defs' object to the options
 *                 Create a 'patterns' array under 'defs'
 *                 Each item in this array represents a pattern
 *                 To use a pattern, set the color to `url(#id-of-pattern)'
 *
 * Options for the patterns:
 * - id:           The id for the pattern,
 *                 defaults to highcharts-pattern-# with # an increasing number for each pattern without id
 * - width:        The width of the pattern, defaults to 10
 * - height:       The height of the pattern, defaults to 10
 * - opacity       A general opacity for the pattern
 * - path:         In SVG, the path for the pattern
 *                 (Note: this can be a string with only a path, or an object with d, stroke, strokeWidth and fill)
 * - image:        An image source for the pattern
 * - color:        A color to be used instead of a path
 *
 * Notes:          VML does not support the path setting
 *                 If all other fills fail (no path, image or color) the pattern will return #A0A0A0 as a color
 *                 Several patterns have been predefined, called highcharts-default-pattern-# (numbered 0-9)
 */

import get = require('lodash/get');

/*global Highcharts, document */
export function patternFill(Highcharts: any) {
    let idCounter = 0;
    const wrap = Highcharts.wrap;
    const each = Highcharts.each;

    /**
     * Draw the actual graph
     */
    Highcharts.Series.prototype.drawGraph = function() {
        const series = this;
        const options = this.options;
        const props = [['graph', options.lineColor || this.color, options.dashStyle]];
        const lineWidth = options.lineWidth;
        const roundCap = options.linecap !== 'square';
        const graphPath = (this.gappedPath || this.getGraphPath).call(this);
        const fillColor = (this.fillGraph && this.color) || 'none'; // polygon series use filled graph
        const zones = this.zones;

        each(zones, (threshold: any, i: number) => {
            props.push(['zoneGraph' + i, threshold.color || series.color, threshold.dashStyle || options.dashStyle]);
        });

        // Draw the graph
        each(props, (prop: any, i: number) => {
            const graphKey = prop[0];
            const graph = series[graphKey];
            let attribs: any;

            if (graph) {
                graph.animate({ d: graphPath });
            } else if ((lineWidth || fillColor) && graphPath.length) { // #1487
                attribs = {
                    'stroke': prop[1],
                    'stroke-width': lineWidth,
                    'fill': fillColor,
                    'zIndex': 1 // #1069
                };
                if (prop[2]) {
                    attribs.dashstyle = prop[2];
                } else if (roundCap) {
                    attribs['stroke-linecap'] = attribs['stroke-linejoin'] = 'round';
                }

                series[graphKey] = series.chart.renderer.path(graphPath)
                    .attr(attribs)
                    .add(series.group)
                    .shadow((i < 2) && options.shadow); // add shadow to normal series (0) or to first zone (1) #3932
            }
        });
    };

    /**
     * Exposed method to add a pattern to the renderer.
     */
    Highcharts.SVGRenderer.prototype.addPattern = function(id: any, options: any) {
        const w = get(options, 'width', 10);
        const h = get(options, 'height', 10);
        const ren = this;
        let pattern: any;
        let newId = id;

        /**
         * Add a rectangle for solid color
         */
        function rect(fill: any) {
            ren.rect(0, 0, w, h)
                .attr({
                    fill
                })
                .add(pattern);
        }

        if (!newId) {
            newId = 'highcharts-pattern-' + idCounter;
            idCounter += 1;
        }

        pattern = this.createElement('pattern').attr({
            id: newId,
            patternUnits: 'userSpaceOnUse',
            width: w,
            height: h
        }).add(this.defs);

        // Get id
        pattern.id = get(pattern, 'element.id');

        // Use an SVG path for the pattern
        let path;
        if (options.path) {
            path = options.path;

            // The background
            if (path.fill) {
                rect(path.fill);
            }

            // The pattern
            this.createElement('path').attr({
                'd': path.d || path,
                'stroke': path.stroke || options.color || '#343434',
                'stroke-width': path.strokeWidth || 2
            }).add(pattern);
            pattern.color = options.color;

        // Image pattern
        } else if (options.image) {

            this.image(options.image, 0, 0, options.width, options.height).add(pattern);

        // A solid color
        } else if (options.color) {

            rect(options.color);

        }

        if (options.opacity !== undefined) {
            each(pattern.element.children, (child: any) => {
                child.setAttribute('opacity', options.opacity);
            });
        }

        return pattern;
    };

    if (Highcharts.VMLElement) {
        Highcharts.VMLRenderer.prototype.addPattern = (id: string, options: any) => {
            let patterns = this.patterns || {};
            let newId = id;

            if (!newId) {
                newId = 'highcharts-pattern-' + idCounter;
                idCounter += 1;
            }
            patterns = this.patterns || {};
            patterns[newId] = options;
            this.patterns = patterns;
        };

        Highcharts.wrap(Highcharts.VMLRenderer.prototype.Element.prototype, 'fillSetter',
            (proceed: Function, color: string, prop: any, elem: any) => {
                if (typeof color === 'string' && color.substring(0, 5) === 'url(#') {
                    const pattern: any = get(this, ['renderer', 'patterns', color.substring(5, color.length - 1)], {});
                    let markup;

                    if (pattern.image) {
                        // Remove Previous fills
                        if (elem.getElementsByTagName('fill').length) {
                            elem.removeChild(elem.getElementsByTagName('fill')[0]);
                        }

                        markup = this.renderer.prepVML(['<', prop, ' type="tile" src="', pattern.image, '" />']);
                        elem.appendChild(document.createElement(markup));

                        // Work around display bug on updating attached nodes
                        if (elem.parentNode.nodeType === 1) {
                            elem.outerHTML = elem.outerHTML;
                        }

                    } else if (pattern.color) {
                        proceed.call(this, pattern.color, prop, elem);
                    } else {
                        proceed.call(this, '#A0A0A0', prop, elem);
                    }
                } else {
                    proceed.call(this, color, prop, elem);
                }
            });
    }

    /**
     * Add the predefined patterns
     */
    function addPredefinedPatterns(renderer: any) {
        const colors = Highcharts.getOptions().colors;

        each([
            'M 0 0 L 10 10 M 9 -1 L 11 1 M -1 9 L 1 11',
            'M 0 10 L 10 0 M -1 1 L 1 -1 M 9 11 L 11 9',
            'M 3 0 L 3 10 M 8 0 L 8 10',
            'M 0 3 L 10 3 M 0 8 L 10 8',
            'M 0 3 L 5 3 L 5 0 M 5 10 L 5 7 L 10 7',
            'M 3 3 L 8 3 L 8 8 L 3 8 Z',
            'M 5 5 m -4 0 a 4 4 0 1 1 8 0 a 4 4 0 1 1 -8 0',
            'M 10 3 L 5 3 L 5 0 M 5 10 L 5 7 L 0 7',
            'M 2 5 L 5 2 L 8 5 L 5 8 Z',
            'M 0 0 L 5 10 L 10 0'
        ], (pattern: any, i: number) => {
            renderer.addPattern('highcharts-default-pattern-' + i, {
                path: pattern,
                color: colors[i]
            });
        });
    }

    // Add patterns to the defs element
    wrap(Highcharts.Chart.prototype, 'getContainer', function(proceed: Function) {
        proceed.apply(this);

        const chart = this;
        const renderer = chart.renderer;
        const patterns = get(chart, 'options.defs.patterns');

        // First add default patterns
        addPredefinedPatterns(renderer);

        // Add user defined patterns
        if (patterns) {
            each(patterns, (pattern: any) => {
                renderer.addPattern(pattern.id, pattern);
            });
        }

    });
}

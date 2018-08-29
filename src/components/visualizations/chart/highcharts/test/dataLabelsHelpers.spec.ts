// (C) 2007-2018 GoodData Corporation
import {
    showDataLabelInsideChart,
    getDataLabelAttributes,
    isLabelOverlappingItsShape,
    intersectsParentLabel,
    isDataLabelInsideChart,
    IInsideResult
} from '../dataLabelsHelpers';

import {
    IRectBySize
} from '../helpers';

describe('dataLabelsHelpers', () => {
    describe('getDataLabelAttributes', () => {
        const hiddenAttributes: IRectBySize = {
            x: 0,
            y: 0,
            height: 0,
            width: 0
        };

        it('should position data label when in range', () => {
            const result = getDataLabelAttributes({
                dataLabel: {
                    parentGroup: {
                        translateX: 0,
                        translateY: 0
                    },
                    x: 1,
                    y: 1,
                    width: 100,
                    height: 100
                }
            });

            expect(result).toEqual({
                x: 1,
                y: 1,
                width: 100,
                height: 100
            });
        });

        it('should hide data label when outside range', () => {
            const result = getDataLabelAttributes({
                dataLabel: {
                    parentGroup: {
                        translateX: 0,
                        translateY: 0
                    },
                    x: -200,
                    y: -200,
                    width: 100,
                    height: 100
                }
            });

            expect(result).toEqual(hiddenAttributes);
        });

        it('should hide label when label not present on point', () => {
            const result = getDataLabelAttributes({
                dataLabel: null
            });

            expect(result).toEqual(hiddenAttributes);
        });

        it('should hide label when label present but parentgroup missing', () => {
            const result = getDataLabelAttributes({
                dataLabel: {
                    parentGroup: null
                }
            });

            expect(result).toEqual(hiddenAttributes);
        });
    });

    describe('isDataLabelInsideChart', () => {
        const CHART_BOX_WIDTH = 200;
        const chartBox: IRectBySize = {
            x: 0,
            y: 0,
            width: CHART_BOX_WIDTH,
            height: CHART_BOX_WIDTH
        };

        const baseDataLabelRect: IRectBySize = {
            x: 50,
            y: 50,
            width: 50,
            height: 50
        };

        function prepareDataLabels(offset: number): IRectBySize[] {
            const topLeftDataLabelRect: IRectBySize = {
                ...baseDataLabelRect,
                x: -offset,
                y: -offset
            };

            const topDataLabelRect: IRectBySize = {
                ...baseDataLabelRect,
                y: -offset
            };

            const topRightDataLabelRect: IRectBySize = {
                ...baseDataLabelRect,
                x: CHART_BOX_WIDTH + offset,
                y: -offset
            };

            const rightDataLabelRect: IRectBySize = {
                ...baseDataLabelRect,
                x: CHART_BOX_WIDTH + offset
            };

            const rightBottomDataLabelRect: IRectBySize = {
                ...baseDataLabelRect,
                x: CHART_BOX_WIDTH + offset,
                y: CHART_BOX_WIDTH + offset
            };

            const bottomDataLabelRect: IRectBySize = {
                ...baseDataLabelRect,
                y: CHART_BOX_WIDTH + offset
            };

            const leftBottomDataLabelRect: IRectBySize = {
                ...baseDataLabelRect,
                x: -offset,
                y: CHART_BOX_WIDTH + offset
            };

            const leftDataLabelRect: IRectBySize = {
                ...baseDataLabelRect,
                x: -offset
            };

            return [
                topLeftDataLabelRect,
                topDataLabelRect,
                topRightDataLabelRect,
                rightDataLabelRect,
                rightBottomDataLabelRect,
                bottomDataLabelRect,
                leftBottomDataLabelRect,
                leftDataLabelRect
            ];
        }

        const expectedResultsOut = [{
            vertically: false,
            horizontally: false
        }, {
            vertically: false,
            horizontally: true
        }, {
            vertically: false,
            horizontally: false
        }, {
            vertically: true,
            horizontally: false
        }, {
            vertically: false,
            horizontally: false
        }, {
            vertically: false,
            horizontally: true
        }, {
            vertically: false,
            horizontally: false
        }, {
            vertically: true,
            horizontally: false
        }];

        it('should detect data label inside chart', () => {
            const dataLabelRect: IRectBySize = {
                ...baseDataLabelRect
            };

            const expectedResult: IInsideResult = {
                vertically: true,
                horizontally: true
            };
            expect(isDataLabelInsideChart(dataLabelRect, chartBox)).toEqual(expectedResult);
        });

        it('should detect data label completely out of chart', () => {
            const results = prepareDataLabels(75).map(
                (dataLabelRect: IRectBySize) =>
                    isDataLabelInsideChart(dataLabelRect, chartBox)
            );

            expect(results).toEqual(expectedResultsOut);
        });

        it('should detect data label partially out of chart', () => {
            const results = prepareDataLabels(25).map(
                (dataLabelRect: IRectBySize) =>
                    isDataLabelInsideChart(dataLabelRect, chartBox)
            );

            expect(results).toEqual(expectedResultsOut);
        });
    });

    describe('showDataLabelInsideChart', () => {
        const chartBox: IRectBySize = {
            x: 0,
            y: 0,
            width: 200,
            height: 200
        };
        let point: any;
        beforeEach(() => {
            point = {
                dataLabel: {
                    x: 50,
                    y: 50,
                    width: 50,
                    height: 50,
                    show: jest.fn(),
                    hide: jest.fn(),
                    xSetter: jest.fn(),
                    ySetter: jest.fn(),
                    parentGroup: {
                        translateX: 0,
                        translateY: 0
                    }
                }
            };
        });

        it('should show data label when inside chart in both directions', () => {
            showDataLabelInsideChart(point, chartBox, 'horizontal');
            expect(point.dataLabel.show).toHaveBeenCalled();
            expect(point.dataLabel.hide).not.toHaveBeenCalled();
        });

        it('should move data label inside chart when partially left and direction is horizontal', () => {
            point.dataLabel.x = -25;
            showDataLabelInsideChart(point, chartBox, 'horizontal');
            expect(point.dataLabel.xSetter).toHaveBeenCalledWith(0);
        });

        it('should move data label inside chart when partially right and direction is horizontal', () => {
            point.dataLabel.x = 225;
            showDataLabelInsideChart(point, chartBox, 'horizontal');
            expect(point.dataLabel.xSetter).toHaveBeenCalledWith(150);
        });

        it('should hide data label when horizontally out and direction is vertical', () => {
            point.dataLabel.x = -25;
            showDataLabelInsideChart(point, chartBox, 'vertical');
            expect(point.dataLabel.hide).toHaveBeenCalled();
            expect(point.dataLabel.show).not.toHaveBeenCalled();
        });

        it('should move data label inside chart when partially above and direction is vertical', () => {
            point.dataLabel.y = -25;
            showDataLabelInsideChart(point, chartBox, 'vertical');
            expect(point.dataLabel.ySetter).toHaveBeenCalledWith(0);
        });

        it('should move data label inside chart when partially bellow and direction is vertical', () => {
            point.dataLabel.y = 225;
            showDataLabelInsideChart(point, chartBox, 'vertical');
            expect(point.dataLabel.ySetter).toHaveBeenCalledWith(150);
        });

        it('should hide data label when vertically out and direction is horizontal', () => {
            point.dataLabel.y = 225;
            showDataLabelInsideChart(point, chartBox, 'horizontal');
            expect(point.dataLabel.hide).toHaveBeenCalled();
            expect(point.dataLabel.show).not.toHaveBeenCalled();
        });
    });

    describe('isLabelOverlappingItsShape', () => {
        const shape = {
            width: 100,
            height: 100
        };

        it('should return false when label smaller than shape', () => {
            const point = {
                dataLabel: {
                    width: 50,
                    height: 50
                },
                shapeArgs: shape
            };

            expect(isLabelOverlappingItsShape(point)).toBeFalsy();
        });

        it('should return true when label is wider than shape', () => {
            const point = {
                dataLabel: {
                    width: 150,
                    height: 50
                },
                shapeArgs: shape
            };

            expect(isLabelOverlappingItsShape(point)).toBeTruthy();
        });

        it('should return true when label is higher than shape', () => {
            const point = {
                dataLabel: {
                    width: 50,
                    height: 150
                },
                shapeArgs: shape
            };

            expect(isLabelOverlappingItsShape(point)).toBeTruthy();
        });

        it('should work also for circle', () => {
            const point = {
                dataLabel: {
                    width: 50,
                    height: 150
                },
                shapeArgs: {
                    r: 20
                }
            };

            expect(isLabelOverlappingItsShape(point)).toBeTruthy();
        });
    });

    describe('intersectsParentLabel', () => {
        function createPointWithLabel(parentId: any, dataLabel: any) {
            return {
                parent: parentId,
                dataLabel
            };
        }

        const points = [
            createPointWithLabel(undefined, { x: 0, y: 0, width: 10, height: 10 }),
            createPointWithLabel('0', { x: 100, y: 100, width: 10, height: 10 }),
            createPointWithLabel('0', { x: 0, y: 0, width: 10, height: 10 })
        ];

        it('should return false if no parent given', () => {
            const intersects = intersectsParentLabel(points[0], points);
            expect(intersects).toEqual(false);
        });

        it('should return false if parent given but no intersection', () => {
            const intersects = intersectsParentLabel(points[1], points);
            expect(intersects).toEqual(false);
        });

        it('should return true if parent given and intersects', () => {
            const intersects = intersectsParentLabel(points[2], points);
            expect(intersects).toEqual(true);
        });
    });
});

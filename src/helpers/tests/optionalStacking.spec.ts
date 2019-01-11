// (C) 2007-2018 GoodData Corporation
import { getViewByTwoAttributes } from '../optionalStacking';
import { VisualizationObject } from '@gooddata/typings';

function createAttribute(id: number): VisualizationObject.IVisualizationAttribute {
    return {
        visualizationAttribute: {
            localIdentifier: `a${id}`,
            displayForm: {
                uri: `/gdc/md/myproject/obj/${id}`
            }
        }
    };
}

const [
    ATTRIBUTE_1,
    ATTRIBUTE_2,
    ATTRIBUTE_3
]: VisualizationObject.IVisualizationAttribute[] = [1, 2, 3].map(createAttribute);

describe('getViewByTwoAttributes', () => {
    it.each`
        description | viewBy | expectation
        ${'should return no attribute when viewBy is undefined'} | ${undefined} | ${[]}
        ${'should return no attribute when viewBy is empty'} | ${[]} | ${[]}
        ${'should return one attribute when viewBy is one-element array'} | ${[ATTRIBUTE_1]} | ${[ATTRIBUTE_1]}
        ${'should return one attribute when viewBy is single object'} | ${ATTRIBUTE_1} | ${[ATTRIBUTE_1]}
        ${'should return two attributes'} | ${[ATTRIBUTE_1, ATTRIBUTE_2]} | ${[ATTRIBUTE_1, ATTRIBUTE_2]}
        ${'should return first two attributes'} | ${[ATTRIBUTE_1, ATTRIBUTE_2, ATTRIBUTE_3]} |
                                                  ${[ATTRIBUTE_1, ATTRIBUTE_2]}
    `('$description', ({
        viewBy,
        expectation
    }: {
        viewBy: VisualizationObject.IVisualizationAttribute | VisualizationObject.IVisualizationAttribute[],
        expectation: VisualizationObject.IVisualizationAttribute | VisualizationObject.IVisualizationAttribute[]
    }) => {
        const result = getViewByTwoAttributes(viewBy);
        expect(result).toEqual(expectation);
    });
});

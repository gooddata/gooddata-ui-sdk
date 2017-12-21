import * as MdObjectHelper from '../MdObjectHelper';
import { charts } from '../../../__mocks__/fixtures';

describe('MdObjectHelper', () => {
    describe('getTotals', () => {
        it('should return table totals for table chart', () => {
            const totals = MdObjectHelper.getTotals(charts[1].visualizationObject);

            expect(totals).toEqual([{
                alias: 'average',
                attributeIdentifier: 'a1',
                measureIdentifier: 'm1',
                type: 'avg'
            }]);
        });

        it('should return empty table totals for bar chart', () => {
            const totals = MdObjectHelper.getTotals(charts[0].visualizationObject);
            expect(totals).toEqual([]);
        });
    });

    describe('getVisualizationClassUri', () => {
        it('should return uri', () => {
            expect(MdObjectHelper.getVisualizationClassUri(charts[0].visualizationObject))
                .toEqual('/gdc/md/myproject/obj/column');
        });
    });
});

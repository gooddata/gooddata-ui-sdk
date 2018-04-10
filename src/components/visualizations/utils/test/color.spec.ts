// (C) 2007-2018 GoodData Corporation
import { getLighterColor } from '../color';

describe('Transformation', () => {
    describe('Lighten color', () => {
        it('should lighten and darken color correctly', () => {
            expect(getLighterColor('rgb(00,128,255)', 0.5)).toEqual('rgb(128,192,255)');
            expect(getLighterColor('rgb(00,128,255)', -0.5)).toEqual('rgb(0,64,128)');
        });
    });
});

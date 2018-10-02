// (C) 2007-2018 GoodData Corporation
import { getLighterColor, normalizeColorToRGB } from '../color';

describe('Transformation', () => {
    describe('Lighten color', () => {
        it('should lighten and darken color correctly', () => {
            expect(getLighterColor('rgb(00,128,255)', 0.5)).toEqual('rgb(128,192,255)');
            expect(getLighterColor('rgb(00,128,255)', -0.5)).toEqual('rgb(0,64,128)');
        });
    });
});

describe('normalizeColorToRGB', () => {
    it('should just return the original color it is not in hex format', () => {
        const color = 'rgb(255, 255, 255)';
        expect(
            normalizeColorToRGB(color)
        ).toEqual(color);
    });
    it('should return color in rgb format if supplied color is in hex format', () => {
        const color = '#ffffff';
        const expectedColor = 'rgb(255, 255, 255)';
        expect(
            normalizeColorToRGB(color)
        ).toEqual(expectedColor);
    });
});

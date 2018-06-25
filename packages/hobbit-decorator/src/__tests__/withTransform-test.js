/*global describe*/
/*global it*/
/*global expect*/
/*global jest*/

import m from 'mithril';
import { withTransform } from '../withTransform';

describe('The withTransform enhancer', () => {
    const testComponent = {
        view: jest.fn(),
    };
    
    const testAttrs = {
        test: 'test',
        bar: 'foo',
    };
    
    it('should do nothing if given an empty object', () => {
        const enhanced = withTransform({})(testComponent);
        
        const rendered = m(enhanced, testAttrs);
        const child = rendered.tag.view(rendered);
        
        expect(child.attrs).toEqual(testAttrs);
    });
    
    it('should transform the property if a normal transformator', () => {
        const transforms = {
            test: jest.fn(() => 'foo'),
        };
        const enhanced = withTransform(transforms)(testComponent);
        
        const rendered = m(enhanced, testAttrs);
        const child = rendered.tag.view(rendered);
        
        expect(child.attrs).toEqual({
            test: 'foo',
            bar: 'foo',
        });
        expect(transforms.test).toHaveBeenCalledWith('test', testAttrs['test'], testAttrs);
    });
    
    it('should allow for transformators to be created', () => {
        const transforms = jest.fn(() => ({
            test: jest.fn(() => 'foo'),
        }));
        const enhanced = withTransform(transforms)(testComponent);
        
        const rendered = m(enhanced, testAttrs);
        const child = rendered.tag.view(rendered);
        
        expect(child.attrs).toEqual({
            test: 'foo',
            bar: 'foo',
        });
        expect(transforms).toHaveBeenCalledWith(testAttrs);
    });
});
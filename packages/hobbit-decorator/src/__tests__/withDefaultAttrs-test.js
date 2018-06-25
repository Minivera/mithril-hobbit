/*global describe*/
/*global it*/
/*global expect*/
/*global jest*/

import m from 'mithril';
import { withDefaultAttrs } from '../withDefaultAttrs';

describe('The withDefaultAttrs enhancer', () => {
    const testComponent = {
        view: () => {},
    };
    
    const testAttrs = {
        test: 'test',
    };
    
    it('should do nothing if given an empty object', () => {
        const enhanced = withDefaultAttrs({})(testComponent);
        
        const rendered = m(enhanced, testAttrs);
        const child = rendered.tag.view(rendered);
        
        expect(child.attrs).toEqual(testAttrs);
    });
    
    it('should do nothing if the default attribute is set', () => {
        const defaults = {
            test: 'foo',
        };
        const enhanced = withDefaultAttrs(defaults)(testComponent);
        
        const rendered = m(enhanced, testAttrs);
        const child = rendered.tag.view(rendered);
        
        expect(child.attrs).toEqual(testAttrs);
    });
    
    it('should set the default if the attribute is undefined', () => {
        const defaults = {
            test: 'test',
        };
        const enhanced = withDefaultAttrs(defaults)(testComponent);
        
        const rendered = m(enhanced, {});
        const child = rendered.tag.view(rendered);
        
        expect(child.attrs).toEqual(testAttrs);
    });
    
    it('should set the default with a function if the attribute is undefined', () => {
        const defaults = {
            test: jest.fn(() => 'test'),
        };
        const enhanced = withDefaultAttrs(defaults)(testComponent);
        
        const rendered = m(enhanced, {});
        const child = rendered.tag.view(rendered);
        
        expect(child.attrs).toEqual(testAttrs);
        expect(defaults.test).toHaveBeenCalledWith({});
    });
});
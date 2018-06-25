/*global describe*/
/*global it*/
/*global expect*/
/*global jest*/

import m from 'mithril';
import { withHandle } from '../withHandle';

describe('The withHandle enhancer', () => {
    const testComponent = {
        view: () => {},
    };
    
    const testAttrs = {
        test: 'test',
    };
    
    it('should do nothing if given an empty object', () => {
        const enhanced = withHandle({})(testComponent);
        
        const rendered = m(enhanced, testAttrs);
        const child = rendered.tag.view(rendered);
        
        expect(child.attrs).toEqual(testAttrs);
    });
    
    it('should add a function to the attributes when a handler is given', () => {
        const handlers = {
            handle: jest.fn(),
        };
        const enhanced = withHandle(handlers)(testComponent);
        
        const rendered = m(enhanced, testAttrs);
        const child = rendered.tag.view(rendered);
        
        expect(typeof child.attrs.handle).toBe('function');
        child.attrs.handle(testAttrs);
        expect(handlers.handle).toHaveBeenCalledWith(testAttrs);
    });
    
    it('should allow handlers to be created using a function with the attributes', () => {
        const handlers = jest.fn(() => ({
            handle: jest.fn(),
        }));
        const enhanced = withHandle(handlers)(testComponent);
        
        const rendered = m(enhanced, testAttrs);
        rendered.tag.view(rendered);
        
        expect(handlers).toHaveBeenCalledWith(testAttrs);
    });
});
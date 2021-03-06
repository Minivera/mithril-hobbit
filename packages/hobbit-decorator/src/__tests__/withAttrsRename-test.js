/*global describe*/
/*global it*/
/*global expect*/
/*global jest*/

import m from 'mithril';
import { withAttrsRename } from '../withAttrsRename';

describe('The withAttrsRename enhancer', () => {
    const testComponent = {
        view: jest.fn(),
    };
    
    const testAttrs = {
        test: 'foo',
        bar: 'foo',
    };
    
    it('should do nothing if given an empty object', () => {
        const enhanced = withAttrsRename({})(testComponent);
        
        const rendered = m(enhanced, testAttrs);
        const child = rendered.tag.view(rendered);
        
        expect(child.attrs).toEqual(testAttrs);
    });
    
    it('should rename the property to the new name if in an object', () => {
        const enhanced = withAttrsRename({
            test: 'foo',
        })(testComponent);
        
        const rendered = m(enhanced, testAttrs);
        const child = rendered.tag.view(rendered);
        
        expect(child.attrs).toEqual({
            foo: 'foo',
            bar: 'foo',
        });
    });
    
    it('should rename the property to the new name with a function', () => {
        const renamer = jest.fn(() => 'foo');
        const enhanced = withAttrsRename({
            test: renamer,
        })(testComponent);
        
        const rendered = m(enhanced, testAttrs);
        const child = rendered.tag.view(rendered);
        
        expect(renamer).toHaveBeenCalledWith(testAttrs);
        expect(child.attrs).toEqual({
            foo: 'foo',
            bar: 'foo',
        });
    });
});
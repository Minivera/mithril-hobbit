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
        
        expect(child).toEqual(testAttrs);
    });
});
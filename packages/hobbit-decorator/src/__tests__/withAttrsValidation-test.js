/*global describe*/
/*global it*/
/*global expect*/
/*global jest*/

import m from 'mithril';
import { withAttrsValidation } from '../withAttrsValidation';

describe('The withAttrsValidation enhancer', () => {
    const testComponent = {
        view: () => {},
    };
    
    const testAttrs = {
        test: 'test',
    };
    
    console.error = jest.fn();
    
    it('should do nothing if given an empty object', () => {
        const enhanced = withAttrsValidation({})(testComponent);
        
        const rendered = m(enhanced, testAttrs);
        rendered.tag.view(rendered);
        
        expect(console.error).not.toHaveBeenCalled();
    });
    
    it('should do nothing if the validator returns true', () => {
        const validators = {
            test: jest.fn(() => true),
        };
        const enhanced = withAttrsValidation(validators)(testComponent);
        
        const rendered = m(enhanced, testAttrs);
        rendered.tag.view(rendered);
        
        expect(validators.test).toHaveBeenCalledWith(testAttrs.test, 'test', testAttrs);
        expect(console.error).not.toHaveBeenCalled();
    });
    
    it('Should trigger an error if the validator returns false', () => {
        const validators = {
            test: jest.fn(() => false),
        };
        const enhanced = withAttrsValidation(validators)(testComponent);
        
        const rendered = m(enhanced, testAttrs);
        rendered.tag.view(rendered);
        
        expect(validators.test).toHaveBeenCalledWith(testAttrs.test, 'test', testAttrs);
        expect(console.error).toHaveBeenCalled();
    });
});
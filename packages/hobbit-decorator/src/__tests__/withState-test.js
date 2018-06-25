/*global describe*/
/*global it*/
/*global expect*/
/*global jest*/

import m from 'mithril';
import { withState } from '../withState';

describe('The withState enhancer', () => {
    const testComponent = {
        view: () => {},
    };
    
    const testAttrs = {
        test: 'test',
    };
    
    it('should add a state and a default setter if only given a valueName', () => {
        const enhanced = withState('foo')(testComponent);
        
        const rendered = m(enhanced, testAttrs);
        const child = rendered.tag.view(rendered);
        
        expect(child.attrs).toEqual({
            ...testAttrs,
            foo: null,
            setFoo: child.attrs.setFoo,
        });
        child.attrs.setFoo();
        // TODO: Could we test the changed state ?
    });
    
    it('should add a state and a setter if given both', () => {
        const enhanced = withState('foo', 'setTest')(testComponent);
        
        const rendered = m(enhanced, testAttrs);
        const child = rendered.tag.view(rendered);
        
        expect(child.attrs).toEqual({
            ...testAttrs,
            foo: null,
            setTest: child.attrs.setTest,
        });
    });
    
    it('should add a state with initialState and a setter', () => {
        const enhanced = withState('foo', 'setFoo', 'test')(testComponent);
        
        const rendered = m(enhanced, testAttrs);
        const child = rendered.tag.view(rendered);
        
        expect(child.attrs).toEqual({
            ...testAttrs,
            foo: 'test',
            setFoo: child.attrs.setFoo,
        });
    });
});
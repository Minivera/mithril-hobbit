/*global describe*/
/*global it*/
/*global expect*/
/*global jest*/

import { withTernary } from '../withTernary';

describe('The withTernary enhancer', () => {
    const testComponent = {
        view: () => {},
    };
    
    const fakeVNode = {
        attrs: {
            test: 'test',
        },
    };
    
    const firstHoc = jest.fn();
    const secondHoc = jest.fn();
    
    it('should return the first hoc if the condition is true', () => {
        const enhanced = withTernary(() => true, firstHoc)(testComponent);
        
        expect(typeof enhanced.view).toBe('function');
        
        enhanced.view(fakeVNode);
        expect(firstHoc).toHaveBeenCalledWith(expect.objectContaining({
            tag: testComponent,
            attrs: fakeVNode.attrs,
        }));
    });
    
    it('should return the second hoc if the condition is false', () => {
        const enhanced = withTernary(() => false, firstHoc, secondHoc)(testComponent);
        
        expect(typeof enhanced.view).toBe('function');
        
        enhanced.view(fakeVNode);
        expect(secondHoc).toHaveBeenCalledWith(expect.objectContaining({
            tag: testComponent,
            attrs: fakeVNode.attrs,
        }));
    });
    
    it('should return null if the condition is false and no second hoc was given', () => {
        const enhanced = withTernary(() => false, firstHoc)(testComponent);
        
        expect(typeof enhanced.view).toBe('function');
        
        const result = enhanced.view(fakeVNode);
        expect(result).toEqual(null);
    });
    
    it('should call the conditional with the test attributes', () => {
        const condition = jest.fn(() => true);
        const enhanced = withTernary(condition, firstHoc)(testComponent);
        
        expect(typeof enhanced.view).toBe('function');
        
        enhanced.view(fakeVNode);
        expect(condition).toHaveBeenCalledWith(fakeVNode.attrs);
    });
});
/*global describe*/
/*global it*/
/*global expect*/
/*global jest*/

import m from 'mithril';
import { enhance } from '../enhance';

describe('the enhance utility function', () => {
    const testComponent = {
        view() {
            return null;
        },
    };
    
    it('should render an enhanced component', () => {
        const args = {
            test: 'test',
        };
        const vnode = {
            attrs: {
                foo: 'bar',
            },
        };
        const enhancer = jest.fn(attrs => ({
            ...args,
            ...attrs,
        }));
        
        const enhanced = enhance(enhancer, testComponent);
        const rendered = enhanced.view(vnode);
        
        expect(enhancer).toHaveBeenCalledWith(vnode.attrs, vnode);
        expect(typeof enhanced.view).toBe('function');
        expect(rendered.attrs).toEqual({
            ...args,
            ...vnode.attrs,
        });
    });
    
    it('should return a renderable component', () => {
        const args = {
            test: 'test',
        };
        const enhancer = () => {};
        
        const enhanced = enhance(enhancer, testComponent);
        const rendered = m(enhanced, args);
        
        expect(rendered.attrs).toEqual({
            ...args,
        });
    });
});
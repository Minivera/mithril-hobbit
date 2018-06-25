/*global describe*/
/*global it*/
/*global expect*/
/*global jest*/

import m from 'mithril';
import { withFetch } from '../withFetch';

describe('The withFetch enhancer', () => {
    const testComponent = {
        view: () => {},
    };
    
    const testRequest = {
        method: 'GET',
        url: '//test',
        data: {
            test: 'test',
        },
    };
    
    it('should start a fetch when given a proper request', () => {
        const requestResult = 'test';
        m.request = jest.fn(() => 
            new Promise((resolve) => resolve(requestResult)));
        
        const enhanced = withFetch(testRequest)(testComponent);
        
        const rendered = m(enhanced, {});
        const child = rendered.tag.view(rendered);
        
        expect(child.attrs).toEqual({
            loading: true,
            error: null,
            data: undefined,
        });
        expect(m.request).toHaveBeenCalledWith(testRequest);
        // TODO: Find a good way to test that it gives the result to the comp
    });
    
    it('should trigger an error when the fetch returns an error', () => {
        const requestResult = 'test';
        m.request = jest.fn(() => 
            new Promise((resolve, reject) => reject(requestResult)));
        
        const enhanced = withFetch(testRequest)(testComponent);
        
        const rendered = m(enhanced, {});
        const child = rendered.tag.view(rendered);
        
        expect(child.attrs).toEqual({
            loading: true,
            error: null,
            data: undefined,
        });
        expect(m.request).toHaveBeenCalledWith(testRequest);
        // TODO: Find a good way to test that it gives the result to the comp
    });
    
    
    
    it('should trigger an error when the fetch returns an error', () => {
        const requester = jest.fn(() => testRequest);
        const testAttrs = {
            test: 'test',
        };
        
        const requestResult = 'test';
        m.request = jest.fn(() => 
            new Promise((resolve) => resolve(requestResult)));
        
        const enhanced = withFetch(requester)(testComponent);
        
        const rendered = m(enhanced, testAttrs);
        const child = rendered.tag.view(rendered);
        
        expect(requester).toHaveBeenCalledWith(testAttrs);
        expect(child.attrs).toEqual({
            loading: true,
            error: null,
            data: undefined,
            ...testAttrs,
        });
        expect(m.request).toHaveBeenCalledWith(testRequest);
        // TODO: Find a good way to test that it gives the result to the comp
    });
});
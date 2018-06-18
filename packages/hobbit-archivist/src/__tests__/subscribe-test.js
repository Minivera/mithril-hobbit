/*global describe*/
/*global it*/
/*global expect*/
/*global beforeEach*/
/*global jest*/

import m from 'mithril';
import { Store, notify } from '../store';
import { subscribe } from '../subscribe';

const testComponent = {
    view: function() {
        return m('div');
    },
};

describe('The subscribe function', () => {
    beforeEach(() => {
        Store._resetStore();
    });
    
    it('will cause an error throw if the store hasn\'t been created', () => {
        const result = subscribe(testComponent, 'test');
        expect(result.view).toThrow();
    });
    
    it('will cause an error throw if the component is not valid', () => {
        expect(() => subscribe({}, 'test')).toThrow();
    });
    
    it('will properly bind to the store if given valid arguments', () => {
        Store.createStore({
            test: 'test',
        });
        
        const result = subscribe(testComponent, 'test');
        const rendered = result.view(result);
        
        expect(rendered.attrs.state).toEqual('test');
    });
    
    it('will properly subscribe to changes in the store', () => {
        Store.createStore({
            test: 'test',
        });
        
        let subscribed = false;
        testComponent.onstatechanged = jest.fn(() => {
            subscribed = true;
        });
        
        subscribe(testComponent, 'test');
        
        notify('test');
        
        expect(subscribed).toEqual(true);
        
        subscribed = false;
        
        notify('foo');
        
        expect(subscribed).toEqual(false);
    });
    
    it('will properly unsubscribe to changes in the store if asked to', () => {
        Store.createStore({
            test: 'test',
        });
        
        let subscribed = true;
        Store.unsubscribe = jest.fn(() => {
            subscribed = false;
        });
        
        const result = subscribe(testComponent, 'test');
        const rendered = result.view(result);
        expect(typeof rendered.attrs.unsubscribe).toBe('function');
        
        rendered.attrs.unsubscribe();
        
        expect(subscribed).toEqual(false);
    });
});
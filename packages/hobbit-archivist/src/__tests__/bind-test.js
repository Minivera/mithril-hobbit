/*global describe*/
/*global it*/
/*global expect*/
/*global beforeEach*/

import m from 'mithril';
import { Store } from '../store';
import { bind } from '../bind';

const testComponent = {
    view: function() {
        return m('div');
    },
};

describe('The bind function', () => {
    beforeEach(() => {
        Store._resetStore();
    });
    
    it('will cause an error throw if the store hasn\'t been created', () => {
        const result = bind(testComponent, 'test');
        expect(result.view).toThrow();
    });
    
    it('will cause an error throw if the component is not valid', () => {
        expect(() => bind({}, 'test')).toThrow();
    });
    
    it('will properly bind to the store if given valid arguments', () => {
        Store.createStore({
            test: 'test',
        });
        
        const result = bind(testComponent, 'test');
        const rendered = result.view(result);
        
        expect(rendered.attrs.state).toEqual('test');
    });
});
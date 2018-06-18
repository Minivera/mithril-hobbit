/*global describe*/
/*global it*/
/*global expect*/
/*global beforeEach*/

import memoryInterface from '../memoryInterface';

describe('The MemoryInterface class', () => {
    it('will construct with the initial data', () => {
        const data = {
            test: 'test',
        };
        
        let store = new memoryInterface();
        
        expect(store.all()).toEqual({});
        
        store = new memoryInterface(data);
        
        expect(store.all()).toEqual(data);
    });
    
    it('will set data in the store properly', () => {
        const data = {
            test: 'test',
        };
        
        const store = new memoryInterface(data);
        
        store.set('test.foo', {});
        expect(store.all()).toEqual({
            test: 'test',
        });
        
        store.set('test', {});
        expect(store.all()).toEqual({
            test: {},
        });
        
        store.set('test.foo.bar', 'bar');
        
        expect(store.all()).toEqual({
            test: {
                foo: {
                    bar: 'bar',
                },
            },
        });
    });
    
    it('will remove data in the store properly', () => {
        const data = {
            test: {
                foo: {
                    bar: 'bar',
                },
            },
        };
        
        const store = new memoryInterface(data);
        
        store.remove('test.foo.bar');
        
        expect(store.all()).toEqual({
            test: {
                foo: {},
            },
        });
        
        store.remove('test');
        expect(store.all()).toEqual({});
    });
    
    it('will find data in the store properly', () => {
        const data = {
            test: {
                foo: {
                    bar: 'bar',
                },
            },
        };
        
        const store = new memoryInterface(data);
        
        expect(store.find('test')).toEqual({
            foo: {
                bar: 'bar',
            },
        });
        expect(store.find('test.foo.bar')).toEqual('bar');
        expect(store.find('test.bar')).toEqual(undefined);
    });
    
    it('will clear data in the store properly', () => {
        const data = {
            test: {
                foo: {
                    bar: 'bar',
                },
            },
        };
        
        const store = new memoryInterface(data);
        
        store.clear();
        expect(store.all()).toEqual({});
    });
});
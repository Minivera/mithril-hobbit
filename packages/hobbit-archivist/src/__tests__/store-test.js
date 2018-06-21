/*global describe*/
/*global it*/
/*global expect*/
/*global beforeEach*/
/*global jest*/

import { notify, Store } from '../store';

describe('The Store object', () => {
    beforeEach(() => {
        Store._resetStore();
    });
    
    describe('when using the createStore method', () => {
        it('will create with a basic memeory interface', () => {
            const result = Store.createStore();
            
            expect(Store.getState()).toEqual({});
            expect(result).toEqual(Store);
        });
        
        it('will create with a basic memeory interface with intial state', () => {
            const state = {
                test: 'test',
            };
            Store.createStore(state);
            
            expect(Store.getState()).toEqual(state);
        });
        
        it('will create with a connector interface with intial state', () => {
            const state = {
                test: 'test',
            };
        
            const connector = jest.fn();
            
            Store.createStore(state, connector);
            
            expect(connector).toHaveBeenCalledWith(state);
        });
    });
    
    describe('when using the getState method', () => {
        it('will cause an error throw if the store hasn\'t been created', () => {
            expect(Store.getState).toThrow();
        });
        
        it('will get all the state if set', () => {
            const state = {
                test: 'test',
            };
            Store.createStore(state);
            
            expect(Store.getState()).toEqual(state);
        });
    });
    
    describe('when using the subscribe method', () => {
        it('will properly subscribe and return the sub key', () => {
            Store.createStore();
            
            expect(Store.subscribe({})).toEqual(0);
        });
    });
    
    describe('when using the unsubscribe method', () => {
        it('will properly subscribe and return the sub key', () => {
            Store.createStore();
            
            const subscriber = {
                notify: jest.fn(),
            };
            
            const key = Store.subscribe(subscriber);
            Store.unsubscribe(key);
            notify();
            
            expect(subscriber.notify).not.toHaveBeenCalled();
        });
    });
    
    describe('when using the find method', () => {
        it('will cause an error throw if the store hasn\'t been created', () => {
            expect(Store.find).toThrow();
        });
        
        it('will get the element from the state if set', () => {
            const state = {
                test: 'test',
            };
            Store.createStore(state);
            
            expect(Store.find('test')).toEqual('test');
        });
    });
    
    describe('when using the set method', () => {
        it('will cause an error throw if the store hasn\'t been created', () => {
            expect(Store.set).toThrow();
        });
        
        it('will set the element from the state', () => {
            const state = {
                test: 'test',
            };
            Store.createStore(state);
            Store.set('test', 'bar');
            
            expect(Store.getState()).toEqual({
                test: 'bar',
            });
        });
        
        it('will notify all subscribers when setting', () => {
            const state = {
                test: 'test',
            };
            Store.createStore(state);
            
            const subscriber = {
                notify: jest.fn(),
            };
            
            Store.subscribe(subscriber);
            Store.set('test', 'bar');
            
            expect(Store.getState()).toEqual({
                test: 'bar',
            });
            expect(subscriber.notify).toHaveBeenCalledWith('test');
        });
    });
    
    describe('when using the remove method', () => {
        it('will cause an error throw if the store hasn\'t been created', () => {
            expect(Store.remove).toThrow();
        });
        
        it('will remove the element from the state', () => {
            const state = {
                test: 'test',
            };
            Store.createStore(state);
            Store.remove('test');
            
            expect(Store.getState()).toEqual({});
        });
        
        it('will notify all subscribers when removing', () => {
            const state = {
                test: 'test',
            };
            Store.createStore(state);
            
            const subscriber = {
                notify: jest.fn(),
            };
            
            Store.subscribe(subscriber);
            Store.remove('test');
            
            expect(Store.getState()).toEqual({});
            expect(subscriber.notify).toHaveBeenCalledWith('test');
        });
    });
    
    describe('when using the reset method', () => {
        it('will cause an error throw if the store hasn\'t been created', () => {
            expect(Store.reset).toThrow();
        });
        
        it('will reset the state', () => {
            const state = {
                test: 'test',
            };
            Store.createStore(state);
            Store.reset();
            
            expect(Store.getState()).toEqual({});
        });
    });
});
/*global describe*/
/*global it*/
/*global expect*/
/*global jsdom*/
/*global jest*/
/*global beforeEach*/

import m from 'mithril';
import { routeComponent, r } from '../router';
            
const testComponent = {
    view: function() {
        return m('div');
    },
};

describe('The routeComponent object', () => {
    it('creates its event listener on oncreate', () => {
        window.addEventListener = jest.fn();
        
        routeComponent.oncreate();
        
        expect(window.addEventListener).toHaveBeenCalled();
    });
    
    it('removes its event listener on onremove', () => {
        window.removeEventListener = jest.fn();
        
        routeComponent.onremove();
        
        expect(window.removeEventListener).toHaveBeenCalled();
    });
    
    it('triggers a redraw on routing', () => {
        m.redraw = jest.fn();
        
        routeComponent.redrawNode();
        
        expect(m.redraw).toHaveBeenCalled();
    });
});

describe('The r function', () => {
    beforeEach(() => {
        r._resetRouter();
    });
    
    it('will cause an error if the history manager hasn\'t been created yet', () => {
        expect(r).toThrow();
    });
    
    it('will cause an error if receiving no arguments', () => {
        r.createRouter();
        expect(r).toThrow();
    });
    
    describe('when used with a single route as its parameters', () => {
        it('will render null if given a route that does not match', () => {
            jsdom.reconfigure({
                url: 'https://test.com/test',
            });
            
            r.createRouter();
            const result = r('/foo', m('div'));
            expect(result).toEqual(null);
        });
        
        it('will render the route component if given a matching route', () => {
            jsdom.reconfigure({
                url: 'https://test.com/test',
            });
            
            r.createRouter();
            const result = r('/test', m(testComponent));
            expect(typeof result.tag).toBe('object');
        });
        
        it('will render nothing if given a matching route, bot not a valid component', () => {
            jsdom.reconfigure({
                url: 'https://test.com/test',
            });
            
            r.createRouter();
            const result = r('/test', {});
            expect(result).toEqual(null);
        });
        
        it('will render the route vnode if given a matching route', () => {
            jsdom.reconfigure({
                url: 'https://test.com/test',
            });
            
            r.createRouter();
            const result = r('/test', m('div'));
            expect(typeof result.tag).toBe('object');
        });
        
        it('will render the route component with parameters if given a matching route', () => {
            jsdom.reconfigure({
                url: 'https://test.com/test',
            });
            
            r.createRouter();
            const result = r('/:test', m(testComponent));
            const rendered = result.tag.view(result)[0];
            expect(typeof result.tag).toBe('object');
            
            expect(rendered.attrs.params).toEqual({
                test: 'test',
            });
        });
        
        describe('and options', () => {
            it('will render the route loosely with the loose option', () => {
                jsdom.reconfigure({
                    url: 'https://test.com/test/foo',
                });
                
                r.createRouter();
                let result = r('/test', m(testComponent));
                expect(result).toEqual(null);
                result = r('/test', m(testComponent), { loose: true });
                expect(typeof result.tag).toBe('object');
            });
            
            it('will handle case when used with caseSensitive', () => {
                jsdom.reconfigure({
                    url: 'https://test.com/Test',
                });
                
                r.createRouter();
                let result = r('/test', m(testComponent));
                expect(result).toEqual(null);
                result = r('/test', m(testComponent), { caseSensitive: false });
                expect(typeof result.tag).toBe('object');
            });
            
            it('will force url strictness with strict', () => {
                jsdom.reconfigure({
                    url: 'https://test.com/test/',
                });
                
                r.createRouter();
                let result = r('/test', m(testComponent), { strict: true });
                expect(result).toEqual(null);
                result = r('/test/', m(testComponent), { strict: true });
                expect(typeof result.tag).toBe('object');
            });
        });
    });
    
    describe('when used with multiple routes as its parameters', () => {
        it('will render null if given routes that do not match', () => {
            jsdom.reconfigure({
                url: 'https://test.com/test',
            });
            
            r.createRouter();
            const result = r({
                '/foo': m(testComponent),
                '/bar': m(testComponent),
            });
            
            expect(result).toEqual(null);
        });
        
        it('will render the right route component if given a matching route', () => {
            jsdom.reconfigure({
                url: 'https://test.com/test',
            });
            
            r.createRouter();
            const result = r({
                '/test': m(testComponent),
                '/bar': m('div'),
            });
            
            expect(typeof result.tag).toBe('object');
            const rendered = result.tag.view(result)[0];
            expect(typeof rendered.tag.view).toBe('function');
        });
        
        it('will render the right route vnode if given a matching route', () => {
            jsdom.reconfigure({
                url: 'https://test.com/test',
            });
            
            r.createRouter();
            const result = r({
                '/test': m('div'),
                '/bar': m('div'),
            });
            
            expect(typeof result.tag).toBe('object');
        });
        
        it('will render nothing if given a matching route, bot not a valid component', () => {
            jsdom.reconfigure({
                url: 'https://test.com/test',
            });
            
            r.createRouter();
            const result = r({
                '/test': {},
                '/bar': {},
            });
            expect(result).toEqual(null);
        });
        
        describe('and options', () => {
            it('will render the route loosely with the loose option', () => {
                jsdom.reconfigure({
                    url: 'https://test.com/test/foo',
                });
                
                r.createRouter();
                let result = r({
                    '/test': m(testComponent),
                    '/bar': m('div'),
                });
                
                expect(result).toEqual(null);
                result = r({
                    '/test': m(testComponent),
                    '/bar': m('div'),
                }, { loose: true });
                expect(typeof result.tag).toBe('object');
            });
            
            it('will handle case when used with caseSensitive', () => {
                jsdom.reconfigure({
                    url: 'https://test.com/Test',
                });
                
                r.createRouter();
                let result = r({
                    '/test': m(testComponent),
                    '/bar': m('div'),
                });
                expect(result).toEqual(null);
                
                result =r({
                    '/test': m(testComponent),
                    '/bar': m('div'),
                }, { caseSensitive: false });
                expect(typeof result.tag).toBe('object');
            });
            
            it('will force url strictness with strict', () => {
                jsdom.reconfigure({
                    url: 'https://test.com/test/',
                });
                
                r.createRouter();
                let result = r({
                    '/test': m(testComponent),
                    '/bar': m('div'),
                }, { strict: true });
                expect(result).toEqual(null);
                
                result = r({
                    '/test/': m(testComponent),
                    '/bar/': m('div'),
                }, { strict: true });
                expect(typeof result.tag).toBe('object');
            });
        });
    });
});

describe('The r.getLocation function', () => {
    beforeEach(() => {
        r._resetRouter();
    });
    
    it('will cause an error if the history manager hasn\'t been created yet', () => {
        expect(r.getLocation).toThrow();
    });
    
    it('will return the location from the history manager', () => {
        jsdom.reconfigure({
            url: 'https://test.com/test',
        });
        
        r.createRouter();
        expect(r.getLocation()).toEqual({
            params: {},
            path: '/test',
            pattern: '/test',
            sender: '',
            url: '/test',
        });
    });
});

describe('The r.navigate function', () => {
    beforeEach(() => {
        r._resetRouter();
    });
    
    it('will cause an error if the history manager hasn\'t been created yet', () => {
        expect(r.navigate).toThrow();
    });
    
    it('will navigate properly if given the parameters', () => {
        r.createRouter();
        r.navigate('/test');
        expect(r.getLocation()).toEqual({
            params: {},
            path: '/test',
            pattern: '/test',
            sender: '',
            url: '/test',
        });
    });
});

describe('The r.withLocation function', () => {
    beforeEach(() => {
        r._resetRouter();
    });
    
    it('will cause an error if the history manager hasn\'t been created yet', () => {
        expect(r.withLocation).toThrow();
    });
    
    it('will add empty parameters in the attributes if the pattern does not match', () => {
        jsdom.reconfigure({
            url: 'https://test.com/test',
        });
        
        r.createRouter();
        const result = r.withLocation('/foo/:bar', testComponent);
        expect(typeof result.view).toBe('function');
        const rendered = result.view(result);
        
        expect(rendered.attrs.params).toEqual({});
    });
    
    it('will add the parameters in the attributes on a route match', () => {
        jsdom.reconfigure({
            url: 'https://test.com/test',
        });
        
        r.createRouter();
        const result = r.withLocation('/:test', testComponent);
        expect(typeof result.view).toBe('function');
        const rendered = result.view(result);
        
        expect(rendered.attrs.params).toEqual({
            test: 'test',
        });
    });
});

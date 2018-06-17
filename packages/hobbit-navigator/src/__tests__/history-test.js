/*global describe*/
/*global it*/
/*global expect*/
/*global jsdom*/
/*global jest*/

import { checkSupport, History } from '../history';

//Keep this here, test must be updated if the API is expected to change
const baseConfig = {
    hashbanged: false,
    location: null,
    hashbangPrefix: '#!',
};

describe('The checkSupport method', () => {
    it('will cause an error log and return false when window is undefined', () => {
        let error = false;
        console.warn = jest.fn(() => {
            error = true;
        });
            
        const result = checkSupport(undefined);
        
        expect(result).toEqual(false);
        expect(error).toEqual(true);
    });
    
    it('will cause an error log and return false when window.history is undefined', () => {
        let error = false;
        console.warn = jest.fn(() => {
            error = true;
        });
        
        const result = checkSupport({ document: {}, history: undefined });
        
        expect(result).toEqual(false);
        expect(error).toEqual(true);
    });
});

describe('The History class', () => {
    it('builds with the default configuration', () => {
        jsdom.reconfigure({
            url: 'https://test.com/test',
        });
        
        const manager = new History();
        
        expect(manager.location).toEqual({
            path: '/test',
            url: '/test',
            pattern: '/test',
            params: {},
            sender: '',
        });
        
        expect(manager.configuration).toEqual(baseConfig);
    });
    
    describe('builds with a custom configuration', () => {
        describe('builds the proper location', () => {
            it('when provided a location string', () => {
                const location = '/foo';
                const configuration = Object.assign({}, baseConfig, {
                    location,
                });
                
                const manager = new History({
                    location,
                });
                
                expect(manager.location).toEqual({
                    path: '/foo',
                    url: '/foo',
                    pattern: '/foo',
                    params: {},
                    sender: '',
                });
                
                expect(manager.configuration).toEqual(configuration);
            });
            
            it('when provided a location object', () => {
                const location = {
                    path: '/foo',
                    url: '/foo',
                    pattern: '/foo',
                    params: {},
                    sender: '',
                };
                const configuration = Object.assign({}, baseConfig, {
                    location,
                });
                
                const manager = new History({
                    location,
                });
                
                expect(manager.location).toEqual(location);
                
                expect(manager.configuration).toEqual(configuration);
            });
        });
        
        it('when provided a  hashbang config', () => {
            jsdom.reconfigure({
                url: 'https://test.com#__!test',
            });
        
            const extendedConfig = {
                hashbanged: true,
                hashbangPrefix: '#__!',
            };
            const configuration = Object.assign({}, baseConfig, extendedConfig);
            
            const manager = new History(extendedConfig);
            
            expect(manager.location).toEqual({
                path: '/test',
                url: '#__!test',
                pattern: '/test',
                params: {},
                sender: '',
            });
            
            expect(manager.configuration).toEqual(configuration);
            
            extendedConfig.location = '/test';
            const manager2 = new History(extendedConfig);
            
            expect(manager2.location).toEqual({
                path: '/test',
                url: '#__!/test',
                pattern: '/test',
                params: {},
                sender: '',
            });
        });
    });
    
    it('returns the properly built location object after new from getLocation', () => {
        jsdom.reconfigure({
            url: 'https://test.com/test',
        });
        
        const manager = new History();
        
        expect(manager.getLocation()).toEqual({
            path: '/test',
            url: '/test',
            pattern: '/test',
            params: {},
            sender: '',
        });
    });
    
    describe('when calling the extracParams method', () => {
        it('returns the right params', () => {
            jsdom.reconfigure({
                url: 'https://test.com/test',
            });
            
            const manager = new History();
            
            expect(manager.extractParams('/:test')).toEqual({
                test: 'test',
            });
        });
        
        it('returns the multiple params if given many', () => {
            jsdom.reconfigure({
                url: 'https://test.com/test/foo',
            });
            
            const manager = new History();
            
            expect(manager.extractParams('/:test/:bar')).toEqual({
                test: 'test',
                bar: 'foo',
            });
        });
        
        it('returns null if there is no match', () => {
            jsdom.reconfigure({
                url: 'https://test.com/test',
            });
            
            const manager = new History();
            
            expect(manager.extractParams('/:test/:bar')).toEqual(null);
        });
        
        describe('with the options', () => {
            it('should use a looser comparison when using the loose option', () => {
                jsdom.reconfigure({
                    url: 'https://test.com/test/foo',
                });
                
                const manager = new History();
                
                expect(manager.extractParams('/:test', { loose: true })).toEqual({
                    test: 'test',
                });
            });
            
            it('should be case sensitive if given the option', () => {
                jsdom.reconfigure({
                    url: 'https://test.com/Test/foo',
                });
                
                const manager = new History();
                
                expect(manager.extractParams('/test/:bar', { caseSensitive: true })).toEqual(null);
                expect(manager.extractParams('/Test/:bar', { caseSensitive: true })).toEqual({
                    bar: 'foo',
                });
            });
            
            it('should be strict with url conventions if given the strict option', () => {
                jsdom.reconfigure({
                    url: 'https://test.com/test/',
                });
                
                const manager = new History();
                
                expect(manager.extractParams('/test', { strict: true })).toEqual(null);
                expect(manager.extractParams('/test/', { strict: true })).toEqual({});
            });
        });
    });
    
    describe('when calling the navigate method', () => {
        it('navigates to a basic path', () => {
            const manager = new History();
            
            manager.navigate('/test');
            
            expect(manager.getLocation()).toEqual({
                params: {},
                path: '/test',
                pattern: '/test',
                sender: '',
                url: '/test',
            });
        });
        
        it('navigates to a parameterized path', () => {
            const manager = new History();
            
            const params = {
                test: 'foo',
            };
            manager.navigate('/:test', {
                params,
            });
            
            expect(manager.getLocation()).toEqual({
                params,
                path: '/foo',
                pattern: '/:test',
                sender: '',
                url: '/foo',
            });
        });
        
        it('navigates with a sender if given', () => {
            const manager = new History();
            
            manager.navigate('/test', {
                sender: 'test',
            });
            
            expect(manager.getLocation()).toEqual({
                params: {},
                path: '/test',
                pattern: '/test',
                sender: 'test',
                url: '/test',
            });
        });
        
        it('won\'t navigate to the same path unless given the force option', () => {
            const manager = new History();
            
            const params = {
                test: 'bar',
            };
            manager.navigate('/:test', {
                params,
            });
            
            manager.navigate('/:foo', {
                params: {
                    foo: 'bar',
                },
            });
            
            expect(manager.getLocation()).toEqual({
                params,
                path: '/bar',
                pattern: '/:test',
                sender: '',
                url: '/bar',
            });
            
            manager.navigate('/:foo', {
                params: {
                    foo: 'bar',
                },
                force: true,
            });
            
            expect(manager.getLocation()).toEqual({
                params: {
                    foo: 'bar',
                },
                path: '/bar',
                pattern: '/:foo',
                sender: '',
                url: '/bar',
            });
        });
    });
        
    describe('when calling the navigatePure method', () => {
        it('navigates to a basic path, even when not supported', () => {
            const manager = new History();
            
            manager.navigatePure('/test');
            
            expect(manager.getLocation()).toEqual({
                params: {},
                path: '/test',
                pattern: '/test',
                sender: '',
                url: '/test',
            });
            
            manager.supported = false;
            manager.navigatePure('/test');
            
            expect(manager.getLocation()).toEqual({
                params: {},
                path: '/test',
                pattern: '/test',
                sender: '',
                url: '/test',
            });
        });
        
        it('navigates to a basic path also work with hashbang', () => {
            const manager = new History({
                hashbanged: true,
            });
            
            manager.navigatePure('/test');
            
            expect(manager.getLocation()).toEqual({
                params: {},
                path: '/test',
                pattern: '/test',
                sender: '',
                url: '#!/test',
            });
        });
        
        it('navigates to a basic path with state', () => {
            const manager = new History();
            
            const state = {
                test: 'test',
            };
            manager.navigatePure('/test', state);
            
            expect(manager.getLocation()).toEqual({
                params: state,
                path: '/test',
                pattern: '/test',
                sender: '',
                url: '/test',
            });
        });
        
        it('navigates to a basic path with a sender', () => {
            const manager = new History();
            
            const sender = 'test';
            manager.navigatePure('/test', {}, {
                sender,
            });
            
            expect(manager.getLocation()).toEqual({
                params: {},
                path: '/test',
                pattern: '/test',
                sender,
                url: '/test',
            });
        });
        
        it('navigates with a replace rather than a push with the replace option', () => {
            const manager = new History();
            
            let error = false;
            console.warn = jest.fn(() => {
                error = true;
            });
            
            manager.navigatePure('/test', {}, {
                replace: true,
            });
            
            expect(manager.getLocation()).toEqual({
                params: {},
                path: '/test',
                pattern: '/test',
                sender: '',
                url: '/test',
            });
            expect(error).toEqual(false);
            
            manager.supported = false;
            manager.navigatePure('/test', {}, {
                replace: true,
            });
            
            expect(manager.getLocation()).toEqual({
                params: {},
                path: '/test',
                pattern: '/test',
                sender: '',
                url: '/test',
            });
            expect(error).toEqual(true);
        });
    });
    
    describe('when calling the compare method', () => {
        it('properly compares with basic options', () => {
            jsdom.reconfigure({
                url: 'https://test.com/test',
            });
            
            const manager = new History();
            
            expect(manager.compare('/test')).toEqual(true);
        });
        
        it('properly compares with the loose option', () => {
            jsdom.reconfigure({
                url: 'https://test.com/test/foo',
            });
            
            const manager = new History();
            
            expect(manager.compare('/test')).toEqual(false);
            expect(manager.compare('/test', { loose: true })).toEqual(true);
        });
        
        it('properly compares with the caseSensitive option', () => {
            jsdom.reconfigure({
                url: 'https://test.com/Test',
            });
            
            const manager = new History();
            
            expect(manager.compare('/test', { caseSensitive: true })).toEqual(false);
            expect(manager.compare('/Test', { caseSensitive: true })).toEqual(true);
            
            expect(manager.compare('/test', { caseSensitive: false })).toEqual(true);
            expect(manager.compare('/Test', { caseSensitive: false })).toEqual(true);
        });
        
        it('properly compares with the strict option', () => {
            jsdom.reconfigure({
                url: 'https://test.com/test/',
            });
            
            const manager = new History();
            
            expect(manager.compare('/test', { strict: true })).toEqual(false);
            expect(manager.compare('/test/', { strict: true })).toEqual(true);
        });
    });
});
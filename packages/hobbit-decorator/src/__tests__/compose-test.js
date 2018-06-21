/*global describe*/
/*global it*/
/*global expect*/

import { compose } from '../compose';

describe('the compose utility function', () => {
    const plus1 = x => x + 1;
    const times2 = x => x * 2;
    const add = (x, y) => x + y;
        
    it('should compose multiple functions', () => {
        expect(compose(plus1)(1)).toEqual(2);
        expect(compose(plus1, times2)(2)).toEqual(5);
        expect(compose(plus1, times2, times2)(3)).toEqual(13);
    });
    
    it('should work with multiple arguments', () => {
        expect(compose(times2, add)(1, 2)).toEqual(6);
    });
    
    it('should do nothing if given no arguments', () => {
        expect(compose()(1)).toEqual(1);
        expect(compose()(1, 2)).toEqual(1);
        expect(compose()()).toEqual(undefined);
    });
});

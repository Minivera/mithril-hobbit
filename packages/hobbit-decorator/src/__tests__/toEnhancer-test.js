/*global describe*/
/*global it*/
/*global expect*/
/*global jest*/

import { toEnhancer } from '../toEnhancer';

describe('the toEnhancer enhancer', () => {
    const testComponent = {
        view: jest.fn(),
    };
    
    it('should transform a component to an enhancer', () => {
        const enhanced = toEnhancer(testComponent);
        
        const rendered = enhanced();
        
        expect(typeof rendered.view).toBe('function');
        
        // TODO: Improve the next step of that test
        rendered.view({ attrs: {} });
    });
});

/*global describe*/
/*global it*/
/*global expect*/
/*global jest*/

import { expand } from '../expand';

describe('the expand utility function', () => {
    const testComponent = {
        view: jest.fn(() => {}),
    };
    
    it('should do nothing if not expanded with a function', () => {
        const expanded = expand({
            view: {},
        })(testComponent);
        
        expanded.view();
        
        expect(testComponent.view).toHaveBeenCalled();
    });
    
    it('should expand a function', () => {
        const expander = jest.fn(() => {});
        const expanded = expand({
            view: expander,
        })(testComponent);
        
        expanded.view();
        
        expect(expander).toHaveBeenCalled();
        expect(testComponent.view).toHaveBeenCalled();
    });
    
    it('should handle return values as args', () => {
        const args = {
            test: 'test',
        };
        
        const expander = jest.fn(() => args);
        const expanded = expand({
            view: expander,
        })(testComponent);
        
        expanded.view();
        
        expect(expander).toHaveBeenCalled();
        expect(testComponent.view).toHaveBeenCalledWith(args);
    });
});

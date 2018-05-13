/**
 * @module memoryInterface
 */

/**
 * Helper function that sets a value recursively inside an object without
 * mutating the original object.
 * @function setRecursively
 * @param {Object} object - The object to set recursively, will be changed
 * for the recursive searched element in the object tree during recursion.
 * @param {Array<string>} pathParts - An array of strings that represent the
 * path to follow inside the nested tree of objects. Will be slowly sliced
 * during recursion.
 * @param {*} value - The value to set at the end of the recursive path.
 * @returns {Object} Returns the original object cloned and updated with
 * the new value.
 */
const setRecursively = (object, pathParts, value) => {
    //Make sure the current object is actually an object
    if (typeof object !== 'object')
    {
        //If not, return self and cancel the recursivity
        return object;
    }
    //Otherwise, continue with the resursivity without mutating
    return Object.assign({}, object, {
        [pathParts[0]]: pathParts.length > 1 ? 
            setRecursively(object[pathParts[0]], pathParts.slice(1), value)
            : value,
    });
};

/**
 * Interface that exposes all the required methods to work as a connector
 * for the state store.
 * @class
 * @property {Object} data - The data stored inside memory for the state
 * management.
 */
export default class memoryInterface {
    /**
     * Constructor that set the internal data with the initialData if any.
     * @param {Object} [initialData={}] - The initial state to store when
     * creating this interface.
     */
    constructor(initialData = {}) {
        this.data = initialData;
    }
    
    /**
     * Sets a value under the given path in the state. If the path does not
     * exist, it will be created as a path of objects.
     * @param {string} path - The path where the value is located, must
     * be a string using the usual dot notation for javascript.
     * @param {*} value - The value to set a the end of the path.
     * @see [setRecursively]{@link module:memoryInterface~setRecursively}
     */
    set(path, value) {
        this.data = setRecursively(this.data, path.split('.'), value);
    }
    
    /**
     * Removes a value under the given path in the state. It removes the value
     * by setting it as undefined.
     * @param {string} path - The path where the value is located, must
     * be a string using the usual dot notation for javascript.
     * @see [setRecursively]{@link module:memoryInterface~setRecursively}
     */
    remove(path) {
        this.data = setRecursively(this.data, path.split('.'), undefined);
    }
    
    /**
     * Finds a value under the given path in the state. I will follow the path
     * as long as it exists and will return immeditatly if the path does not
     * exists.
     * @param {string} path - The path where the value is located, must
     * be a string using the usual dot notation for javascript.
     * @returns {*} Returns the found value or undefined if it could not be
     * found.
     */
    find(path) {
        let value = this.data;
        //Split the path into its parts if it is a valid path
        const parts = path.split('.');
        //Go through all parts
        for (let part in parts) {
            part = parts[part];
            //If the part can be found
            if (value[part])
            {
                //Continue deeper
                value = value[part];
            }
            else
            {
                //Else, cancel the search
                return undefined;
            }
        }
        //Return the latest found value
        return value;
    }
    
    /**
     * Clears the memory state by replacing the old state with an empty object.
     */
    clear() {
        this.data = {};
    }
    
    /**
     * Returns all the content currently stored inside the state.
     * @returns {Object} Returns the object store in memory.
     */
    all() {
        return this.data;
    }
}

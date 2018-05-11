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

export default class memoryInterface {
    constructor(initialData = {}) {
        this.data = initialData;
    }
    
    set(path, value) {
        this.data = setRecursively(this.data, path.split('.'), value);
    }
    
    remove(path) {
        this.data = setRecursively(this.data, path.split('.'), undefined);
    }
    
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
                break;
            }
        }
        //Return the latest found value
        return value;
    }
    
    clear() {
        this.data = {};
    }
    
    all() {
        return this.data;
    }
}

import pathToRegexp from 'path-to-regexp';

const baseConfig = {
    hashbanged: false,
    location: null,
    hashbangPrefix: '#!',
};

const checkSupport = () => {
    //TODO: Make these warnings hidden in production mode
    if (typeof window === 'undefined' || !window.document)
    {
        //If on the server, probably using SSR and should use hashbanged = true plus a basic url
        console.warn(`The history API for hobbit-navigator was executed on the
            server, if this is an expected bahavior (For example, when using SSR),
            set the location manually to display the intended content.`);
        return false;
    }
    else if (!window.history || !window.history.pushState) 
    {
        console.warn(`It seems you are not using a browser with HTML5 history
            support. Hobbit-navigator will cause the page to refresh rather
            than navigate smoothly. Use a polyfil to prevent this issue.`);
        return false;
    }
    return true;
};

export class History {
    constructor(config) {
        this.configuration = Object.assign({}, baseConfig, config);
        this.supported = checkSupport();
        const { hashbanged, hashbangPrefix, location } = this.configuration;
        if (location)
        {
            this.location = typeof(location) === 'object' ? location : {
                path: location,
                url: `${hashbanged ? hashbangPrefix : ''}${location}`,
                pattern: location,
                params: {},
                sender: '',
            };
        }
        else
        {
            this.setLocationFromHref();
        }
        window.addEventListener('popstate', this.setLocationFromHref.bind(this));
    }
    
    setLocationFromHref() {
        const { hashbanged, hashbangPrefix } = this.configuration;
        const parser = document.createElement('a');
        parser.href = window.location.href;
        const baseUrl = hashbanged ? parser.hash.replace(hashbangPrefix, '')
            : parser.pathname;
        this.location = {
            path: baseUrl,
            url: hashbanged ? parser.hash : parser.pathname,
            pattern: baseUrl,
            params: {},
            sender: '',
        };
    }
    
    getLocation() {
        return this.location;
    }
    
    getState() {
        return window.history.state || {};
    }
    
    extractParams(pattern, {loose = false, caseSensitive = true, strict = false} = {}) {
        const { match, keys } = this.executePattern(
            this.location.path,
            pattern,
            { 
                end: !loose,
                sensitive: caseSensitive,
                strict,
            }
        );
        if (match === null)
        {
            return null;
        }
        const params = match.slice(1);
        return keys.reduce((container, key, index) => {
            container[key.name] = params[index];
            return container;
        }, {});
    }
    
    executePattern(path, pathPatterns, options) {
        //Execute the given pattern with the extracted options.
        //Here, end allows to check the pattern only from the begining
        //loose makes the comparaison less strict and may result in unwanted
        //urls returning true.
        const keys = [];
        const executor = pathToRegexp(pathPatterns, keys, options);
        return {
            keys,
            match: executor.exec(path),
        };
    }
    
    navigate(pathPatterns, {params = {}, sender = '', force = false, options = {}} = {}) {
        const replace = options.replace || false;
        //Compile the path pattern with the parameters
        const compiledPath = pathToRegexp.compile(pathPatterns);
        const path = compiledPath(params);
        //Only navigate if path are not equal
        if (!force && path === this.location.path)
        {
            return;
        }
        this.navigatePure(path, params, {
            sender,
            replace,
            pattern: pathPatterns,
        });
    }
    
    navigatePure(path, state, {sender = '', replace = false, pattern} = {}) {
        const { hashbanged, hashbangPrefix } = this.configuration;
        const url = `${hashbanged ? hashbangPrefix : ''}${path}`;
        if (!pattern)
        {
            pattern = path;
        }
        this.location = {
            path: path,
            pattern,
            url,
            sender,
            params: state,
        };
        if (this.supported)
        {
            if (replace)
            {
                window.history.replaceState(state, null, url);
            }
            else 
            {
                window.history.pushState(state, null, url);
            }
        }
        else if (replace)
        {
            console.warn(`The replace option is not available for browsers not
                supporting the HTML5 history API.`);
            return;
        }
        else
        {
            window.location.href = url;
        }
    }
    
    compare(pathPattern, {loose = false, caseSensitive = true, strict = false} = {}) {
        const { match } = this.executePattern(
            this.location.path,
            pathPattern,
            { 
                end: !loose,
                sensitive: caseSensitive,
                strict,
            }
        );
        if (!match)
        {
            return false;
        }
        const [ url ] = match;
        if (!loose)
        {
            const comparator = new RegExp(
                this.location.path, 
                caseSensitive ? '' : 'i'
            );
            return comparator.test(url);
        }
        return true;
    }
}

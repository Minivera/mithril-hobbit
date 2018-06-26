import loki from 'lokijs';

import { Store } from 'mithril-hobbit/archivist';

class connector {
    constructor(initial) {
        //TODO: Create initial state
        this.db = new loki();
        this.data = this.db.addCollection('data');
    }
    
    set(path, value) {
        const existingRecord = this.data.findOne({path});
        if (existingRecord) 
        {
            this.data.update(Object.assign({}, existingRecord, {
                value,
            }));
        }
        else
        {
            this.data.insert({path, value});
        }
    }
    
    remove(path) {
        this.data.findAndRemove({path});
    }
    
    find(path) {
        const found = this.data.findOne({path});
        return found ? found.value : undefined;
    }
    
    clear() {
        this.data.clear();
    }
    
    all() {
        return this.data.find({}).map((record) => record.value);
    }
}

const stateStore = Store.createStore({
    time: startTime(),
});//, connector);

function checkTime(i) {
    if (i < 10)
    {
        i = '0' + i;
    }
    return i;
}

function startTime() {
    const today = new Date();
    let hours = today.getHours();
    let minutes = today.getMinutes();
    let seconds = today.getSeconds();
    minutes = checkTime(minutes);
    seconds = checkTime(seconds);
    setTimeout(() => {
        stateStore.set('time', startTime());
    }, 500);
    return  `${hours}:${minutes}:${seconds}`;
}

export { stateStore };

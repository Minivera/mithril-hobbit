import m from 'mithril';
import { subscribe } from 'mithril-hobbit/archivist';

const clock = {
    time: null,
    oncreate: function(vnode) {
        this.time = vnode.attrs.state;
    },
    onstatechanged: function(newState) {
        if (this.time !== newState)
        {
            this.time = newState;
            m.redraw();
        }
    },
    view(vnode) {
        return m('div.time', `Time: ${vnode.attrs.state}`);
    },
};

const enhanced = subscribe(clock, 'time');

export { enhanced as Clock };

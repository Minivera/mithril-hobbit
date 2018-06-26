import m from 'mithril';
import r from 'mithril-hobbit/navigator';

const Sidebar = r.withLocation('/block/:color/:subcolor', {
    onClickIndex: function() {
        r.navigate('/index');
    },
    onClickBlock: function() {
        r.navigate('/block');
    },
    onClickColor: function(vnode, color) {
        if (vnode.attrs.params.subcolor)
        {
            r.navigate('/block/:color/:subcolor', {
                color, 
                subcolor: vnode.attrs.params.subcolor,
            });
            return;
        }
        r.navigate('/block/:color', {color});
    },
    onClickSubColor: function(vnode, subcolor) {
        const color = vnode.attrs.params.color;
        r.navigate('/block/:color/:subcolor', {color, subcolor});
    },
    view: function(vnode) {
        const colorMenu = m('div.block', [
            m('h3', 'Main color'),
            m('a', {onclick: () => this.onClickColor(vnode, 'red')}, 'Red'),
            m('a', {onclick: () => this.onClickColor(vnode, 'blue')}, 'Blue'),
            m('a', {onclick: () => this.onClickColor(vnode, 'green')}, 'Green'),
        ]);
        
        const subColorMenu = m('div.block', [
            m('h3', 'Sub Color'),
            m('a', {onclick: () => this.onClickSubColor(vnode, 'red')}, 'Red'),
            m('a', {onclick: () => this.onClickSubColor(vnode, 'blue')}, 'Blue'),
            m('a', {onclick: () => this.onClickSubColor(vnode, 'green')}, 'Green'),
        ]);
        
        return m('div.sidebar', [
            m('h2', 'Navigation'),
            m('div.block', [
                m('a', {onclick: this.onClickIndex}, 'Index'),
                m('a', {onclick: this.onClickBlock}, 'Colored Blocks'),
            ]),
            r({
                '/block': m('div.block', [
                    colorMenu,
                ]),
                '/block/:color': m('div', [
                    colorMenu,
                    subColorMenu,
                ]),
                '/block/:color': m('div', [
                    colorMenu,
                    subColorMenu,
                ]),
                '/block/:color/:subcolor': m('div', [
                    colorMenu,
                    subColorMenu,
                ]),
            }),
        ]);
    },
});

export { Sidebar };
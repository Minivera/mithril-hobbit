import m from 'mithril';
import r from 'mitrhil-hobbit-navigator';

const SubColoredBlock = {
    view: function(vnode) {
        return m(`div.${vnode.attrs.params.subcolor}`, [
            m('h2', [
                vnode.attrs.params.subcolor,
            ]),
        ]);
    },
};

const ColoredBlock = {
    onupdate: function(vnode) {
        vnode.dom.classList.add('fadein');
        setTimeout(function(){
            vnode.dom.classList.remove('fadein');
        }, 500);
    },
    view: function(vnode) {
        return m(`div.${vnode.attrs.params.color}`, [
            m('h2', [
                vnode.attrs.params.color,
            ]),
            r('/block/:color/:subcolor', SubColoredBlock),
        ]);
    },
};

export default ColoredBlock;
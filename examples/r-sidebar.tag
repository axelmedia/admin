<r-sidebar>
    <h3 if={opts.title}>{ opts.title }</h3>
    <ul if={ (opts.navs.length > 0) } riot-tag="r-sidebar-menus" data={ opts }></ul>
    console.log('11');
</r-sidebar>
<r-sidebar-menus>
    <li each={ nav in opts.data.navs }>
        <a if={ !nav.navs || nav.navs.length == 0 } class="{ active:nav.active } { nav.class }" href="{ nav.base }{ nav.link }" target="{ nav.blank ? '_blank' : '' }" onclick={ parent.toggle }>
            <i class="fa fa-{ nav.icon || 'file-o' }"></i> { nav.label }
        </a>
        <button if={ nav.navs.length > 0 } class="{ active:nav.active } { nav.class }" onclick={ parent.toggle } onload={ parent.ttt }>
            <i class="fa fa-{ nav.icon || 'file-o' }"></i> { nav.label }
        </button>
        <ul if={ nav.navs.length > 0 } riot-tag="r-sidebar-menus" data={ nav }></ul>
    </li>

    toggle(e) {
        e.item.nav.active = !e.item.nav.active;
        return ('A' == e.target.tagName);
    }
</r-sidebar-menus>

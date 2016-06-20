
$('.ui.sidebar').sidebar('attach events', '.sidebar-toggle');
$('.ui.dropdown').dropdown();
$('.ui.accordion').accordion();
$('.ui.checkbox').checkbox();
$('select.dropdown').dropdown();

var sidebarActiver = (function() {
    var _callCount = 0;
    var _propName = '_linkId';

    var main = function(conf) {
        ++_callCount;
        this.id = _callCount;
        this.root = document;
        this.selector = 'a';
        this.base = '/';
        this.count = 0;
        this.items = {};
        this.clickChanger = false;

        if ('object' == typeof conf) {
            if (conf.selector) {
                this.selector = conf.selector;
            }
            if (conf.root) {
                if ('string' == typeof conf.root) {
                    if ('#' == conf.root[0]) {
                        this.root = document.getElementById(conf.root.substr(1));
                    } else {
                        this.root = document.querySelector(conf.root);
                    }
                } else {
                    this.root = conf.root;
                }
            }
            if (conf.base) {
                this.base = '/' + conf.base.replace(/^\/|\/$/g, '');
            }
        }

        this.current = this.getPath(window.location.pathname);

        this.render();
    };

    main.prototype = {
        render: function() {
            var elements = this.root.querySelectorAll(this.selector);
            if (!elements.length) {
                return;
            }

            var i, l, id, added = [];

            var l = elements.length;
            for(i = 0; i < l; i++) {
                var element = elements[i];
                if (
                    !element.pathname
                    || element.host != window.location.host
                    || element.pathname.indexOf(this.base) !== 0
                    || element[_propName]
                ) {
                    return;
                }

                id = this.id + '-' + (i + 1);
                var path = this.getPath(element.pathname);
                element[_propName] = id;
                added.push(id);
                this.items[id] = {
                    id: id,
                    path: path,
                    parents: [],
                    src: element
                };
                if (this.clickChanger) {
                    element.addEventListener('click', this.click.bind(this));
                }
                ++this.count;
            }

            if (!added.length) {
                return;
            }

            // Get parents
            var titles = this.root.querySelectorAll(':scope .title');
            for (i = 0, l = titles.length; i < l; i++) {
                var title = titles[i];
                var content = titles[i].nextElementSibling;
                if (content && content.getAttribute('class').match(/ ?content ?/)) {
                    var links = content.querySelectorAll(this.selector);
                    if (links.length) {
                        for (var j = 0, jl = links.length; j < jl; j++) {
                            var link = links[j];
                            if (!link[_propName]) {
                                continue;
                            }
                            id = link[_propName];
                            if (added.indexOf(id)) {
                                this.items[id].parents.push(title);
                                this.items[id].parents.push(content);
                            }
                        }
                    }
                }
            }
        },

        getPath: function(path) {
            path = path.replace(new RegExp('^' + this.base), '');
            path = '/' + path.replace(/^\/|\/$/g, '') + '/';
            path = path.replace(/\/\/+/g, '/');
            return path;
        },

        click: function(e) {
            if (e.target.pathname && e.target[_propName] && this.items[e.target[_propName]]) {
                this.setActive(e.target.pathname);
            }
        },

        hasClass: function(e, cls) {
            return ((' ' + e.getAttribute('class') + ' ').indexOf(cls) != -1);
        },

        addClass: function(e, cls) {
            if (this.hasClass(e, cls)) {
                return;
            }
            e.setAttribute('class', e.getAttribute('class') + ' ' + cls);
            return e;
        },

        removeClass: function(e, cls) {
            if (!this.hasClass(e, cls)) {
                return;
            }
            var clss = ' ' + e.getAttribute('class') + ' ';
            clss = clss.replace(' ' + cls + ' ', '');
            clss = clss.replace(/^\s|\s$/g, '');
            e.setAttribute('class', clss);
            return e;
        },

        setActive: function(path) {
            var id, item, i, l;
            var path = this.getPath(path || window.location.pathname);
            var actives = [];
            for (id in this.items) {
                item = this.items[id];
                if (item.path == path) {
                    actives.push(item.src);
                    l = item.parents.length;
                    if (l) {
                        for (i = 0; i < l; i++) {
                            actives.push(item.parents[i]);
                        }
                    }
                } else {
                    this.removeClass(item.src, 'active');
                    l = item.parents.length;
                    if (l) {
                        for (i = 0; i < l; i++) {
                            this.removeClass(item.parents[i], 'active');
                        }
                    }
                }
            }

            if (!actives.length) {
                return;
            }

            for (i = 0, l = actives.length; i < l; i++) {
                this.addClass(actives[i], 'active');
            }
        }
    };

    return main;
})();


var sidebar = new sidebarActiver({
    root: '#sidebar',
    base: '/examples/',
    selector: 'a'
});
sidebar.setActive();

// $.get('pages/index.html', function(res) {
//     var c = riot.compile('<page>' + "\n" + res + "\n" + '</page>');
//     riot.mount('page');
// });
riot.compile('pages/index.html', function(script, html) {
    riot.mount('page');
});

riot.route.base(sidebar.base + '/');
riot.route.parser(function(path) {
    if (!path) {
        path = 'index';
    }
    sidebar.setActive();

    riot.compile('pages/' + path + '.html', function() {
        riot.mount('page');
    });
    return path;
});
riot.route.start();

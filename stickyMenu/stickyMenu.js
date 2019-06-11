(function () {
    var namespace = 'stickyMenu';
    var $window = $(window);
    var scrollTop = 0;
    var sticky = window.sticky || {};

    sticky = function ($self, method) {
        var self = this;
        self.defaults = {
            $on: null,
            $off: null,
            fadeMode: false,
        };
        self.initials = {
            id: null,
            position: {
                on: null,
                off: null
            },
            stickyHeight: $self.outerHeight(),
            $clone: null,
            createClone: true,
            defaultClass: '',
            fixedClass: 'stickyMenu-fixed',
            cloneClass: 'stickyMenu-clone',
            animationClass: 'stickyMenu-animation'
        };

        self.options = $.extend(true, self.defaults, method, self.initials);
        self.$sticky = $self;

        // add class
        self.options.defaultClass = (self.options.fadeMode) ? 'stickyMenu-fadeMode' : 'stickyMenu-default';
        self.$sticky.toggleClass(self.options.defaultClass, true);
        // create id
        if (self.options.id === null) {
            self.options.id = namespace + '-' + $('.stickyMenu').index($self[0]);
        }
        self.initialize();

        return self;
    };

    sticky.prototype.initialize = function () {
        var self = this;
        var $sticky = self.$sticky;
        var options = self.options;

        // defaultは直下にクローンを作る
        if (!options.fadeMode || (options.fadeMode && options.createClone)) {
            options.$clone = $sticky.clone();
            options.$clone.toggleClass(options.cloneClass, true);
            $sticky.after(options.$clone);
        }

        // 初回
        self.positionCheck();
        self.scrollCheck();
        // 初回はアニメーションさせない為ここでtransition追加
        if (self.options.fadeMode) {
            self.$sticky.toggleClass(options.animationClass, true);
        }
        // resize and scroll
        $window
            .on('resize.' + options.id, function () {
                self.positionCheck();
            })
            .on('scroll.' + options.id, function () {
                self.scrollCheck();
            });
    };

    sticky.prototype.positionCheck = function () {
        var self = this;
        var $sticky = self.$sticky;
        var options = self.options;

        if (!options.fadeMode) {
            options.position.on = $sticky.offset().top;
        } else {
            options.position.on = (options.$on === null || options.$on.length !== 1) ? null : options.$on.offset().top;
        }
        options.position.off = (options.$off === null || options.$off.length !== 1) ? null :  options.$off.offset().top + options.$off.outerHeight();
        options.stickyHeight = $sticky.outerHeight();
    };

    sticky.prototype.scrollCheck = function () {
        var self = this;
        var $sticky = self.$sticky;
        var options = self.options;

        scrollTop = $window.scrollTop();
        // default
        if (!options.fadeMode) {
            if (stickyArea(options.position)) {
                $sticky.toggleClass(options.fixedClass, true);
                if (scrollTop > options.position.off - options.stickyHeight && scrollTop < options.position.off) {
                    $sticky.css('top', (scrollTop - (options.position.off - options.stickyHeight)) * -1);
                } else {
                    $sticky.css('top', '');
                }
            } else {
                $sticky.toggleClass(options.fixedClass, false);
            }
        }
        // fadeMode
        else {
            if (stickyArea(options.position)) {
                $sticky
                    .css({
                        '-webkit-transform': '',
                        'transform': ''
                    })
                    .toggleClass(options.fixedClass, true);
            } else {
                $sticky
                    .toggleClass(options.fixedClass, false)
                    .css({
                        '-webkit-transform': 'translateY(' + options.stickyHeight * -1 + 'px)',
                        'transform': 'translateY(' + options.stickyHeight * -1 + 'px)',
                    });
            }
        }
    };

    // destroy
    sticky.prototype.destroy = function () {
        var self = this;
        var $sticky = self.$sticky;
        var options = self.options;
        $sticky.toggleClass(options.fixedClass, false);
        $sticky.toggleClass(options.defaultClass, false);
        if (!options.fadeMode) {
            options.$clone.remove();
        } else {
            $sticky
                .toggleClass(options.animationClass, false)
                .css({
                    '-webkit-transform': '',
                    'transform': ''
                });
        }
        $window.off('.' + options.id);
        $sticky.removeData(namespace);
    };

    // 追従条件を決める
    function stickyArea (position) {
        if (position.on === null && position.off === null) {
            return true;
        } else if (position.on === null && position.off !== null) {
            return scrollTop <= position.off;
        } else if (position.on !== null && position.off === null) {
            return scrollTop >= position.on;
        } else {
            return scrollTop >= position.on && scrollTop <= position.off;
        }
    };

    $.fn[namespace] = function (method) {
        return this.each(function () {
            var $this = $(this);
            $this.data(namespace, new sticky($this, method));
        });
    };
})();
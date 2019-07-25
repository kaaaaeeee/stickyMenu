/**
 * stickyMenu v1.0 - https://github.com/kaaaaeeee/stickyMenu
 * Copyright (c) Copyright (c) 2019 kae kobayashi
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 */
(function () {
  'use strict';
  /***
   * add callback
   * add method
   * add destroy
   * add event
   ***/
  var namespace = 'stickyMenu';
  var $window = $(window);
  var scrollTop = $window.scrollTop();
  var sticky = window.sticky || {};
  // 上下判定 （コールバック入れたい）
  var oldScrollTop = 0;
  var toUpClass = namespace + '-toUp';
  var isToUp = false;

  $window.on('scroll.' + namespace, function () {
    scrollTop = $window.scrollTop();
    if (scrollTop < oldScrollTop) {
      if (!isToUp) {
        console.log('toUp');
        $('body').toggleClass(toUpClass, true);
        isToUp = true;
      }
    } else {
      if (isToUp) {
        console.log('toDown');
        $('body').toggleClass(toUpClass, false);
        isToUp = false;
      }
    }

    if (Math.abs(scrollTop - oldScrollTop) > 10) {
      oldScrollTop = scrollTop;
    }
  });

  sticky = function ($self, method) {
    var self = this;
    self.defaults = {
      $on: null,
      $off: null,
      fadeMode: false,
      direction: 'top',
      createClone: false,
      fadeInAnimation: false,
      callback: {
        initializeAfter: null,
        showAfter: null,
        hideAfter: null,
        prepareAfter: null
      }
    };
    self.initials = {
      id: null,
      position: {
        on: null,
        off: null,
        prepare: null
      },
      stickyHeight: $self.outerHeight(),
      $clone: null,
      defaultClass: '',
      fixedClass: 'stickyMenu-fixed',
      cloneClass: 'stickyMenu-clone',
      prepareClass: 'stickyMenu-prepare',
      directuinClass: 'stickyMenu-bottom',
      animationClass: 'stickyMenu-animation',
      fadeInAnimationClass: 'stickyMenu-fadeIn',
      isPrepare: false,
      isShow: false
    };

    self.options = $.extend(true, self.defaults, method, self.initials);
    self.$sticky = $self;

    // add class
    self.options.defaultClass = (self.options.fadeMode) ? 'stickyMenu-fadeMode' : 'stickyMenu-default';
    self.$sticky.toggleClass(self.options.defaultClass, true);
    if (self.options.direction === 'bottom') {
      self.$sticky.toggleClass(self.options.directuinClass, true);
    }
    if (self.options.fadeInAnimation) {
      self.$sticky.toggleClass(self.options.fadeInAnimationClass, true);
    }
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

    // defaultは直下にクローンを作る(fadeは必要な場合のみ)
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

    self.activeCallback('initializeAfter');
    $sticky.trigger('stickyMenuInit',[self]);
  };

  sticky.prototype.positionCheck = function () {
    var self = this;
    var $sticky = self.$sticky;
    var options = self.options;

    // prepare
    if (!options.fadeMode && options.$on !== null) {
      options.position.prepare = $sticky.offset().top + $sticky.outerHeight();
    }

    // on
    if (options.$on !== null && options.$on.length === 1) {
      options.position.on = options.$on.offset().top;
    } else {
      // def
      if (!options.fadeMode) {
        if (options.direction === 'top') {
          options.position.on = $sticky.offset().top;
        } else {
          options.position.on = $sticky.offset().top + $sticky.outerHeight() - window.innerHeight;
        }
      }
    }

    // off
    if (options.$off !== null && options.$off.length === 1) {
      options.position.off = options.$off.offset().top + options.$off.outerHeight();
    }
    // height
    options.stickyHeight = $sticky.outerHeight();
  };

  sticky.prototype.scrollCheck = function () {
    var self = this;
    var options = self.options;

    if (options.position.prepare !== null) {
      self.prepareCheck();
    }
    if (stickyArea(options.position)) {
      if (!options.isShow) {
        console.log('isShow');
        self.showMenu();
      }
    } else {
      if (options.isShow) {
        console.log('isHide');
        self.hideMenu();
      }
    }
  };

  sticky.prototype.prepareCheck = function () {
    var self = this;
    var $sticky = self.$sticky;
    var options = self.options;
    var delay = null;
    if (scrollTop >= options.position.prepare) {
      if (options.isPrepare) {
        return;
      }
      console.log('isPrepare');
      $sticky.toggleClass(options.prepareClass, true);
      delay = setInterval(function () {
        console.log('delay');
        if ($sticky.hasClass(options.prepareClass)) {
          clearInterval(delay);
          $sticky.toggleClass(options.animationClass, true);
        }
      }, 10);
      options.isPrepare = true;
      self.activeCallback('prepareAfter');
      $sticky.trigger('stickyMenuPrepare',[self]);
    } else {
      if (!options.isPrepare) {
        return;
      }
      console.log('isntPrepare');
      $sticky
        .toggleClass(options.animationClass, false)
        .toggleClass(options.prepareClass, false);

      options.isPrepare = false;
    }
  };

  sticky.prototype.showMenu = function () {
    var self = this;
    var $sticky = self.$sticky;
    var options = self.options;
    $sticky
      .css({
        '-webkit-transform': '',
        'transform': ''
      })
      .toggleClass(options.fixedClass, true);
    options.isShow = true;
    self.activeCallback('showAfter');
    $sticky.trigger('stickyMenuShow',[self]);
  };

  sticky.prototype.hideMenu = function () {
    var self = this;
    var $sticky = self.$sticky;
    var options = self.options;
    // default
    if (!options.fadeMode) {
      $sticky.toggleClass(options.fixedClass, false);
    }
    // fadeMode
    else {
      var translateNum = (options.direction === 'top') ? options.stickyHeight * -1 : options.stickyHeight;
      $sticky
        .toggleClass(options.fixedClass, false)
        .css({
          '-webkit-transform': 'translateY(' + translateNum + 'px)',
          'transform': 'translateY(' + translateNum + 'px)',
        });
    }
    options.isShow = false;
    self.activeCallback('hideAfter');
    $sticky.trigger('stickyMenuHide',[self]);
  };

  sticky.prototype.activeCallback = function (callbackName) {
    var self = this;
    var options = self.options;
    if (typeof options.callback[callbackName] === 'function') {
      options.callback[callbackName]();
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
  function stickyArea(position) {
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

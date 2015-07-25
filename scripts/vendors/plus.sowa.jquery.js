/**
 * Created by tchapda gabi on 20/06/2015.
 */

(function($) {
    $.fn.extend({
        /*tabs-view handler*/
        tabs_view: function () {
            var menu = this.find('.menu-item:first');
            var items = this.find('.items');
            var that = this;
            menu.bind('click', function (evt) {
                var $elt = $(evt.target);
                if (!$elt.hasClass('item')) return;
                var href = $elt.attr('href');
                if (!href) return;
                evt.preventDefault();
                href = href.split('#')[1];
                $elt.addClass('active').siblings().removeClass('active');
                items.find('>[what="' + href + '"]')
                    .addClass('active').siblings().removeClass('active');
            });
        },
        /*accordion-view handler*/
        accordion_view: function (open, close) {
            if (!open) open = 'fa fa-open';
            if (!close) close = 'fa fa-close';
            var title = this.find('>a.title');
            var details = this.find('>div.details');

            title.bind('click', function (evt) {
                details.toggleClass('show');
                title.find('>i').toggleClass(open).toggleClass(close);
            });
        },

        /*visible-in-the-view-port*/
        is_visible: function () {
            var viewportWidth = $(window).width(),
                viewportHeight = $(window).height(),
                documentScrollTop = $(document).scrollTop(),
                documentScrollLeft = $(document).scrollLeft(),
                elementOffset = this.offset(),
                elementHeight = this.height(),
                elementWidth = this.width(),
                minTop = documentScrollTop,
                maxTop = documentScrollTop + viewportHeight,
                minLeft = documentScrollLeft,
                maxLeft = documentScrollLeft + viewportWidth;
            var parent = this.parents('.scroll')
            if (parent) elementOffset.top += parent.offset().top;


            if (
                (elementOffset.top > minTop &&
                elementOffset.top + elementHeight < maxTop) &&
                (elementOffset.left > minLeft &&
                elementOffset.left + elementWidth < maxLeft)
            ) {
                console.log('entire element is visible');
                return true;
            }
            else {
                console.log('entire element is not visible');
                return false;
            }
        },

        scrollTo: function () {
            if (this.is_visible()) return;
            var parent = this.parents('.scroll');
            if (!parent) return;
            var scrollPos = this.position().top + parent.scrollTop();
            parent.scrollTop(scrollPos);
        }

    });
})(jQuery);

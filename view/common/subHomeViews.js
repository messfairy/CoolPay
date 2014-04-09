define(function (require, exports) {
    var Backbone = require('backbone'),
        Handlebars = require('handlebars');
        require('selector')(Backbone.$);
    var LeftMenuView = Backbone.View.extend({
        el: '#J_Container',
        template: Handlebars.compile($('#J_LeftMenuTpl').html()),
        initialize: function () {
            //this.render();
        },
        render: function () {
            this.$el.empty().append(this.template());
            var pageLeft = $("#J-screenLeft"),
                content = $("#content"),
                page = this.$('#J-screenLeft');
            page.removeAttr('style').css({
                '-webkit-transition': 'left .1s ease-in',
                '-webkit-transform': 'translate3d(0, 0, 0)',
                '-webkit-backface-visibility': 'hidden',
                '-webkit-perspective': '1000'
            });
            if(pageLeft.is(":hidden")){
                pageLeft.show();
                page.css("left", '80%');
            }else{
                page.css("left", '0');
                pageLeft.hide();
            }
        }
    });
    exports.leftMenuView = new LeftMenuView;

    var MessageView = Backbone.View.extend({
        el: '#J_Container',
        template: Handlebars.compile($('#J_CloudMsgTpl').html()),
        initialize: function () {
            //this.render();
        },
        render: function () {
            this.$el.empty().append(this.template());
            var pageRight = $("#J-screenRight"),
                page = $("#J-screenPage");
            page.removeAttr('style').css({
                '-webkit-transition': 'right .1s ease-in',
                '-webkit-transform': 'translate3d(0, 0, 0)',
                '-webkit-backface-visibility': 'hidden',
                '-webkit-perspective': '1000'
            });
            if(pageRight.is(":hidden")){
                pageRight.show();
                page.css({"right": '80%', 'left': 'auto'});
            }else{
                page.css({"right": '0', 'left': 'auto'});
                pageRight.hide();
            }

        }
    });
    exports.messageView = new MessageView;

});
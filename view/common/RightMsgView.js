define(function (require) {
    var Backbone = require('backbone'),
        Handlebars = require('handlebars');
    var RightMsgView = Backbone.View.extend({
        el: '#warp',
        events: {
            'tap .J_MessageCenter': 'goMessage', //去往消息中心
            'tap #J_MsgBackHome': 'backHome'
        },
        initialize: function (options) {
            this.appRouter = options.appRouter;
            var RightTpl = require('text!../../template/RightMsgs.hbs');
            this.template = Handlebars.compile(RightTpl);
        },
        render: function () {
            //保存现场
            this.setElement('#warp', true);
            this.$el.empty().html(this.template());
            this.$('#J-screenRight').show();
            $('body').addClass('bg-233143');
            return this;
        },
        goMessage: function () {
            this.leave();
            window.location.href = '/fcs/mobile/html/newsCenter.html';
        },
        backHome: function(){
            this.appRouter.appNavigate('home', true);
        },
        leave: function () {
            var containerView = require('../shareViews').containerView;
            containerView.restore();//恢复原状
        }
    });
    return RightMsgView;
});
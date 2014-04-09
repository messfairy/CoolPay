define(function (require) {
    var Backbone = require('backbone'),
        Handlebars = require('handlebars');
    var UserInfoView = Backbone.View.extend({
        el: '#J_Container',
        events: {
            'tap #J_SendEpayNum':'ifBound',
            'tap #J_NoBound':'noBound',
            'tap #J_ChangePwd':'updatePwd',
            'tap #J_ChangeMobile':'changeMobile'
        },
        initialize: function (options) {
            this.appRouter = options.appRouter;
            var $ = Backbone.$;
            this._ = require('underscore');
            var UserInfo = require('../../model/UserInfo');
            this.model = UserInfo.userInfo;
            this.UserInfoTemplate = Handlebars.compile($('#J_UserInfoSetTpl').html());
            this.listenTo(this.model, 'sync', this._.bind(this.renderInfo, this));
        },
        renderInfo: function(){
            var data = this.model.attributes;
            var html = this.UserInfoTemplate(data);
            this.$el.empty().append(html);
            $('#J-tipMash').hide();
        },
        render: function () {
            this.setElement('#J_Container', true);
            $('body').addClass('bg-233143');
            this.model.clear().fetch();
        },
        ifBound:function(){
            var that=this;
            if($('#J_SendEpayNum').text()=='绑定'){
                $('#J-tipMash').show();
                $('#J_Bound').bind('tap',function(){
                    that.sendEpayNum();
                })
            }else{
                this.sendEpayNum();
            }
        },
        noBound:function(){
            $('#J-tipMash').hide();
        },
        sendEpayNum:function(){
            this.leave();
            this.appRouter.userNavigate('user/info/send', true);
        },
        updatePwd: function(){
            this.leave();
            this.appRouter.userNavigate('user/pwd/update', true);
        },
        changeMobile:function(){
            this.leave();
            this.appRouter.userNavigate('user/mobile/update', true);
        },
        //导航其他页面清理现场
        leave: function () {
            var containerView = require('../shareViews').containerView;
            containerView.restore();//恢复原状
        }
    });
    return UserInfoView;
});
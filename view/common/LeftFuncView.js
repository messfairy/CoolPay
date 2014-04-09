define(function (require) {
    var Backbone = require('backbone'),
        Handlebars = require('handlebars');
    var LeftFuncView = Backbone.View.extend({
        el: '#warp',
        events: {
            'tap #J_IndexShow': 'indexShow',//显示首页内容
            'tap #J_MyDocs': 'showDocList',//查询已经提交的报销单列表
            'tap #J-showLeft': 'showLeft',
            'tap #J-showRight': 'showRight',
            'tap #J_GoAir': 'showAir',
            'tap #J_GoHotel': 'showHotel',
            'tap #J_MyOrders': 'showOrderList',
            'tap #J_AddReimburse': 'addReimburse',
            'tap #J_Relations': 'reimburseDoc',//todo 报销单明细
            'tap #J_UserSetting': 'goUserInfo',//显示用户信息
            'tap #J_LoginOut': 'loginOut',
            //跳转多页面
            'tap #J_Credit': 'credit'
        },
        initialize: function (options) {
            this.appRouter = options.appRouter;
            var LeftTpl = require('text!../../template/LeftFuncs.hbs');
            this.template = Handlebars.compile(LeftTpl);
        },
        render: function () {
            //保存现场
            this.setElement('#warp', true);
            //页面渲染
            this.$el.empty().html(this.template());
            $('body').addClass('bg-233143');
            this.$('#J-screenLeft').show();
            return this;
        },
        //显示用户信息
        goUserInfo: function () {
            this.leave();
            this.appRouter.userNavigate('user/info', true);
        },
        //渲染万里通机票页面
        showAir: function () {
            this.leave();
            this.appRouter.appNavigate('dmzstg/air', true);
        },
        //渲染万里通酒店页面
        showHotel: function () {
            this.leave();
            this.appRouter.appNavigate('dmzstg/hotel', true);
        },
        //订单查询
        showOrderList: function () {
            this.leave();
            this.appRouter.orderNavigate('order/list', true);
        },
        //新增报销
        addReimburse: function () {
            this.leave();
            this.appRouter.reimNavigate('reim/add/orders', true);
        },
        //显示报销单页面
        reimburseDoc: function () {
            this.leave();
            this.appRouter.orderNavigate('/order/list/details/split/hotel/12323', true);
        },
        //登出
        loginOut: function () {
            this.leave();
            this.appRouter.userNavigate('user/loginout', true);
        },
        //查询已提交报销单
        showDocList: function () {
            this.leave();
            this.appRouter.reimNavigate('reim/query', true);
        },
        //显示云消息
        goMessage: function () {
            this.leave();
            window.location.href = '/fcs/mobile/html/newsCenter.html';
        },
        //显示信用体系
        credit: function () {
            this.leave();
            window.location.href = '/fcs/mobile/credit/credit.html';
        },
        //显示首页
        indexShow: function(){
            this.appRouter.appNavigate('home', true);
        },
        leave: function () {
            var containerView = require('../shareViews').containerView;
            containerView.restore();//恢复原状
        }
    });
    return LeftFuncView;
});
define(function (require) {
    var Backbone = require('backbone'),
        Handlebars = require('handlebars');
    var DocStateModel = Backbone.Model.extend({
        url: '/fcs/do/trip/json/ExpenseAccountInfo/getFirstExpenseStatusInfo',
        parse: function (response) {
            if (response.flag) {
                return response.result;
            } else {
                return response.message;
            }
        }
    });
    var CenterView = Backbone.View.extend({
        el: '#warp',
        events: {
            'tap #J-showLeft': 'showLeft',//显示左侧功能列表
            'tap #J-showRight': 'showRight', //显示右侧消息列表
            'tap #J_AirTicket': 'showAir',//万里通订机票
            'tap #J_BookHotel': 'showHotel',//万里通订酒店
            'tap #J_NewAirOrder': 'airDetails',//最新机票详情
            'tap #J_NewHotelOrder': 'hotelDetails',//最新酒店详情

            'tap #J_ForSubmit': 'forSubmit',//报销未提交
            'tap #J_ComeBack': 'comeBack',//报销被退回
            'tap #J_WaitDone': 'waitDone',//报销待交单

            'tap #J_AddReimburse': 'addReimburse',
            'swipeDown #content': 'fetchNew',
            //跳转信用体系
            'tap #J_Credit': 'credit'
        },
        forSubmit: function(){
            this.leave();
            this.appRouter.reimNavigate('reim/query/-1', true);
        },
        comeBack: function(){
            this.leave();
            this.appRouter.reimNavigate('reim/query/0', true);
        },
        waitDone: function(){
            this.leave();
            this.appRouter.reimNavigate('reim/query/1', true);
        },
        initialize: function (options) {
            this.appRouter = options.appRouter;
            var CenterTpl = require('text!../../template/Center.hbs');
            this.template = Handlebars.compile(CenterTpl);
            this.ViewHelper = require('../common/ViewHelper');
            this.SingleTemplate = Handlebars.compile($('#J_AirSingleTemplate').html());
            this.HotelTemplate = Handlebars.compile($('#J_HotelTemplate').html());

            this.orderModel = require('../../model/shareModels').indexOrderModel;
            this.orderModel.on('sync', this.fetchNewOrder, this);
            this.orderModel.on('error', this.fetchNewOrderError, this);
            this.docStateModel = new DocStateModel;
            this.docStateModel.on('sync', this.fetchDocState, this);
            this.docStateModel.on('error', this.fetchDocStateError, this);
        },
        render: function () {
            //保存现场
            this.setElement('#warp', true);
            this.$el.empty().html(this.template());
            this.myScroll();
            $('body').addClass('bg-233143');
            this.orderModel.clear().fetch();
            this.docStateModel.clear().fetch();
            return this;
        },
        fetchNew: function () {
            this.orderModel.clear().fetch();
            this.docStateModel.clear().fetch();
        },
        //成功获取新的订单记录
        fetchNewOrder: function (model) {
            var airInfo = model.airInfo();
            var hotelInfo = model.hotelInfo();
            var airHtml = !!airInfo ? this.SingleTemplate(airInfo) : '';
            var hotelHtml = !!hotelInfo ? this.HotelTemplate(hotelInfo) : '';
            this.$('#J_NewAirOrder').empty().append(airHtml);
            this.$('#J_NewHotelOrder').empty().append(hotelHtml);
        },
        fetchNewOrderError: function () {
            this.ViewHelper.showTips(false, '获取最新订单失败！');
        },
        //成功获取报销单状态
        fetchDocState: function (model) {
            this.$('#J_Incomplete').text(model.get('INCOMPLETE'));
            this.$('#J_Reject').text(model.get('REJECTED'));
            this.$('#J_Success').text(model.get('SUCCESS'));
        },
        fetchDocStateError: function () {
            this.ViewHelper.showTips(false, '获取报销单状态失败！');
        },
        myScroll: function () {
            var screenHeight = document.documentElement.clientHeight;
            $('#content').height(screenHeight - 88 - 230 - 140);
            var IScroll = require('iScroll').iScroll;
            return new IScroll('content');
        },
        //查看左侧功能列表
        showLeft: function () {
            this.appRouter.appNavigate('funcs/left', true);
        },
        //查看右侧云消息
        showRight: function () {
            this.appRouter.appNavigate('msg/cloud', true);
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
        airDetails: function () {
            this.leave();
            this.appRouter.orderNavigate('order/list/details/index/air', true);
        },
        hotelDetails: function () {
            this.leave();
            this.appRouter.orderNavigate('order/list/details/index/hotel', true);
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
        //导航其他页面清理现场
        leave: function () {
            var containerView = require('../shareViews').containerView;
            containerView.restore();//恢复原状
        }
    });
    return CenterView;
});
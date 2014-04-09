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
    var IndexView = Backbone.View.extend({
        el: '#warp',
        events: {
            'tap #J-showLeft': 'showLeft',
            'tap #J-showRight': 'showRight',
            'tap #J_GoAir': 'showAir',
            'tap #J_GoHotel': 'showHotel',
            'tap #J_AirTicket': 'showAir',//订机票
            'tap #J_BookHotel': 'showHotel',//订酒店
            'tap #J_MyOrders': 'showOrderList',
            'tap #J_NewAirOrder': 'airDetails',//最新机票详情
            'tap #J_NewHotelOrder': 'hotelDetails',//最新酒店详情

            'tap #J_ForSubmit': 'forSubmit',//报销未提交
            'tap #J_ComeBack': 'comeBack',//报销被退回
            'tap #J_WaitDone': 'waitDone',//报销待交单

            'tap #J_AddReimburse': 'addReimburse',
            'tap #J_MyDocs': 'showDocList',//查询已经提交的报销单列表
            'tap #J_Relations': 'reimburseDoc',//todo 报销单明细
            'tap #J_UserSetting': 'goUserInfo',//显示用户信息
            'tap .J_MessageCenter': 'goMessage', //去往消息中心
            'tap #J_LoginOut': 'loginOut',
            'swipeDown #content': 'fetchNew',
            //跳转多页面
            'tap #J_Credit': 'credit'
        },
        initialize: function (options) {
            this.appRouter = options.appRouter;
            var IndexTpl = require('text!../../template/Index.hbs');
            this.template = Handlebars.compile(IndexTpl);
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
//            var appRouter = this.appRouter;
//            this.listenToOnce(appRouter.userRouter, 'route:showLogin', this.leave);
//            this.listenToOnce(appRouter.userRouter, 'route:showRegister', this.leave);
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
        fetchDocStateError: function (model, xhr) {
            this.ViewHelper.showTips(false, '获取报销单状态失败！');
        },
        showLeft: function () {
            var pageLeft = $("#J-screenLeft"),
                page = $("#J-screenPage");
            page.removeClass('ease-right-class').addClass('ease-left-class');
            if (pageLeft.is(":hidden")) {
                page.css("left", '80%');
                pageLeft.show();
            } else {
                page.css("left", '0');
                pageLeft.hide();
            }
        },
        showRight: function () {
            var pageRight = $("#J-screenRight"),
                page = $("#J-screenPage");
            page.removeClass('ease-left-class').addClass('ease-right-class');
            if (pageRight.is(':hidden')) {
                pageRight.show();
                page.css({"right": '80%', 'left': 'auto'});
            } else {
                page.css({"right": '0', 'left': 'auto'});
                pageRight.hide();
            }
        },
        myScroll: function () {
            var screenHeight = document.documentElement.clientHeight;
            $('#content').height(screenHeight - 88 - 230 - 140);
            var IScroll = require('iScroll').iScroll;
            return new IScroll('content');
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
        goMessage: function () {
            this.leave();
            window.location.href = '/fcs/mobile/html/newsCenter.html';
        },
        credit: function () {
            this.leave();
            window.location.href = '/fcs/mobile/credit/credit.html';
        },
        leave: function () {
            var containerView = require('../shareViews').containerView;
            containerView.restore();//恢复原状
        }
    });
    return IndexView;
});
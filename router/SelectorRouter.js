/**
 * 报销前端信息选择路由器(展)
 * 报销流程比较复杂，视图跳转较多，故再定义一个选择页面路由
 */
define(function (require) {
    var Backbone = require('backbone');
    var SelectRouter = Backbone.Router.extend({
        ajaxUrls: {
//===========================todo mock 本地mock数据========================
            //ORDERS_REIM_URL: '/fcs/mobile/service/reim_orders.json'
//===========================todo mock 本地mock数据========================
//===========================远程数据========================
//            ORDERS_REIM_URL: '/fcs/do/trip/json/OrderInfoQurey/orderInfoComplate'
//===========================远程数据========================
//===========================开发远程数据========================
            ORDERS_REIM_URL: '/fcs/do/trip/json/OrderInfoQurey/orderInfoComplate',
            NO_ORDER_HEAD_INFO_URL: '/fcs/do/trip/json/ExpenseAccountInfo/expenseAccount'
//===========================开发远程数据========================
        },
        routes: {
            //新增报销前,选择报销业务依据
            'reim/add/head/:tripId': 'showReimHead',//选择入账内容（报销单据头部）
            'reim/add/select/payee': 'selectPayee',//选择收款人
            'reim/add/select/traveller': 'selectTraveller',//选择出差人
            'reim/add/select/bookset': 'selectBookset',//选择账套公司
            'reim/add/select/dep': 'selectDep',//选择入账部门
            'reim/add/select/workflow': 'selectWorkflow',//选择审批链
//            'reim/add/select/hotel':'selectHotel',//跳转添加酒店
//            'reim/add/select/other': 'selectVehicle',//选择其他交通工具
            'reim/add/success': 'showSuccess'//成功
        },
        initialize: function (options) {
            this.appRouter = options.appRouter; //获取主路由器引用
            var shareViews = require('../view/shareViews');
            this.headerView = shareViews.headerView;
            //加载模板
            var SelectItemTpl = require('text!../template/Selector.hbs'),
                $ = Backbone.$;
            $('body').append(SelectItemTpl);
        },
        //新增报销头信息,选择报销业务
        showReimHead: function (tripId) {
            //选择入账内容（报销单据头部）
            this.headerView.showReimDocHead();
            //url: '/fcs/mobile/service/noorder_head_info.json',
            //无订单报销
            if (!this.docHeadView) {
                var DocHeadView = require('../view/reimburse/DocHeadView');
                this.docHeadView = new DocHeadView({
                    headerView: this.headerView,
                    appRouter: this.appRouter,
                    url: this.ajaxUrls.NO_ORDER_HEAD_INFO_URL
                });
            }
            //创建报销单
            this.docHeadView.render();
        },
        //选择出差人
        selectTraveller: function () {
            this.headerView.showTravellerHeader();
            var TravellerView = require('../view/reimburse/selector/TravellerView');
            new TravellerView({appRouter: this.appRouter});
        },
        //选择收款人
        selectPayee: function () {
            this.headerView.showPayeeHeader();
            var PayeeView = require('../view/reimburse/selector/PayeeView');
            new PayeeView({appRouter: this.appRouter});
        },
        //选择账套公司
        selectBookset: function () {
            this.headerView.showBooksetHeader();
            var BooksetView = require('../view/reimburse/selector/BooksetView');
            new BooksetView({appRouter: this.appRouter});
        },
        //选择入账部门
        selectDep: function () {
            this.headerView.showDepHeader();
            var DepView = require('../view/reimburse/selector/DepView');
            new DepView({appRouter: this.appRouter});
        }
    });
    return SelectRouter;
});
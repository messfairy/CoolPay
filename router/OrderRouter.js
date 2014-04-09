/**
 * 订单处理路由器
 */
define(function (require) {
    var Backbone = require('backbone'),
        _ = require('underscore');
    var OrderRouter = Backbone.Router.extend({
        ajaxUrls: {
//===========================todo mock 本地mock数据========================
//            ORDERS_SHOW_URL: '/fcs/mobile/service/show_orders.json',
//            ORDERS_SHOW_URL: '/fcs/mobile/service/order_list.json',
//            ORDERS_SEARCH_URL: '/mobile/service/search_orders.json',
//            ORDERS_A_SEARCH_URL: '/mobile/service/search_a_orders.json',
//            ORDERS_H_SEARCH_URL: '/mobile/service/search_h_orders.json',
//            ORDERS_REIM_URL: '/mobile/service/reim_orders.json'
//===========================todo mock 本地mock数据========================
//===========================开发远程数据========================
//            ORDERS_SHOW_URL: '/fcs/do/trip/json/OrderInfoQurey/oderInfo',
//            ORDERS_SEARCH_URL: '/fcs/do/trip/json/OrderInfoQurey/oderInfoSelect',
//            ORDERS_A_SEARCH_URL: '/fcs/do/trip/json/OrderInfoQurey/oderInfoSelect?type=1',
//            ORDERS_H_SEARCH_URL: '/fcs/do/trip/json/OrderInfoQurey/oderInfoSelect?type=2',
//            ORDERS_REIM_URL: '/fcs/do/trip/json/OrderInfoQurey/orderInfoComplate'
//===========================开发远程数据========================
//===========================测试远程数据========================
            ORDERS_SHOW_URL: '/fcs/do/trip/json/OrderInfoQurey/oderInfo',
            ORDERS_SEARCH_URL: '/fcs/do/trip/json/OrderInfoQurey/oderInfoSelect',
            ORDERS_A_SEARCH_URL: '/fcs/do/trip/json/OrderInfoQurey/oderInfoSelect?type=1',
            ORDERS_H_SEARCH_URL: '/fcs/do/trip/json/OrderInfoQurey/oderInfoSelect?type=2'
            //ORDERS_REIM_URL: '/fcs/do/trip/json/OrderInfoQurey/orderInfoComplate'
//===========================测试远程数据========================
        },
        routes: {
            'order/list': 'showOrders',    //显示订单列表
            'order/list/search': 'showSearch',  // 显示订单查询
            'order/list/search/submit': 'searchSubmit',
            'order/list/search/:type/:CCName/:sdate/:edate': 'searchOrders',  // 查询订单列表
            'order/list/details/air/:id': 'airDetails',//机票订单详情
            'order/list/details/air/open/:parentId/:childId': 'openAirDetails',//机票叠加订单详情
            'order/list/details/hotel/:id': 'hotelDetails',//酒店订单详情
            'order/list/details/index/air': 'airIndex',//首页机票订单详情
            'order/list/details/index/hotel': 'hotelIndex',//首页酒店订单详情
            'order/list/details/split/air/:detailId': 'airDetailSplit',//拆单后酒店订单详情
            'order/list/details/split/hotel/:detailId': 'hotelDetailSplit',//拆单后酒店订单详情

            //订单拆分
            'order/split/index': 'splitIndex',//订单拆分
            'order/split/um-query': 'umQuery',//拆分：um号查询
            'order/split/result': 'splitResult'//拆分结果
        },
        initialize: function (options) {
            this.appRouter = options.appRouter; //获取主路由器引用
            var shareViews = require('../view/shareViews');
            this.headerView = shareViews.headerView;
            //加载模板
            var OrderTpl = require('text!../template/Order.hbs'),
                $ = Backbone.$;
            $('body').append(OrderTpl);

            this.initAirDetailsView();
            this.initHotelDetailsView();
        },
        //创建订单列表视图
        _createOrdersView: function () {
            this.shareOrders = require('../model/shareModels').orderList;
            var OrdersView = require('../view/order/OrdersView');
            return new OrdersView({appRouter: this.appRouter,
                models: this.shareOrders
            });
        },
        //显示订单视图
        showOrders: function () {
            this.headerView.showOrders();
            if (!this.ordersView) {
                this.ordersView = this._createOrdersView();
            }
            this.ordersView.render();
        },
        //显示订单搜索
        showSearch: function () {
            this.headerView.showSearch();
            var SearchView = require('../view/order/SearchView');
            if (!this.searchView) {
                this.searchView = new SearchView({appRouter: this.appRouter});
            }
            this.searchView.render();
        },
        searchSubmit: function(){
            this.headerView.showOrders();
            if (!this.ordersView) {
                this.ordersView = this._createOrdersView();
            }
            this.ordersView.searchRender();
        },
        //显示被筛选订单视图
        searchOrders: function (type, CCName, sdate, edate) {
            var params = {}, noData = 'no-data';
            if (noData !== type) {
                params.type = type;
            }
            if (noData !== CCName) {
                params.CCName = CCName;
            }
            if (noData !== sdate) {
                params.sdate = sdate;
            }
            if (noData !== edate) {
                params.edate = edate;
            }
            this.headerView.showOrders();
            var ordersView = this._createOrdersView();
            ordersView.search(params);
        },
        initAirDetailsView: function(){
            if (!this.airDetailsView) {
                var DetailsView = require('../view/order/DetailsView');
                var AirDetailsView = DetailsView.AirDetailsView;
                this.airDetailsView = new AirDetailsView({appRouter: this.appRouter});
            }
        },
        initHotelDetailsView: function(){
            if (!this.hotelDetailsView) {
                var DetailsView = require('../view/order/DetailsView');
                var HotelDetailsView = DetailsView.HotelDetailsView;
                this.hotelDetailsView = new HotelDetailsView({appRouter: this.appRouter});
            }
        },
        //多机票展开订单详情
        openAirDetails: function (parentId, childId) {
            var order = this.shareOrders.get(parentId);
            this.headerView.showDetails();
            if (childId !== parentId) {
                var orderInfo = _.find(order.attributes.psgInfos, function (value) {
                    return value.orderId === childId;
                });
                order = order.clear().set(orderInfo);
            }
            this.airDetailsView.render(order.toJSON());
        },
        //机票订单详情
        airDetails: function (id) {
            var order = this.shareOrders.get(id);
            this.headerView.showDetails();
            this.airDetailsView.render(order.toJSON());
        },
        //酒店订单详情
        hotelDetails: function (id) {
            var order = this.shareOrders.get(id);
            this.headerView.showDetails();
            this.hotelDetailsView.render(order.toJSON());
        },
        //主页机票订单详情
        airIndex: function () {
            this.headerView.showDetails();
            var indexOrder = require('../model/shareModels').indexOrderModel;
            this.airDetailsView.render(indexOrder.airInfo());
        },
        airDetailSplit: function(detailId){
            this.headerView.showDetails();
            this.airDetailsView.splitBack(detailId);
        },
        hotelDetailSplit: function(detailId){
            this.headerView.showDetails();
            this.hotelDetailsView.splitBack(detailId);
        },
        //主页酒店订单详情
        hotelIndex: function () {
            var indexOrder = require('../model/shareModels').indexOrderModel;
            this.headerView.showDetails();
            this.hotelDetailsView.render(indexOrder.hotelInfo());
        },
        //订单拆分
        splitIndex: function () {

        },
        //拆分：um号查询
        umQuery: function () {

        },
        //拆分结果
        splitResult: function () {

        }
    });
    return OrderRouter;
});
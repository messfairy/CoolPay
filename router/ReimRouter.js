
/**
 * 报销处理路由器
 * 报销流程比较复杂，视图跳转较多，故定义一个新的路由
 */
define(function (require) {
    var Backbone = require('backbone');
    var ReimRouter = Backbone.Router.extend({
        ajaxUrls: {
//===========================todo mock 本地mock数据========================
            //ORDERS_REIM_URL: '/fcs/mobile/service/reim_orders.json'
//===========================todo mock 本地mock数据========================
//===========================远程数据========================
//            ORDERS_REIM_URL: '/fcs/do/trip/json/OrderInfoQurey/orderInfoComplate'
//===========================远程数据========================
//===========================开发远程数据========================
            REIM_ORDERS_URL: '/fcs/do/trip/json/OrderInfoQurey/orderInfoComplate',
            NO_ORDER_HEAD_INFO_URL: '/fcs/do/trip/json/ExpenseAccountInfo/expenseAccount'
//===========================开发远程数据========================
        },
        routes: {
            //查询报销
            'reim/list': 'list',//我的报销
            'reim/filter': 'filter',//筛选条件
            'reim/list/filtered': 'filteredList',//筛选报销
            'reim/detail': 'details',//报销详情

            //查询提交的报销
            'reim/query': 'queryReim',
            'reim/query/:state': 'queryReimState',
            'reim/querydata': 'queryDate',
            'reim/query/add': 'queryHeader',
            'reim/query/shaixuan': 'queryState',

            //新增报销
            'reim/add/orders': 'myOrders',//选择可报销订单
            'reim/add/orders/other/:tripId': 'otherOrders',
            'reim/add/document/:tripId': 'showDocument',//报销单据

            //新增报销前,选择报销业务依据

            'reim/add/select/payee': 'selectPayee',//选择收款人
            'reim/add/select/bookset': 'selectBookset',//选择账套公司
            'reim/add/select/other': 'selectVehicle',//选择其他交通工具
            'reim/add/select/traveller': 'selectTraveller',//选择出差人
            'reim/add/select/other/start/:city': 'selectCityBack',//跳转回交通工具开始值
            'reim/add/select/other/end/:city': 'selectCityBack2',//跳转回交通工具结束值
            'reim/add/select/hotel/back/:city': 'selectCityBack3',//跳转添加酒店
            'reim/add/select/evection': 'selectEvection',//从添加酒店跳转选择出差人界面

            'reim/add/select/workflow': 'selectWorkflow',//选择审批链
            'reim/add/select/hotel': 'selectHotel',//跳转添加酒店
            'reim/add/select/city': 'selectCity',//跳转选择城市
            'reim/add/select/city2': 'selectCity2',//跳转选择城市
            'reim/add/select/city3': 'selectCity3',//跳转hotel选择城市
            'reim/add/select/success': 'showSuccess'//成功
        },

        initialize: function (options) {
            this.appRouter = options.appRouter; //获取主路由器引用
            var shareViews = require('../view/shareViews');
            this.headerView = shareViews.headerView;
            //加载模板
            var ReimOrderTpl = require('text!../template/ReimDoc.hbs'),
                ReimTpl = require('text!../template/Reimburse.hbs'),
                $ = Backbone.$;
            $('body').append(ReimTpl).append(ReimOrderTpl);
        },

        //报销单
        list: function () {
            //我的报销
        },
        filter: function () {
            //筛选条件
        },
        filteredList: function () {
            //筛选报销
        },
        details: function () {
            //报销详情
        },
        queryDate: function () {
            this.headerView.showSearchReim();
            var shareModels = require('../model/shareModels');
            this.searchReim = shareModels.searchReim;
            var filterModel = shareModels.filterModel;
            if (!this.reimQueryView) {
                var ReimQueryView = require('../view/reimburse/ReimQueryView');
                this.reimQueryView = new ReimQueryView({appRouter: this.appRouter});
            }
            var data = filterModel.get('data');
            this.searchReim.search(data,1,20);
            this.reimQueryView.render({reset: true});
        },
        //我提交的报销页面
        queryReim: function () {
            //首次进入 查询我的提交的报销 调用的路由
            var page = 1, pageSize = 20;
            this.headerView.showSearchReim();
            var shareModels = require('../model/shareModels');
            var filterModel = shareModels.filterModel;
            this.searchReim = shareModels.searchReim;
            window.localStorage.removeItem('ifPage');
            filterModel.clear('data');
            if (!this.reimQueryView) {
                var ReimQueryView = require('../view/reimburse/ReimQueryView');
                this.reimQueryView = new ReimQueryView({appRouter: this.appRouter});
            }
            this.searchReim.fetch({reset: true,
                data: {
                    page: page,
                    pageSize: pageSize
                }});
            this.reimQueryView.render();
            var ifPage=window.localStorage.getItem('ifPage');
            if(ifPage){
                this.reimQueryView.hideLoad();
            }
        },
        //查询不同报销状态的订单
        queryReimState: function(state){
            switch (state){
                case -1:
//                    未提交：tripStatus=INCOMPLETE
                    break;
                case 0:
//                    被退回：tripStatus=EOA_REJECTED, EOA_APPROVING, BUDGET_REJECTED, REJECTED
                    break;
                case 1:
//                    待交单：tripStatus=BUDGET_REJECTED, PAY_SUCCESS
                    break;
            }
        },
        //筛选页面
        queryState: function () {
            this.headerView.showQueryReim();
            var ReimSearchView = require('../view/reimburse/RDSearch/ReimSearchView');
            if (!this.reimSearchView) {
                this.reimSearchView = new ReimSearchView({headerView: this.headerView, appRouter: this.appRouter});
            }
            this.reimSearchView.render();
        },
        //可报销订单
        myOrders: function () {
            this.headerView.showReimOrders();
            if (!this.ordersView) {
                var OrdersView = require('../view/reimburse/OrdersView');
                this.ordersView = new OrdersView({appRouter: this.appRouter});
            }
            this.ordersView.render();
        },
        //报销明细回选，进入可报销订单
        otherOrders: function (tripId) {
            this.ordersView.other = true;
            this.ordersView.tripId = tripId;
            this.myOrders();
        },
        //报销单据(报销明细)
        showDocument: function (tripId) {
            if (!this.reimDocView) {
                var ReimDocView = require('../view/reimburse/ReimDocView');
                this.reimDocView = new ReimDocView({appRouter: this.appRouter, tripId: tripId});
            }
            var ShareModels = require('../model/shareModels');
            this.shenpiModel = ShareModels.shenpiModel;
            this.shenpiModel.fetch({data: {tripId: tripId }});
            this.headerView.showReimDocHead(this.reimDocView);
            this.reimDocView.render();
        },
        //申请成功界面
        showSuccess: function () {
            this.headerView.showReimSuccessHeader();
            var DocSuccessView = require('../view/reimburse/DocSuccessView');
            if (!this.docSuccessView) {
                this.docSuccessView = new DocSuccessView({appRouter: this.appRouter});
            }
            this.docSuccessView.render();
        },
        queryHeader: function () {
            this.headerView.showQueryReim();
        },
        selectPayee: function () {
            //选择收款人
        },
        selectBookset: function () {
            //选择账套公司
        },
        //添加交通工具
        selectVehicle: function () {
            this.trafficModel = new Backbone.Model;
            this.headerView.showAddTrafficHeader();
            var ReimAddTrafficView = require('../view/reimburse/ReimAddTrafficView');
            if (!this.trafficView) {
                this.trafficView = new ReimAddTrafficView({appRouter: this.appRouter, trafficModel: this.trafficModel});
            }
            this.trafficView.render();
        },
        //添加酒店
        selectHotel: function () {
            this.headerView.showAddHotelHeader();
            if (!this.hotelView) {
                var ReimAddTrafficView = require('../view/reimburse/ReimAddHotelView');
                this.hotelView = new ReimAddTrafficView({appRouter: this.appRouter, headerView: this.headerView});
            }
            this.hotelView.render();
        },
        //从添加酒店跳转选择出差人界面
        selectEvection: function () {
            this.headerView.showEvectionHeader();
            if (!this.ReimHotelEvectionView) {
                var ReimHotelEvectionView = require('../view/reimburse/rdchildren/ReimHotelEvectionView');
                this.ReimHotelEvectionView = new ReimHotelEvectionView({appRouter: this.appRouter});
            }
        },
        //选择城市
        selectCity: function (flag) {
            this.headerView.showSelectCityHeader();
            var SelectCityView = require('../view/reimburse/SelectCityVeiw');
            var model = null;
            if (flag == 'hotel-select') {
                model = this.hotelModel;
            } else if ('traffic-select') {
                model = this.trafficModel;
            }
            new SelectCityView({appRouter: this.appRouter, model: model, flag: 'start'});
        },
        selectCity2: function () {
            this.headerView.showSelectCityHeader();
            var SelectCityView = require('../view/reimburse/SelectCityVeiw');
            //   ReimDocs = require('../model/ReimDoc'),
            //  orders = new ReimDocs({url: this.ajaxUrls.ORDERS_REIM_URL});
//            var model = null;
//            if(flag == 'hotel-select'){
//                model = this.hotelModel;
//            }else if('traffic-select'){
//                model = this.trafficModel;
//            }
            new SelectCityView({appRouter: this.appRouter, flag: 'end'});
        },
        selectCity3: function () {
            this.headerView.showSelectCityHeader();
            var SelectCityView = require('../view/reimburse/SelectCityVeiw');
            //   ReimDocs = require('../model/ReimDoc'),
            //  orders = new ReimDocs({url: this.ajaxUrls.ORDERS_REIM_URL});
//            var model = null;
//            if(flag == 'hotel-select'){
//                model = this.hotelModel;
//            }else if('traffic-select'){
//                model = this.trafficModel;
//            }
            new SelectCityView({appRouter: this.appRouter});
        },
        //跳转回交通工具
        selectCityBack: function (city) {
            this.trafficView.selectCityBack(city);
        },
        selectCityBack: function (city) {
            this.trafficView.selectStartCityBack(city);
        },

        selectCityBack2: function (city) {
            this.trafficView.selectEndCityBack(city);
        },
        selectCityBack3: function (city) {
            this.hotelView.selectHotelCityBack(city);
        },

        /*选择类型 选择收款人*/

        showPayName: function () {
            this.headerView.showPayName();
            var NamesView = require('../view/reimburse/RDSearch/ReimnameView');
            new NamesView({appRouter: this.appRouter});
        },
        selectTraveller: function () {
            //选择出差人
        },
        selectWorkflow: function () {
            //选择审批链
        }
    });
    return ReimRouter;
});
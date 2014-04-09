/**
 * 订单视图类
 */
define(function (require) {
    var Backbone = require('backbone');
    var OrdersView = Backbone.View.extend({
        el: '#J_Container',
        PAGE_SIZE: 10,
        PAGE_NO: 1,
        events: {
            'tap .J_AirDetails': 'airDetails',
            'tap .J_HotelDetails': 'hotelDetails',
            'tap .J_MultiAirDetails': 'openPsgInfo',
            'tap .J_PsgsDetails': 'openDetails',
            'tap #J_NowRecords': 'nowaRecords',
            'tap #J_PrevRecords': 'prevRecords',
            'tap #J_LoadMoreNow': 'loadMore',
            'tap #J_LoadMorePre': 'loadMore'
        },
        initialize: function (options) {
            this.appRouter = options.appRouter;
            this.models = options.models;
            var shareViews = require('../shareViews');
            this.headerView = shareViews.headerView;
            this.loadingView = shareViews.loadingView;
            this.accquireTpl();
            this.addListeners();
        },
        accquireTpl: function () {
            var Handlebars = require('handlebars');
            //编译Handlebars模板方法
            this.OrdersTemplate = Handlebars.compile($('#J_OrdersTemplate').html());
            this.SingleTemplate = Handlebars.compile($('#J_AirSingleTemplate').html());
            this.MultiTemplate = Handlebars.compile($('#J_AirMultiTemplate').html());
            this.HotelTemplate = Handlebars.compile($('#J_HotelTemplate').html());
            this.ordersHtml = this.OrdersTemplate();
        },
        addListeners: function () {
            //绑定路由消息
            //this.listenTo(this.appRouter, 'route', this.destroy);
            //绑定models消息
            this.models.on({
                'sync': this.result,
                'no_more': this.noMore,
                'error': this.showErrorXhr,
                'prev_error': this.showPrevError,
                'orders_fail': this.fetchFail
            }, this);
        },
        render: function () {
            this.setElement('#J_Container', true);
            this.$el.empty().append(this.ordersHtml);   //初始化外层section容器
            this.PAGE_NO = 1;
            var deferred = this.models.fetchNow(this.PAGE_NO, this.PAGE_SIZE, true);
            this.loadingDeferred(deferred);
            this.showNowMore();
            this.fetchMethod = 'fetchNow';
            return this;
        },
        searchRender: function () {
            this.PAGE_NO = 1;
            this.$el.empty().append(this.ordersHtml);   //初始化外层section容器
            var deferred = this.models.fetchSearch(this.PAGE_NO, this.PAGE_SIZE, true);
            this.loadingDeferred(deferred);
            this.fetchMethod = 'fetchSearch';
            return this;
        },
        //获取过去订单记录
        prevRecords: function () {
            this.clearPageData();
            this.PAGE_NO = 1;
            var deferred = this.models.fetchPrevMonth(this.PAGE_NO, this.PAGE_SIZE, true);
            this.loadingDeferred(deferred);
            this.showPrevMore();
            this.fetchMethod = 'fetchPrevMonth';
        },
        //fetch当前订单记录
        nowaRecords: function () {
            this.clearPageData();
            this.PAGE_NO = 1;
            var deferred = this.models.fetchNow(this.PAGE_NO, this.PAGE_SIZE, true);
            this.loadingDeferred(deferred);
            this.showNowMore();
            this.fetchMethod = 'fetchNow';
        },
        showNowMore: function () {
            this.$('#J_LoadMoreNow').text('+点击加载更多').show();
            this.$('#J_LoadMorePre').text('+点击加载更多').hide();
        },
        showPrevMore: function () {
            this.$('#J_LoadMoreNow').text('+点击加载更多').hide();
            this.$('#J_LoadMorePre').text('+点击加载更多').show();
        },
        loadMore: function () {
            var fetchMethod = this.models[this.fetchMethod];
            var loadMoreDeferred = fetchMethod.apply(this.models, [++this.PAGE_NO, this.PAGE_SIZE, false]);
            this.loadingDeferred(loadMoreDeferred);
        },
        noMore: function (emptyMsg) {
            this.showTips(false, emptyMsg);
            var count = this.models.count;
            if ((this.PAGE_NO - 1) * this.PAGE_SIZE > count) {
                this.$('.J_LoadMore').text('');
            }
        },
        loadingDeferred: function (deferred) {
            if (!!deferred) {
                this.loadingView.show();
                var that = this;
                deferred.always(function () {
                    that.loadingView.hide();
                });
            }
        },
        fetchFail: function (errorMsg) {
            this.showTips(false, errorMsg);
        },
        //请求失败
        showErrorXhr: function () {
            this.setElement('#J_Container', true);
            this.$el.empty().append(this.ordersHtml);//初始化外层section容器
            this.showTips(false, '查询订单失败！');
        },
        showPrevError: function (errorMsg) {
            this.setElement('#J_Container', true);
            this.$el.empty().append(this.ordersHtml);//初始化外层section容器
            this.showTips(false, errorMsg);
        },
        result: function (collection, resp, options) {
            this.prevContainer = this.$('#J_PrevContainer');
            this.nowadaysContainer = this.$('#J_NowaContainer');
            if (options.prev === true) {
                this.resultHistory();
            } else {
                this.resultCurrent();
            }
//            this.scrollto('#J_NowRecords');
        },
        singleResult: function (html, order) {
            var orderRecord = order.attributes;
            if (orderRecord) {
                if (orderRecord.status === 'T') {
                    var size = orderRecord.orderSize;
                    if (size > 1) {
                        html += this.MultiTemplate(orderRecord);
                    } else {
                        html += this.SingleTemplate(orderRecord);
                    }
                } else if (orderRecord.status === 'H') {
                    html += this.HotelTemplate(orderRecord);
                }
                return html;
            }
        },
        //渲染订单列表
        resultAll: function (emptyMsg) {
            this.models.hotelList();
            var model = this.models.at(0);
            if (!!model) {
                return this.models.reduce(this.singleResult, '', this);
            } else {
                this.noMore(emptyMsg);
            }
        },
        showTips: function (valid, message) {
            var tipsView = require('../shareViews').tipsView;
            if (valid) {
                tipsView.showSuccessTips(message);
            } else {
                tipsView.showErrorTips(message);
            }
        },
        clearPageData: function () {
            this.prevContainer.empty();
            this.nowadaysContainer.empty();
        },
        //fetch回调历史订单渲染
        resultHistory: function () {
            this.headerView.changeTitle('历史差旅订单');
            this.nowadaysContainer.hide();
            this.prevContainer.append(this.resultAll('没有更多订单了！')).show();
        },
        //fetch回调当前订单渲染
        resultCurrent: function () {
            this.headerView.changeTitle('最新差旅订单');
            this.prevContainer.hide();
            this.nowadaysContainer.append(this.resultAll('没有更多订单了！')).show();
        },
        openPsgInfo: function (event) {
            var eTarget = event.target || event.srcElement;
            var airMultiple = $(eTarget).parents('.J_MultiOrders');
            airMultiple.find('.J_PsgInfo').toggle();
        },
        openDetails: function (event) {
            var eTarget = event.target || event.srcElement;
            var childId = this.$(eTarget).attr('data-id'),
                airMultiple = $(eTarget).parents('.J_MultiOrders'),
                parentId = airMultiple.attr('data-id');
            this.appRouter.orderNavigate('order/list/details/air/open/' + parentId + '/' + childId, true);
        },
        airDetails: function (event) {
            var eTarget = event.target || event.srcElement;
            var orderId = $(eTarget).parents('.J_AirDetails').attr('data-id');
            var airId = JSON.stringify(orderId);
            window.localStorage.setItem('airId', airId);
            this.appRouter.orderNavigate('order/list/details/air/' + orderId, true);
        },
        hotelDetails: function (event) {
            var eTarget = event.target || event.srcElement;
            var orderId = $(eTarget).parents('.J_HotelDetails').attr('data-id');
            var hotelId = orderId;
            window.localStorage.setItem('hotelId', hotelId);
            this.appRouter.orderNavigate('order/list/details/hotel/' + orderId, true);
        },
        scrollto: function (target) {
            var top = $(target).offset().top;
            window.scrollTo(0, top);
            return this;
        }
        //新增remove方法, 避免$el被remove掉
//        _remove: function () {
//            this.stopListening();
//            this.undelegateEvents();
//            return this;
//        },
//        //涉及的视图/子视图和model/models各自解绑事件和销毁
//        destroy: function () {
//            _remove();
//            delete this.models;
//            delete this;
//        }
    });
    return OrdersView;
});
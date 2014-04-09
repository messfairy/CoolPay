/**
 * 订单视图类
 */
define(function (require) {
    var Backbone = require('backbone'),
        Handlebars = require('handlebars');
    var OrdersView = Backbone.View.extend({
        el: '#J_Container',
        events: {
            'tap a .ss-links': 'scrollto',
//            'swipeUp #J_Container': 'acquireMore',
//            'swipeDown #J_Container': 'acquireBefore',
            'tap .J_AirDetails': 'airDetails',
            'tap .J_HotelDetails': 'hotelDetails',
            'tap .J_AirOpen': 'openPsgInfo',
            'tap .J_PsgsDetails': 'openDetails',
            //'tap #J_NowRecords': 'nowRecords',
            'tap #J_PrevRecords': 'prevRecords'
        },
        initialize: function (options) {
            this.appRouter = options.appRouter;
            this.appRouter.sectionView = this;
            this._ = require('underscore');
            //编译Handlebars模板方法
            var $ = Backbone.$;

            this.OrdersTemplate = Handlebars.compile($('#J_OrdersTemplate').html());
            this.SingleTemplate = Handlebars.compile($('#J_AirSingleTemplate').html());
            this.MultiTemplate = Handlebars.compile($('#J_AirMultiTemplate').html());
            this.HotelTemplate = Handlebars.compile($('#J_HotelTemplate').html());

            this.models = options.models;
            //绑定models消息
            this.listenTo(this.models, 'reset', this.reset);
            this.listenTo(this.models, 'sync', this.render);
            this.listenTo(this.models, 'error', this.failed);
        },

        failed: function (response) {
            console.log('请求失败:' + response['message']);
        },
        //渲染订单列表
        getHtml: function () {
            var html = '', _that = this,
                thisOrders = this.models;
            this.afterMonthTime = thisOrders.at(0).get('departDate');
            thisOrders.each(function (order, index) {
                var orderRecord = order.attributes,
                    ViewHelper = require('../ViewHelper'); //通用helper
                orderRecord.index = index;
                ViewHelper.registerHelper();
                if (orderRecord) {
                    if (orderRecord.status === 'T') {
                        var size = orderRecord.orderSize;
                        if (size > 1) {
                            html += _that.MultiTemplate(orderRecord);
                        } else {
                            html += _that.SingleTemplate(orderRecord);
                        }
                    } else if (orderRecord.status === 'H') {
                        html += _that.HotelTemplate(orderRecord);
                    }
                }
            });
            return html;
        },
        render: function () {
            //初始化外层section容器
            var ordersHtml = this.OrdersTemplate();
            this.$el.empty().append(ordersHtml);
            var nowadaysContainer = $('#J_NowadaysContainer');
            nowadaysContainer.append(this.getHtml());
            //this.autoTo();
            //$(window).scroll(this._.bind(this.scrollBtM, this));
        },
        prevRecords: function () {
            //todo 获取一个月前的xx条记录 mock
            this._ = require('underscore');
            this.listenTo(this.models, 'reset', this._.bind(this.fetchHistory, this));
            this.models.fetch({data: {afterMonthTime: this.afterMonthTime}, reset: true});
        },
        fetchHistory: function () {
            var prevContainer = $('#J_PrevContainer');
            prevContainer.append(this.getHtml());
        },
//        scrollBtM: function () {
//            var scrollTop = $(window).scrollTop();
//            var scrollHeight = $(document).height();
//            var windowHeight = $(window).height();
//            if (scrollTop + windowHeight >= scrollHeight) {
//                //this.stopListening();
//                this.models.fetch({data: {start: 1, end: 20}});
//            }
//        },
        openPsgInfo: function (event) {
            var eTarget = event.target || event.srcElement;
            event.stopPropagation();
            var airMultiple = $(eTarget).parents('.J_MultiOrders');
            airMultiple.find('.J_PsgInfo').toggle();
        },
        openDetails: function (event) {
            var eTarget = event.target || event.srcElement;
            var childId = this.$(eTarget).attr('data-id'),
                airMultiple = $(eTarget).parents('.J_MultiOrders'),
                parentId = airMultiple.attr('data-id');
            this.destroy();
            this.appRouter.orderNavigate('order/list/details/air/open/' + parentId + '/' + childId, true);
        },
        airDetails: function (event) {
            var eTarget = event.target || event.srcElement;
            var orderId = $(eTarget).parents('.J_AirDetails').attr('data-id');
            this.destroy();
            this.appRouter.orderNavigate('order/list/details/air/' + orderId, true);
        },
        hotelDetails: function (event) {
            var eTarget = event.target || event.srcElement;
            var orderId = $(eTarget).parents('.J_HotelDetails').attr('data-id');
            this.destroy();
            this.appRouter.orderNavigate('order/list/details/hotel/' + orderId, true);
        },
        show: function (options) {
            this.models.fetch(options);
        },
        search: function (condition) {
            var params = {reset: true};
//===========================todo mock 查询不同类型========================
            switch (condition.type) {
                case 0:
                    condition.url = params.ORDERS_SEARCH_URL;
                    break;
                case 1:
                    condition.url = params.ORDERS_A_SEARCH_URL;
                    break;
                case 2:
                    condition.url = params.ORDERS_H_SEARCH_URL;
                    break;
                default :
                    condition.url = params.ORDERS_SEARCH_URL;
            }
//===========================todo mock 查询不同类型========================
            params.data = condition;
            this.show(params);
        },
        //todo 滚动到目标元素添加动画效果
        autoTo: function () {
//            var eTarget = event.target || e.srcElement,
//                id = $(eTarget).attr('id');
            scrollTo(0, 700);
        },
        scrollto: function () {
            var id = $(this).attr('href') + 'Show';
            scrollTo(0, $(id).offset().top);
            return false;
        },
        //新增remove方法, 避免$el被remove掉
        _remove: function () {
            this.stopListening();
            return this;
        },
        //涉及的视图/子视图和model/models各自解绑事件和销毁
        destroy: function () {
            this.models.each(function (model) {
                model.off();
            });
            this.undelegateEvents();
            this._remove();
            delete this.models;
            delete this;
        }
    }, {
        registerHelper: function () {
            //todo 定制 handlersbar helper
        }
    });
    return OrdersView;
});
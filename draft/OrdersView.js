/**
 * 订单视图类
 */
define(function (require) {
    var Backbone = require('backbone'),
        Handlebars = require('handlebars');
    var OrdersView = Backbone.View.extend({
        el: '#J_Container',
        events: {
            'tap .J_AirDetails': 'airDetails',
            'tap .J_HotelDetails': 'hotelDetails',
            'tap .J_AirOpen': 'openPsgInfo',
            'tap .J_PsgsDetails': 'openDetails',
            'tap #J_NowRecords': 'nowaRecords',
            'tap #J_PrevRecords': 'prevRecords'
        },
        initialize: function (options) {
            this.appRouter = options.appRouter;
            this.models = options.models;
            this.appRouter.sectionView = this;
            this._ = require('underscore');
            //编译Handlebars模板方法
            this.OrdersTemplate = Handlebars.compile($('#J_OrdersTemplate').html());
            this.SingleTemplate = Handlebars.compile($('#J_AirSingleTemplate').html());
            this.MultiTemplate = Handlebars.compile($('#J_AirMultiTemplate').html());
            this.HotelTemplate = Handlebars.compile($('#J_HotelTemplate').html());
            //绑定models消息
            this.listenTo(this.models, 'sync', this.render);
            this.listenTo(this.models, 'reset', this.reRender);

            var ViewHelper = require('../ViewHelper'); //通用helper
            ViewHelper.registerHelper();
        },
//        //渲染订单列表
//        getHtml: function () {
//            var html = '', _that = this;
//            this.models.each(function (order, index) {
//                var orderRecord = order.attributes;
//                if (orderRecord) {
//                    if (orderRecord.status === 'T') {
//                        var size = orderRecord.orderSize;
//                        if (size > 1) {
//                            html += _that.MultiTemplate(orderRecord);
//                        } else {
//                            html += _that.SingleTemplate(orderRecord);
//                        }
//                    } else if (orderRecord.status === 'H') {
//                        html += _that.HotelTemplate(orderRecord);
//                    }
//                }
//            });
//            return html;
//        },
//        render: function () {
//            //初始化外层section容器
//            var ordersHtml = this.OrdersTemplate();
//            this.$el.empty().append(ordersHtml);
//            var nowaContainer = $('#J_NowaContainer');
//            nowaContainer.append(this.getHtml());
//        },
        getSingle:function (html, order) {
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
        resultAll: function() {
            return this.models.reduce(this.getSingle, '', this);
        },
        render: function () {
            var ordersHtml = this.OrdersTemplate();
            this.$el.empty().append(ordersHtml);//初始化外层section容器
            var nowadaysContainer = $('#J_NowaContainer');
            nowadaysContainer.append(this.resultAll());
        },
        nowaRecords:function(){
            this.models.fetch();
        },
        prevRecords: function () {
            this.models.fetchPrevMonth();
        },
        reRender:function(collection, options) {
            if(options.prev === true){
                this.fetchHistory();
            }else{
                this.render();
            }
        },
        fetchHistory: function() {
            var prevContainer = $('#J_PrevContainer');
            prevContainer.append(this.resultAll());
        },
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
        autoTo: function () {
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
            this._remove();
            delete this.models;
            delete this;
        }
    });
    return OrdersView;
});
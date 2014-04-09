define(function (require, exports) {
    var Backbone = require('backbone'),
        Handlebars = require('handlebars'),
        shareViews = require('../shareViews'),
        loadingView = shareViews.loadingView,
        tipsView = shareViews.tipsView;
    //机票详情View
    var AirDetailsView = Backbone.View.extend({
        el: '#J_Container',
        events: {
            'tap #go-share': 'goShare',
            'tap #show-share': 'showShare',
            'tap #J_ShowNote': 'showNote'
        },
        initialize: function (options) {
            this.appRouter = options.appRouter;
            this.AirInfoTemplate = Handlebars.compile($('#J_AirmessageTemplate').html());
        },
        render: function (airInfo) {
            this.setElement('#J_Container', true);
            window.localStorage.setItem('airInfo', JSON.stringify(airInfo));
            var html = this.AirInfoTemplate(airInfo);
            this.$el.empty().append(html);
        },
        goShare: function () {
            window.localStorage.removeItem('sharePerson');
            window.location.href = '/fcs/mobile/share/airShare.html';
        },
        showShare: function () {
            window.localStorage.removeItem('sharePerson');
            window.location.href = '/fcs/mobile/share/noshare.html';
        },
        showNote: function () {
            if($('#note').hasClass('quit-show')){
                $('#note').show();
                $('#note').removeClass('quit-show');
            } else {
                $('#note').hide();
                $('#note').addClass('quit-show');
            }
        },
        showTips: function (valid, message) {
            if (valid) {
                tipsView.showSuccessTips(message);
            } else {
                tipsView.showErrorTips(message);
            }
        },
        splitResult: function (model, response) {
            if (response.flag) {
                var html = this.AirInfoTemplate(model.toJSON());
                this.$el.empty().append(html);
            } else {
                this.showTips(false, response.message);
            }
        },
        errorResult: function (message) {
            this.showTips(false, message);
        },
        splitBack: function (orderId) {
            this.setElement('#J_Container', true);
            var OrderModel = require('../../model/OrderModel').SplitOrder;
            var orderModel = new OrderModel();
            this.listenTo(orderModel, 'sync', this.splitResult);
            this.listenTo(orderModel, 'rpc_error', this.errorResult);
            var deferred = orderModel.findAir(orderId);
            if (!!deferred) {
                loadingView.show();
                deferred.always(function () {
                    loadingView.hide();
                });
            }
        }
    });
    exports.AirDetailsView = AirDetailsView;
    //酒店详情View
    var HotelDetailsView = Backbone.View.extend({
        el: '#J_Container',
        events: {
            'tap #go-split': 'goSplit',
            'tap #show-split': 'showSplit'

        },
        initialize: function (options) {
            this.appRouter = options.appRouter;
            this.HotelInfoTemplate = Handlebars.compile($('#J_HotelmessageTemplate').html());
            this.regHelper();
        },
        regHelper: function () {
//            00:新建;01已下单;02已入住 状态下为，为03已离店则为realCash 04 已取消 为0
            Handlebars.registerHelper('getCash', function (order) {
                var cash = '';
                switch (order.orderStatus) {
                    case '00':
                        cash = order.preCash;
                        break;
                    case '01':
                        cash = order.preCash;
                        break;
                    case '02':
                        cash = order.preCash;
                        break;
                    case '03':
                        cash = order.realCash;
                        break;
                    case '04':
                        cash = '0';
                        break;
                    default :
                        cash = order.preCash;
                }
                return cash;
            });
            Handlebars.registerHelper('getOrderStatus', function (orderStatus) {
                switch (orderStatus) {
                    case '00':
                        orderStatus = '新建';
                        break;
                    case '01':
                        orderStatus = '已下单';
                        break;
                    case '02':
                        orderStatus = '已入住';
                        break;
                    case '03':
                        orderStatus = '已离店';
                        break;
                    default :
                        orderStatus = '已取消';
                }
                return orderStatus;
            });
        },
        render: function (hotelInfo) {
            this.setElement('#J_Container', true);
            window.localStorage.setItem('hotelInfo', JSON.stringify(hotelInfo));
            var html = this.HotelInfoTemplate(hotelInfo);
            this.$el.empty().append(html);
        },
        goSplit: function () {
            var orderId = JSON.parse(window.localStorage.getItem('hotelId'));
            window.location.href = '/fcs/mobile/share/split-hotel.html?id=' + orderId;
        },
        showSplit: function () {
            var orderId = JSON.parse(window.localStorage.getItem('hotelId'));
            window.location.href = '/fcs/mobile/share/split-hotel-detail.html?id=' + orderId;
        },
        showTips: function (valid, message) {
            if (valid) {
                tipsView.showSuccessTips(message);
            } else {
                tipsView.showErrorTips(message);
            }
        },
        splitResult: function (model, response) {
            if (response.flag) {
                var html = this.HotelInfoTemplate(model.toJSON());
                this.$el.empty().append(html);
            } else {
                this.showTips(false, response.message);
            }
        },
        errorResult: function (message) {
            this.showTips(false, message);
        },
        splitBack: function (orderId) {
            this.setElement('#J_Container', true);
            var OrderModel = require('../../model/OrderModel').SplitOrder;
            var orderModel = new OrderModel();
            this.listenTo(orderModel, 'sync', this.splitResult);
            this.listenTo(orderModel, 'rpc_error', this.errorResult);
            var deferred = orderModel.findHotel(orderId);
            if (!!deferred) {
                loadingView.show();
                deferred.always(function () {
                    loadingView.hide();
                });
            }
        }
    });
    exports.HotelDetailsView = HotelDetailsView;
});
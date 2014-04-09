/**
 * 订单Collection
 * 目前依赖：
 * 订单展示视图
 * 订单筛选视图
 * 新增报销的订单选择视图
 */
define(function (require, exports) {
    var Backbone = require('backbone'),
        _ = require('underscore');
    var Order = Backbone.Model.extend({
        defaults: {
            'checked': false
        },
        idAttribute: 'orderId',
        //切换订单属性：是否被选中
        toggle: function () {
            this.set('checked', !this.isChecked());
        },
        //子视图判断model是否被选中
        isChecked: function () {
            return this.get('checked');
        },
        //处理酒店状态
        mapStatusIn: function () {
            var orderStatus = this.get('orderStatus'),
                status_in = false;
            if (orderStatus) {
                //订单状态00:新建;01已下单;02已入住;03已离店;04已取消
                switch (orderStatus) {
                    case '00':
                        status_in = false;
                        break;
                    case '01':
                        status_in = false;
                        break;
                    case '02':
                        status_in = false;
                        break;
                    case '03':
                        status_in = true;
                        break;
                    default :
                        status_in = false;
                }
                this.set('status_in', status_in);
            }
        }
    });
    exports.SplitOrder = Order.extend({
        urlRoot: '/fcs/do/trip/json/OrderInfoQurey/getTripTravlerInfo',
        actionUrl: '',
        AIR_ORDER_URL: '?type=1&value=',
        HOTEL_ORDER_URL: '?type=2&value=',
        url: function () {
            return this.urlRoot + this.actionUrl;
        },
        findAir: function (orderId) {
            this.actionUrl = this.AIR_ORDER_URL + orderId;
            return this.clear().fetch({action: 'A'});
        },
        findHotel: function (orderId) {
            this.actionUrl = this.HOTEL_ORDER_URL + orderId;
            return this.clear().fetch({action: 'H'});
        },
        parse: function (response, options) {
            if (response.flag) {
                if ('A' === options.action) {
                    return response.result.air;
                } else if ('H' === options.action) {
                    return response.result.hotel;
                }
            } else {
                this.trigger('rpc_error', '获取订单详情失败！');
            }
        }
    });
    exports.OrderModel = Order;
    var OrderList = Backbone.Collection.extend({
        model: Order,
        urlRoot: '/fcs/do/trip/json/OrderInfoQurey',
        COMPLETE_URL: '/orderInfoComplate',
        ORDER_URL: '/oderInfo',
        ORDER_SEARCH_URL: '/oderInfoSelect',
        initialize: function () {
            this.actionUrl = this.ORDER_URL;
        },
        url: function () {
            return this.urlRoot + this.actionUrl;
        },
        // 过滤出选中的列表
        checkedA: function () {
            return this.where({'status': 'T', 'checked': true});
        },
        checkedH: function () {
            return this.where({'status': 'H', 'checked': true});
        },
        fetchNow: function (pageNo, pageSize, reset) {
            this.actionUrl = this.ORDER_URL;
            return this.fetchPage({reset: reset}, pageNo, pageSize);
        },
        fetchPrevMonth: function (pageNo, pageSize, reset) {
            var model = this.at(0);
            if (!!model) {
                var departDate = model.get('departDate');
                var XDate = require('xdate');
                var dateString = new XDate(departDate).toString('yyyy-MM-dd');
                var params = {afterMonthTime: dateString};
                this.actionUrl = this.ORDER_URL;
                return this.fetchPage({reset: reset, prev: true, data: params}, pageNo, pageSize);
            } else {
                this.trigger('prev_error', '没有历史订单记录！');
                return false;
            }
        },
        //查询操作
        fetchSearch: function (pageNo, pageSize, reset) {
            this.actionUrl = this.ORDER_SEARCH_URL;
            this.fetchPage({reset: reset, data: this.params}, pageNo, pageSize);
        },
        fetchComplete: function (pageNo, pageSize, reset) {
            this.actionUrl = this.COMPLETE_URL;
            return this.fetchPage({reset: reset}, pageNo, pageSize);
        },
        //分页查询
        fetchPage: function (options, pageNo, pageSize) {
//            var start = (pageNo - 1) * pageSize+ 1;
//            var end = (pageNo) * pageSize;
//            options.data = options.data||{};
//            options.data.start = start;
//            options.data.end = end;
            options.data = options.data || {};
            options.data.page = pageNo;
            options.data.pageSize = pageSize;
            return this.fetch(options);
        },
        //查询页面传值
        searchParams: function (params) {
            this.params = params;
        },
        hotelList: function () {
            var hotelList = this.where({status: 'H'});
            _.each(hotelList, function (hotel) {
                hotel.mapStatusIn();
            });
            return hotelList;
        },
        singList: function () {
            this.remove(this.multiList());
            return this;
        },
        multiList: function () {
            return this.where({orderSize: 1});
        },
        parse: function (response) {
            var list = [];
            if (response.flag) {
                var count = response.result ? response.result.count : 0;
                this.count = count | 0;
                if (response.result.listAll && (response.result.listAll.length > 0)) {
                    list = response.result.listAll;
                }
                if (response.result.airlist) {
                    list = list.concat(response.result.airlist);
                }
                if (response.result.hotellist) {
                    list = list.concat(response.result.hotellist);
                }
                if (response.result.currentDate) {
                    list.currentDate = response.result.currentDate;
                }
                this.trigger('orders_ok', response['message']);
            } else {
                this.trigger('orders_fail', response['message']);
            }
            return list;
        }
    });
    exports.OrderList = OrderList;
});
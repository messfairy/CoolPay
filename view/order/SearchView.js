define(function(require){
    var Backbone = require('backbone'),
        Handlebars = require('handlebars'),
        orderList = require('../../model/shareModels').orderList;
    //查询视图
    var SearchView = Backbone.View.extend({
        el: '#J_Container',
        model: orderList,
        template : Handlebars.compile($('#J_OrderSearchTpl').html()),
        events: {
            'tap #J_SearchConfirm': 'doSearch'
        },
        initialize: function (options) {
            //编译Handlebars模板方法
            this.appRouter = options.appRouter;
            this.ViewHelper = require('../common/ViewHelper');
        },
        render: function () {
            this.setElement('#J_Container', true);
            var html = this.template();
            this.$el.empty().append(html);
            this.ViewHelper.datepicker();
        },
        //后台查询参数生成字符串
        doSearch: function () {
            var interval = this.$('#J_Interval').val(),
                type = this.$('#J_Type').val(),
                orderType = this.$('#J_OrderType').val(),
                CCName = this.$('#J_CCName').val();
            orderList.searchParams({
                interval: interval,
                type: type,
                orderType: orderType,
                CCName: CCName
            });
            this.appRouter.orderNavigate('order/list/search/submit', true);
        }
    });
    return SearchView;
});
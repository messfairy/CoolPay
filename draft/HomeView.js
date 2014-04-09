define(function (require) {
    var Backbone = require('backbone'),
        Handlebars = require('handlebars');
    var HomeView = Backbone.View.extend({
        el: '#J_Container',
        events: {
            'tap #J_AirTicketItem': 'showAir',
            'tap #J_HotelItem': 'showHotel',
            'tap #J_OrdersItem': 'showOrders',
            'tap #J_ReimburseItem': 'showReimOrders',
            'tap #J_QueryIfItem': 'queryIf',
            'tap #J_ReimburseDoc': 'reimburseDoc',
            'tap #J_SearchItem': 'searchItem',
            'tap #J_TestIframe': 'testIframe',
            //todo
            'tap #TestAddTraffic': 'testAddTraffic'
        },
        render: function () {
            this._ = require('underscore');
            var html = this.template();
            this.$el.empty().append(html);
        },
        initialize: function (options) {
            this.appRouter = options.appRouter;
            this.appRouter.sectionView = this;
            //编译Handlebars模板方法
            var $ = Backbone.$;
            this.template = Handlebars.compile($('#J_IndexTemplate').html());
            this.render();
        },
        testIframe: function () {
            this.clear();
            this.appRouter.navigate('test/iframe/baidu', true);
        },

        //todo
        testAddTraffic: function () {
            this.clear();
            this.appRouter.navigate('test/traffic', true);
        },

        //订单查询
        showOrders: function () {
            this.clear();
            this.appRouter.orderNavigate('order/list', true);
        },
        //查询是否有订单
        queryIf: function () {
            this.clear();
            //this.appRouter.reimNavigate('reim/add/query', true);
            //假如没有订单
            this.appRouter.reimNavigate('reim/add/no-order', true);
        },
        //可报销订单
        showReimOrders: function () {
            this.clear();
            this.appRouter.reimNavigate('reim/add/orders', true);
        },
        //显示报销单页面
        reimburseDoc: function () {
            this.clear();
            this.appRouter.reimNavigate('reim/add/document', true);
        },
        //查询提交的报销
        searchItem: function () {
            this.clear();
            this.appRouter.reimNavigate('reim/query', true);
        },
        //渲染万里通机票页面
        showAir: function () {
            this.appRouter.appNavigate('dmzstg/air', true);
        },
        //渲染万里通酒店页面
        showHotel: function () {
            this.clear();
            this.appRouter.appNavigate('dmzstg/hotel', true);
        },
        showErrorMsg: function (jqXHR) {
            var errorMsg = "请求失败，错误码：" + jqXHR.status + "&&错误信息" + jqXHR.statusText;
            alert(errorMsg);
            console.log(errorMsg);
        },
        clear:function(){
            this.stopListening();
            this.undelegateEvents();
        }
    }, {//获取远程数据
        rpcGet: function (url, callback, view) {
            $.get(url).done(callback).fail(function (jqXHR) {
                if (!!view) {
                    view.showErrorMsg(jqXHR);
                }
            });
        }
    });
    return HomeView;
});
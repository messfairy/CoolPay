/**
 * 可报销订单
 */
define(function (require) {
    var Backbone = require('backbone'),
        _ = require('underscore'),
        Handlebars = require('handlebars');
    var OrdersView = Backbone.View.extend({
        other: false, //保存报销明细跳转标识
        aoViews: [], //保存所有机票子视图引用
        el: '#J_Container',
        OrderView: require('./OrderView'),
        hoViews: [], //保存所有酒店子视图引用
        events: {
            'tap .J_CheckAOAll': 'checkAOAll',
            'tap .J_CheckHOAll': 'checkHOAll',
            'tap .J_OrdersSelect': 'submit',
//            'tap #J_AddTravel': 'addTravel',
            'tap #J_Cancel': 'cancel',
            'tap #J_Next': 'submitNoOrder'
        },
        uncheckedCls: 'sure-icon',
        checkedCls: 'sure-icon-en',
        initialize: function (options) {
            this._ = require('underscore');
            //编译Handlebars模板方法
            var $ = Backbone.$;
            this.appRouter = options.appRouter;
            this.template = Handlebars.compile($('#J_ReimOrdersTpl').html());
            this.ATemplate = Handlebars.compile($('#J_AOrderTpl').html());
            this.HTemplate = Handlebars.compile($('#J_HOrderTpl').html());
            var shareViews = require('../shareViews');
            this.headerView = shareViews.headerView;
            this.loadingView = shareViews.loadingView;
            this.ViewHelper = require('../common/ViewHelper');

            var shareModels = require('../../model/shareModels');
            this.models = shareModels.reimOrders;//可报销订单models
            this.reimModel = shareModels.reimModel;//报销提交model
            this.listenTo(this.models, 'sync', this.ordersRender);
            this.listenTo(this.models, 'error', this.listError);
            this.listenTo(this.reimModel, 'sync', this.saveResult);
            this.listenTo(this.reimModel, 'error', this.saveError);
            //监听reimRouter消息, 当路由发生变化, 销毁一切
//            this.listenTo(this.appRouter, 'route', this.destroy);
//            this.models.fetch();
        },
        render: function () {
            this.setElement('#J_Container', true);
            this.$el.empty().append(this.template());
            this.J_AContainer = $('#J_AContainer');
            this.J_HContainer = $('#J_HContainer');
            this.noOrderTips = this.$('#J_TipsMash');
            var deferred = this.models.fetchComplete();
            this.alwaysLoading(deferred);
            return this;
        },
        alwaysLoading: function(deferred){
            if(!!deferred){
                this.loadingView.show();
                var that = this;
                deferred.always(function(){
                    that.loadingView.hide();
                });
            }
        },
        listError: function(){
            this.ViewHelper.showTips(false, '查询可报销订单失败！');
        },
        ordersRender: function (models) {
            if (models.length === 0) {
                this.noOrderTips.show();
            }else{
                this.addAllAO(this.J_AContainer, models);
                this.addAllHO(this.J_HContainer, models);
                //获取all check 元素
                this.allCheckA = $('.J_CheckAOAll');
                this.allCheckH = $('.J_CheckHOAll');
            }
        },
        cancel: function () {
            this.noOrderTips.hide();
            this.appRouter.appNavigate('home', true);
        },
        addTravel: function () {
            this.ViewHelper.showTips(false, '添加行程功能未完成！');
        },
        hideLoading: function () {
            this.loadingView.hide();
        },
        submitNoOrder: function () {
            this.noOrderTips.hide();
            var deferred = this.reimModel.submitNoOrder();
            this.alwaysLoading(deferred);
        },
        getCheckedA:function(thisOrders){
            var checkedA = thisOrders.checkedA();
            var aIds = this._.map(checkedA, function (order) {
                return order.get('orderId');
            });
            return aIds;
        },
        getCheckedIds:function(thisOrders, checkFunc){
            var checked = thisOrders[checkFunc]();
            var ids = this._.map(checked, function (order) {
                return order.get('orderId');
            });
            return ids;
        },
        submit: function () {
            var thisOrders = this.models;
            var aIds = this.getCheckedIds(thisOrders, 'checkedA');
            var hIds = this.getCheckedIds(thisOrders, 'checkedH');
            var deferred;
            if(aIds.length===0&&hIds.length===0){
                deferred = this.reimModel.submitNoOrder();
            }else{
                deferred = this.reimModel.submitDoc(aIds, hIds);
            }
            this.alwaysLoading(deferred);
        },
        saveError: function (model, xhr, options) {
            this.ViewHelper.showTips(false, xhr.statusText);
        },
        saveResult: function (model, response) {
            if(response.flag){
                //跳转报销单头信息页面
                var tripDto = this.reimModel.getTripInfo();
                var tripId = tripDto.tripId;
                if(tripId){
                    this.doNavigate(tripId);
                }else{
                    this.ViewHelper.showTips(false, '生成报销单失败！');
                }
            }else{
                this.ViewHelper.showTips(false, response.message + ' 生成报销单失败！');
            }
        },
        doNavigate:function(tripId){
            if (!this.other) {
                this.appRouter.selectorNavigate('reim/add/head/' + tripId, true); //跳转报销单头部页面
            } else {//如果从报销明细路由过来
                this.appRouter.selectorNavigate('reim/add/document/' + this.tripId, true); //跳转报销明细页面
            }
        },
        isChecked: function (e) {
            var eTarget = e.target || e.srcElement,
                eChecked = $(eTarget).hasClass(this.checkedCls);//is(':checked');
            return eChecked;
        },
        check: function (head) {
            var checked = head.hasClass(this.uncheckedCls);
            (checked) && (head.removeClass(this.uncheckedCls).addClass(this.checkedCls));
        },
        uncheck: function (head) {
            var checked = head.hasClass(this.checkedCls);
            (checked) && (head.removeClass(this.checkedCls).addClass(this.uncheckedCls));
        },
        checkAOAll: function (e) {
            var eChecked = this.isChecked(e);//当前是否checked
            var eTarget = e.target || e.srcElement;
            if (eChecked) {
                this.uncheck($(eTarget));
            } else {
                this.check($(eTarget));
            }
            this._.each(this.aoViews, function (aoView) {
                aoView.itemCheck(eChecked);
            });
        },
        checkHOAll: function (e) {
            var eChecked = this.isChecked(e);
            var eTarget = e.target || e.srcElement;
            if (eChecked) {
                this.uncheck($(eTarget));
            } else {
                this.check($(eTarget));
            }
            this._.each(this.hoViews, function (hoView) {
                hoView.itemCheck(eChecked);
            });
        },
        addAO: function (memo, order) {
            var aoView = new this.OrderView({model: order, template: this.ATemplate});
            //添加子视图并绑定uncheck事件
            this.aoViews.push(aoView);
            //绑定机票子视图消息
            this.listenTo(aoView, 'un_check', this._.bind(this.uncheckAAll, this));
            return memo.append(aoView.render().el);
        },
        addHO: function (memo, order) {
            var hoView = new this.OrderView({model: order, template: this.HTemplate});
            this.hoViews.push(hoView);
            //绑定酒店子视图消息
            this.listenTo(hoView, 'un_check', this._.bind(this.uncheckHAll, this));
            return memo.append(hoView.render().el);
        },
        //append所有机票
        addAllAO: function (container, models) {
            this.aoOrders = models.where({'status': 'T'});
            this._.reduce(this.aoOrders, this.addAO, container, this);    //函数式编程强大的表现力
        },
        //append所有酒店
        addAllHO: function (container, models) {
            this.hoOrders = models.where({'status': 'H'});
            this._.reduce(this.hoOrders, this.addHO, container, this);
        },
        uncheckAAll: function () {
            this.uncheck(this.allCheckA);
        },
        uncheckHAll: function () {
            this.uncheck(this.allCheckH);
        },
        //新增remove方法, 避免$el被remove掉
        _remove: function () {
            this.$el.empty();
            this.stopListening();
            return this;
        },
        //涉及的视图/子视图和model/models各自解绑事件 销毁
        destroy: function () {
            this._.each(this.aoViews, function (aoView) {
                aoView.remove();
            });
            this._.each(this.hoViews, function (hoView) {
                hoView.remove();
            });
            this.undelegateEvents();
            this._remove();
            delete this.models;
            delete this.aoViews;
            delete this.hoViews;
            delete this;
        }
    });
    return OrdersView;
})
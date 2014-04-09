/*
 * 交通子视图
 * */
define(function (require) {
    var Backbone = require('backbone'),
        Handlebars = require('handlebars');
    var ReimDocTrafficView = Backbone.View.extend({
        tagName: 'section',
        template: Handlebars.compile($('#J_ReimDocTraffic').html()),//交通模板
        events: {
            // 'tap #J_AddVehicle': 'addVehicle',
            'tap .J_ReimDocBtn': 'deleteNum',
            'tap .J_ReimDocNumber': 'updateNum',
            'blur .J_Plane_price': 'planeToPrice'
        },
        initialize: function (options) {
            this.appRouter = options.appRouter;
            this.model = options.model;
            this.amountModel = options.amountModel;
            this._ = require('underscore');
            this.listenTo(this.model, 'sync', this.render);
            this.Viewhelper = require('../../common/ViewHelper');
        },
        render: function () {
            this.dataArray = this.model.get('List');
            var html = this.template({'dataArray': this.dataArray});
            this.$el.empty().append(html);
            $('#J_ReimDocTraf').append(this.$el);
            return this;
        },
        //跳转到添加交通工具
        addVehicle: function () {
            var addTrafficModel = require('../../../model/shareModels').addTrafficModel;
            var list = [];
            this._.each(this.dataArray, function (orderItem, index) {
                var tripNum = {};
                tripNum.tripId = orderItem.tripId;
                tripNum.tripPersonName = orderItem.tripPersonName;
                tripNum.tripPersonId = orderItem.tripPersonId;
                list[index] = tripNum;
            });
            addTrafficModel.clear();
            addTrafficModel.set('travellers', list);
            this.appRouter.reimNavigate('reim/add/select/other', true);
        },
        //删除数据
        deleteNum: function (e) {
            var viewHelper = this.Viewhelper;
            var a = e.currentTarget || e.srcElement;
            var id = $(a).data('id');
            $.ajax({
                type: 'get',
                url: '/fcs/do/trip/json/ExpenseAccountInfo/getDeleAirRoundInfo?roundTripId=' + id,
                dataType: 'json',
                success: function (response) {
                    var b = $(a).parent().parent().parent().children().length;
                    if (b > 1) {
                        $(a).parent().parent().remove();
                    } else {
                        $(a).parent().parent().parent().parent().remove();
                    }
                    viewHelper.showTips(true, response.message);
                },
                error: function (xhr) {
                    viewHelper.showTips(false, '网络异常，请重试');
                }
            });
        },
        //修改数据
        updateNum: function (e) {
            var a = e.currentTarget || e.srcElement;
            var b = $(a);
            var c = b.find('span').eq(0);
            var d = $(a).parent().parent().parent().parent().parent().find('h3').find('span').eq(1);
            var e = $(a).parent().parent().parent().parent().find('div');
            var addTrafficModel = require('../../../model/shareModels').addTrafficModel;
            var data = {
                means: e.data('traffic'),
                price: c.data('price'),
                roundTripId: b.next().data('id'),
                startCity: c.data('startcity'),
                endCity: c.data('endcity'),
                tripPersonName: d.data('trippersonname')
            }
            addTrafficModel.clear();
            addTrafficModel.set('updateNum', data);
            this.appRouter.reimNavigate('reim/add/select/other', true);
        },
        //从确定订单带来的飞机票金额可修改，但不能修改比原金额还大
        planeToPrice: function (e) {
            var viewHelper = this.Viewhelper;
            var input = e.currentTarget;
            var $input = $(input);
            var oldPrice = $input.data('value');
            var price = $input.val();
            if(!price){
                $input.val(0);
            } else if (!(/^(([1-9]\d*)|\d)(\.\d{1,2})?$/).test(price)) {
                viewHelper.showTips(false, '金额格式不对，请重填');
            } else {
                if (Number(oldPrice) < Number(price)) {
                    viewHelper.showTips(false, '修改的金额不能比原金额大');
                    $input.val(oldPrice);
                }
            }
            this.changeTripAmount();
        },
        changeTripAmount: function () {
            var changePrice = this.$('.J_Plane_price').reduce(function (memo, input) {
                var $input = $(input), price = $input.val(), oldPrice = $input.attr('data-value');
                return memo + Number(price | 0) - Number(oldPrice | 0);
            }, 0);
            this.amountModel.set('tripAmountChange', changePrice);
        }
    });
    return ReimDocTrafficView;
});
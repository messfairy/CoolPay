/*
 * 市交通费子视图
 * */
define(function (require) {
    var Backbone = require('backbone'),
        _ = require('underscore'),
        Handlebars = require('handlebars');
    var ReimDocTrafFellView = Backbone.View.extend({
        tagName: 'section',
        template: Handlebars.compile($('#J_ReimDocTrafficFell').html()),
        events: {
            //事件
            'blur .J_TripCityAmount': 'checkAllowance'
        },
        initialize: function (options) {
            this.appRouter = options.appRouter;
            this.reimDocView = options.reimDocView;
            //市内交通费模板
            this.model = options.model;
            this.amountModel = options.amountModel;
            var _ = require('underscore');
            this.listenTo(this.model, 'sync', _.bind(this.render, this));
            this.viewHelper = require('../../common/ViewHelper');
        },
        render: function () {
            var dataArray = this.model.get('perList');
            var html = this.template({'dataArray': dataArray});
            this.$el.empty().append(html);
            $('#J_ReimDocTrafFell').append(this.$el);
            return this;
        },
        checkAllowance: function (event) {
            var target = event.currentTarget, amountInput = this.$(target), price = amountInput.val();
            if(!price){
                amountInput.val(0);
            }else if (!/[0-9]+/.test(price)) {
                amountInput.val(0);
                this.viewHelper.showTips(false, '金额格式不对！');
            }
            //更新市内交通费总金额
            this.changeTrafficAmount();
        },
        changeTrafficAmount: function(){
            var changePrice = this.$('.J_TripCityAmount').reduce(function(memo, input){
                var $input = $(input), price = $input.val(), oldPrice = $input.attr('data-price');
                return memo + Number(price|0) - Number(oldPrice|0);
            }, 0);
            this.amountModel.set('trafficAmountChange', changePrice);
        }
    });
    return ReimDocTrafFellView;
});
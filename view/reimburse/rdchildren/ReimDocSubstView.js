/*
 * 补助子视图
 * */
define(function (require) {
    var Backbone = require('backbone'),
        Handlebars = require('handlebars');
    var ReimDocSubstView = Backbone.View.extend({
        tagName: 'section',
        template: Handlebars.compile($('#J_ReimDocSubsidy').html()),
        events: {
            //事件
            'blur .J_ReimCount': 'checkPrice'
        },
        initialize: function (options) {
            this.id = options.id;
            this.appRouter = options.appRouter;
            this.model = options.model;
            this.amountModel = options.amountModel;
            this.listenTo(this.model, 'sync', this.render);
        },
        render: function () {
            var _ = require('underscore');
            var dataArray = this.model.get('perList');
            _.each(dataArray, function (orderItem) {
                orderItem.price = Number(orderItem.tripDays|0)* Number(orderItem.allowance|0);
            });
            var html = this.template({'dataArray': dataArray});
            this.$el.empty().append(html);
            $('#J_ReimDocSubst').append(this.$el);
            return this;
        },
        checkPrice: function (event) {
            var $daysInput = $(event.currentTarget), data1 = $daysInput.val(),
                data2 = $daysInput.attr("data-money"); //已有价格
            $daysInput.parent().parent().next().find('.J_price').text(Number(data1|0) * Number(data2|0));
            this.changePrice();
        },
        changePrice: function(){
            var changePrice = this.$('.J_ReimCount').reduce(function(memo, input){
                var $input = $(input), data1 = $input.val(),
                    data2 = $input.attr('data-money'), data3 = $input.attr('data-price');
                //已有价格
                return memo + Number(data1|0) * Number(data2|0) - Number(data3|0);
            }, 0);
            this.amountModel.set('substChange', changePrice);
        },
        clear: function () {
            this.model.destroy();
        }
    });
    return ReimDocSubstView;
});
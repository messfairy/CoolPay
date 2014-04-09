/*
 * 住宿子视图
 * */
define(function (require) {
    var Backbone = require('backbone'),
        Handlebars = require('handlebars');
    var ReimDocQuarterView = Backbone.View.extend({
        tagName: 'section',
        template: Handlebars.compile($('#J_ReimDocQuarterTpl').html()),
        events: {
            //'tap #J_AddHotel': 'addHotel',//添加酒店
            'touchstart .J_HotelNum': 'deleteHotel',//删除酒店
            'tap .J_update': 'updateHotel',
            'blur .J_HotelPrice': 'hotelPrice'
        },
        initialize: function (options) {
            this.appRouter = options.appRouter;
            this.model = options.model;
            var _ = require('underscore');
            this.listenTo(this.model, 'sync', _.bind(this.render, this));
            this.amountModel = options.amountModel;
            this.ViewHelper = require('../../common/ViewHelper');
        },
        render: function () {
            this.dataArray = this.model.get('tripHotelList');
            var html = this.template({'dataArray': this.dataArray});
            this.$el.empty().append(html);
            $('#J_ReimDocQter').append(this.$el);
            return this;
        },
//        //添加酒店（点击添加酒店进入）
//        addHotel: function () {
//            var addHotel = require('../../../model/shareModels').addHotelModel;
//            addHotel.clear();
//            this.appRouter.reimNavigate('reim/add/select/hotel', true);
//        },
        //修改数据进入酒店
        updateHotel: function (e) {
            var a = e.currentTarget || e.srcElement;
            var data = {
                inPeopel: $(a).data('inpeopel'),
                tripHotelId: $(a).data('triphotelid'),
                tripId: $(a).data('tripid'),
                idHotelOrder: $(a).data('idhotelorder'),
                amount: $(a).data('amount'),
                inDay: $(a).data('inday'),
                leaveDay: $(a).data('leaveday'),
                hotelCity: $(a).data('hotelcity'),
                inPeopelId: $(a).data('inpeopelid')
            };
            var addHotel = require('../../../model/shareModels').addHotelModel;
            addHotel.clear();
            addHotel.set('updateNum', data);
            this.appRouter.reimNavigate('reim/add/select/hotel', true);
        },
        //删除酒店
        deleteHotel: function (e) {
            var ViewHelper = this.ViewHelper;
            var a = e.currentTarget || e.srcElement;
            var id = $(a).data('triphotelid');
            $.ajax({
                type: 'get',
                url: '/fcs/do/trip/json/ExpenseAccountInfo/' + id,
                dataType: 'json',
                success: function (response) {
                    $(a).parent().parent().remove();
                    ViewHelper.showTips(true, '删除成功');
                },
                error: function (xhr) {
                    ViewHelper.showTips(false, '网络异常，请稍候重试！');
                }
            });
            e.stopPropagation();
        },
        //从订单带过来的酒店金额可以修改，但只能改小
        hotelPrice: function (e) {
            var ViewHelper = this.ViewHelper;
            var input = e.currentTarget;
            var $input = $(input);
            var oldPrice = $input.data('value');
            var price = $input.val();
            if(!price){
                $input.val(0);
            } else if (!(/^(([1-9]\d*)|\d)(\.\d{1,2})?$/).test(price)) {
                ViewHelper.showTips(false, '金额格式不对，请重填');
            } else {
                if (Number(oldPrice) < Number(price)) {
                    ViewHelper.showTips(false, '修改的金额不能比原金额大');
                    $input.val(oldPrice);
                }
            }
            this.changeHotelPrice();
        },
        changeHotelPrice: function () {
            var changePrice = this.$('.J_HotelPrice').reduce(function (memo, input) {
                var $input = $(input), price = $input.val(), oldPrice = $input.attr('data-value');
                return memo + Number(price | 0) - Number(oldPrice | 0);
            }, 0);
            this.amountModel.set('hotelAmountChange', changePrice);
        }
    });
    return ReimDocQuarterView;
});
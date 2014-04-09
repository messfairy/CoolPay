/*
 *报销明细
 * */
define(function (require) {
    var Backbone = require('backbone'),
        Handlebars = require('handlebars');
    var ReimDocView = Backbone.View.extend({
        el: '#J_Container',
        template: Handlebars.compile($('#J_ReimDocTemplate').html()),
        ReimDocTrafficView: require('./rdchildren/ReimDocTrafficView'),
        ReimDocQuarterView: require('./rdchildren/ReimDocQuarterView'),
        ReimDocTrafFellView: require('./rdchildren/ReimDocTrafFellView'),
        ReimDocSubstView: require('./rdchildren/ReimDocSubstView'),
        events: {
            'tap #J_ReimDocOther': 'showOtherView',
            'tap #ReimBtnfff': 'saveDraft',
            'tap #ReimBtncss': 'createSingle',
            'tap #J_ButtonHide': 'hideButton',
            'tap #J_ButtonGo': 'submitReim',
            'tap .J_Shenpi': 'selectShenpi',
            'tap #J_AddVehicle': 'addVehicle',//添加交通工具
            'tap #J_AddHotel': 'addHotel',//添加酒店
            'blur #J_OtherAmount': 'otherAmountCheck'
        },
        initialize: function (options) {
            var $ = Backbone.$;
            this._ = require('underscore');
            this.tripId = options.tripId;
            this.appRouter = options.appRouter; //获得路由
            //选择审批连
            var ShareModels = require('../../model/shareModels');
            this.shenpiModel = ShareModels.shenpiModel;
            this.addEvection = ShareModels.addEvectionModel;
            this.shenpitpl = Handlebars.compile($('#J_ShenpiTpl').html());
            this.ViewHelper = require('../common/ViewHelper');
            var ReimDoc = require('../../model/ReimDoc');
            this.reimDoc = new ReimDoc(this.tripId);
            this.amountModel = new Backbone.Model;
            this.listenTo(this.amountModel, 'change', this.updateAmount);
            this.listenTo(this.reimDoc, 'sync', this._.bind(this.renderAmount, this));
            this.listenTo(this.shenpiModel, 'sync', this._.bind(this.renderEach, this));
        },
        updateAmount: function (model) { //amountModel
//            var allPrice = model.get('allPrice');
            var allAmounts = model.get('allAmounts');//后台返回的金额
            var trafficAmountChange = model.get('trafficAmountChange');
            var tripAmountChange = model.get('tripAmountChange');
            var hotelAmountChange = model.get('hotelAmountChange');
            var substChange = model.get('substChange');
            var otherChange = model.get('otherChange');
            var allAmount = allAmounts + trafficAmountChange + tripAmountChange + hotelAmountChange + substChange + otherChange;
            this.$('#J_TotalAmount').text(allAmount);
        },
        renderAmount: function (model) {
            var superscale = model.get('superscale');
//            var allPrice = model.get('allPrice');
            var allAmounts = model.get('allAmounts');
            this.amountModel.set({
                'allAmounts': Number(allAmounts),//后台返回的金额
                'trafficAmountChange': 0,
                'tripAmountChange': 0,
                'hotelAmountChange': 0,
                'substChange': 0,
                'otherChange': 0
            });
            var other = model.get('other');
            this.blackUser = model.get('blackUser');//获取黑名单信息
            this.$('#J_TotalAmount').text(allAmounts);
            var overproof = this.$('#J_overproof');
            var otherContent = this.$('#J_ReimDocOtherContent');
            if (superscale != '') {
                overproof.removeClass('fn-hide');
                overproof.find('textarea').val(superscale);
            }
            if (other != null) {
                this.$('#J_ReimDocOther span').removeClass('arrow-down-icon-clr999').addClass('arrow-up-icon-clr999');
                otherContent.removeClass('fn-hide');
                otherContent.find('textarea').val(other.remark);
                otherContent.find('input').val(other.overAmount);
            }
            //判断是否为黑名单
            if (this.blackUser.p_flag !== 'Y') {
                $('#ReimBtncss').addClass('btn-css-disable');
                $('#J_BlackUser').removeClass('fn-hide');
                if (this.blackUser.p_err_msg.indexOf('<br>')) {
                    var text = this.blackUser.p_err_msg.replace('<br>', "<br>");
                } else {
                    var text = this.blackUser.p_err_msg;
                }
                $('#J_BlackUser').find('p').html(text);
            }
        },
        render: function () {
            this.$el.empty().append(this.template());
            //四个子view
            !this.trafficView && (this.trafficView = new this.ReimDocTrafficView({
                appRouter: this.appRouter,
                amountModel: this.amountModel,
                model: this.reimDoc
            }));
            !this.quarterView && (this.quarterView = new this.ReimDocQuarterView({
                appRouter: this.appRouter,
                amountModel: this.amountModel,
                model: this.reimDoc
            }));
            !this.trafFellView && (this.trafFellView = new this.ReimDocTrafFellView({
                appRouter: this.appRouter,
                model: this.reimDoc,
                amountModel: this.amountModel,
                reimDocView: this
            }));
            !this.trasubstView && (this.trasubstView = new this.ReimDocSubstView({
                appRouter: this.appRouter,
                amountModel: this.amountModel,
                model: this.reimDoc
            }));
            var deferred = this.reimDoc.fetch({reset: true});
            //控制页面尾部显示
            !!deferred && deferred.always(function () {
                $('#J_ReimDocPage').show();
            })
        },
        //点击添加交通工具按钮
        addVehicle: function () {
            var addTrafficModel = require('../../model/shareModels').addTrafficModel;
            var list = [];
            this._.each(this.reimDoc.get('List'), function (orderItem, index) {
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
        //添加酒店（点击添加酒店进入）
        addHotel: function () {
            var addHotel = require('../../model/shareModels').addHotelModel;
            addHotel.clear();
            this.appRouter.reimNavigate('reim/add/select/hotel', true);
        },
        otherAmountCheck: function(event){
            var $input = $(event.currentTarget);
            var priceChange = $input.val();
            if (!(/^(([1-9]\d*)|\d)(\.\d{1,2})?$/).test(priceChange)) {
                this.ViewHelper.showTips(false, '其他金额格式有误，请重填');
                $input.val(0);
            }else{
                this.amountModel.set('otherChange', Number(priceChange));
            }
        },
        //所有子view进行fetch
        refresh: function (collection) {
            return collection.fetch({reset: true});
        },
        //创建子视图对象
        _createSubView: function (option, SubView) {
            var subView = new SubView(option);
            $('#' + option.id).append(subView.render().el);
        },
        //点击显示其他项
        showOtherView: function () {
            var a = $('#J_ReimDocOther span');
            if (a.hasClass('arrow-up-icon-clr999')) {
                $('#J_ReimDocOtherContent').addClass('fn-hide');
                a.removeClass('arrow-up-icon-clr999').addClass('arrow-down-icon-clr999');
            } else if (a.hasClass('arrow-down-icon-clr999')) {
                $('#J_ReimDocOtherContent').removeClass('fn-hide');
                a.removeClass('arrow-down-icon-clr999').addClass('arrow-up-icon-clr999');
            }
        },
        //获取页面数据
        getModel: function () {
            var li = $('#J_reimDoctraffic').find('li');
            var sub = $('#J_reimDocSub').find('li');
            var plane = $('.J_Plane');
            var hotel = $('.J_Hotel');
            var planeList = [];
            var HotelList = [];
            //如果有从确定订单带过来飞机票
            if (plane) {
                this._.each(plane, function (order) {
                    var Plane = {};
                    Plane.price = $(order).find('input').val();
                    Plane.roundTripId = $(order).find('.J_ReimDocBtn').data('id');
                    planeList.push(Plane);
                });
            }
            //如果有从确定订单带过来的酒店
            if (hotel) {
                this._.each(hotel, function (order) {
                    var Hotel = {};
                    Hotel.tripHotelId = $(order).find('.J_HotelNum').data('triphotelid');
                    Hotel.amount = $(order).find('.J_Price').val();
                    HotelList.push(Hotel);
                });
            }
            //其他项
            var other = {
                remark: $('#J_ReimDocOtherContent').find('textarea').val(),
                overAmount: $('#J_ReimDocOtherContent').find('input').val()
            };
            var mt = [];//市交通费
            var nba = [];//补助
            this._.each(li, function (order) {//市交通费
                var traffic = {};
                traffic.tripPersonId = $(order).find('input').data('trippersonid');
                traffic.trafficAmount = $(order).find('input').val();
                mt.push(traffic);
            });
            this._.each(sub, function (order) {//补助
                var subsidy = {};
                subsidy.tripPersonId = $(order).find('input').data('trippersonid');
                subsidy.subsidyAmount = $(order).find('.J_price').text();
                subsidy.subsidyDays = $(order).find('input').val();
                subsidy.subsidyStandard = $(order).find('input').data('money');
                nba.push(subsidy);
            });
            var models = {
                nba: nba,
                mt: mt,
                planeList: planeList,
                HotelList: HotelList,
                other: other
            };
            return models;
        },
        //保存草稿
        saveDraft: function () {
            var models = this.getModel();
            var viewHelper = this.ViewHelper;
            var that = this.tripId;
            var other = models.other;
            if (other.remark == '' && other.overAmount != '' || other.remark != '' && other.overAmount == '') {
                viewHelper.showTips(false, '其他项内容必须全部填写');
            } else {
                if (Number($('#J_TotalAmount').text()) > 0) {
                    $.ajax({
                        type: 'post',
                        url: '/fcs/do/trip/json/ExpenseAccountInfo/saveTripExpenseAccountInfo',
                        data: {
                            tripId: that,
                            mt: JSON.stringify(models.mt),
                            nba: JSON.stringify(models.nba),
                            plane: JSON.stringify(models.planeList),
                            hotel: JSON.stringify(models.HotelList),
                            other: JSON.stringify(other)
                        },
                        dataType: 'json',
                        success: function (response) {
                            if (response.flag) {
                                var ReimDoc = require('../../model/ReimDoc');
                                $('#J_discription').find('.info-row-cont').text('');
                                $('#J_discription').addClass('fn-hide');
                                $('#J_overproof').addClass('fn-hide');
                                viewHelper.showTips(true, '保存成功');
                            } else {
                                if (response.result.message != null) {
                                    viewHelper.showTips(false, response.result.message);
                                } else {
                                    if ($('#J_overproof').hasClass('fn-hide')) {
                                        $('#J_discription').removeClass('fn-hide');
                                        $('#J_overproof').removeClass('fn-hide');
                                        $('#J_discription').find('.info-row-cont').html(response.result.p_message);
                                    } else {
                                        var text = $('#J_overproof').find('textarea').val();
                                        if (text != '' && text.length <= 20) {
                                            $.ajax({
                                                type: 'post',
                                                url: '/fcs/do/trip/json/ExpenseAccountInfo/saveTripExpenseAccountInfo',
                                                data: {
                                                    tripId: that,
                                                    mt: JSON.stringify(models.mt),
                                                    nba: JSON.stringify(models.nba),
                                                    plane: JSON.stringify(models.planeList),
                                                    hotel: JSON.stringify(models.HotelList),
                                                    other: JSON.stringify(models.other),
                                                    overproof: text
                                                },
                                                dataType: 'json',
                                                success: function (response) {
                                                    viewHelper.showTips(true, '超标保存成功');
                                                },
                                                error: function () {
                                                    viewHelper.showTips(false, '网络出错');
                                                }
                                            });
                                        } else {
                                            viewHelper.showTips(false, '超标说明不能为空');
                                        }
                                    }
                                }
                            }
                        },
                        error: function (Jxr) {
                            viewHelper.showTips(false, '网络错误，请重试');
                        }
                    });
                } else {
                    viewHelper.showTips(false, '总金额不能小于零');
                }
            }
        },
        //生成报销单
        createSingle: function () {
            if (this.blackUser.p_flag == 'N') {
                return;
            } else if (this.blackUser.p_flag == 'Y') {
                var that = this.tripId;
                var viewHelper = this.ViewHelper;
                var models = this.getModel();
                var other = models.other;
                if (other.remark == '' && other.overAmount != '' || other.remark != '' && other.overAmount == '') {
                    viewHelper.showTips(false, '其他项内容必须全部填写');
                } else {
                    if (Number($('#J_TotalAmount').text()) > 0) {
                        $.ajax({
                            type: 'post',
                            url: '/fcs/do/trip/json/ExpenseAccountInfo/saveTripExpenseAccountInfo',
                            data: {
                                tripId: that,
                                mt: JSON.stringify(models.mt),
                                nba: JSON.stringify(models.nba),
                                plane: JSON.stringify(models.planeList),
                                hotel: JSON.stringify(models.HotelList),
                                other: JSON.stringify(other)
                            },
                            dataType: 'json',
                            success: function (response) {
                                if (response.flag) {
                                    $('#J_discription').find('.info-row-cont').text('');
                                    $('#J_discription').addClass('fn-hide');
                                    $('#J_overproof').addClass('fn-hide');
                                    $('#J-tipMash').show();
                                } else {
                                    if (response.result.message != null) {
                                        viewHelper.showTips(false, response.result.message);
                                    } else {
                                        if ($('#J_overproof').hasClass('fn-hide')) {
                                            $('#J_discription').removeClass('fn-hide');
                                            $('#J_overproof').removeClass('fn-hide');
                                            if (response.result.p_message.indexOf('<br>')) {
                                                $('#J_discription').find('.info-row-cont').text(response.result.p_message.replace('<br>', "<br>"));
                                            } else {
                                                $('#J_discription').find('.info-row-cont').text(response.result.p_message);
                                            }
                                        } else {
                                            var text = $('#J_overproof').find('textarea').val();
                                            if (text != '' && text.length <= 20) {
                                                $.ajax({
                                                    type: 'post',
                                                    url: '/fcs/do/trip/json/ExpenseAccountInfo/saveTripExpenseAccountInfo',
                                                    data: {
                                                        tripId: that,
                                                        mt: JSON.stringify(models.mt),
                                                        nba: JSON.stringify(models.nba),
                                                        plane: JSON.stringify(models.planeList),
                                                        hotel: JSON.stringify(models.HotelList),
                                                        other: JSON.stringify(other),
                                                        overproof: text
                                                    },
                                                    success: function (response) {
                                                        $('#J-tipMash').show();
                                                    },
                                                    error: function (Jxhr) {
                                                        viewHelper.showTips(false, '网络错误，请重试');
                                                    }
                                                });
                                            } else {
                                                viewHelper.showTips(false, '超标说明不能为空');
                                            }
                                        }
                                    }
                                }
                            },
                            error: function (Jxr) {
                                viewHelper.showTips(false, '网络错误，请重试');
                            }
                        });
                    } else {
                        viewHelper.showTips(false, '总金额不能小于零');
                    }
                }
            }
        },
        //添加审批连
        renderEach: function () {
            var $content = this.$('#J_ShenpiContent');
            $content.append(this.getEachHtml());
        },
        //选择审批人
        selectShenpi: function (e) {
            var target = e.srcElement || e.target;
            if (target.nodeName.toLocaleLowerCase() === 'label') {
                this.approveChainId = $(target).data('approvechainid');
                this.deptBudgeteer = $(target).data('deptbudgeteer');
                this.deptBudgeteerUM = $(target).data('deptbudgeteerum');
                var value = $(target).text().trim();
                if (value.indexOf('-') != -1) {
                    var num = value.indexOf('-');
                    this.approvePerson = value.substring(0, num);
                } else {
                    this.approvePerson = value;
                }
                $(target).addClass('rdo-selected');
                $(target).parent().siblings().find('label').removeClass('rdo-selected');
            }
        },
        //显示审批连人
        getEachHtml: function () {
            var html_in = '',
                _that = this,
                shenpiModel = this.shenpiModel;
            shenpiModel.each(function (order, index) {
                var orderRecord = order.attributes;
                orderRecord.index = index;
                if (orderRecord) {
                    html_in += _that.shenpitpl(orderRecord);
                }
            });
            return html_in;
        },
        //点击取消隐藏审批连
        hideButton: function () {
            $('#J-tipMash').hide();
            $('#J-tipMash').find('label').removeClass('rdo-selected');
        },
        //点击确定跳转成功界面
        submitReim: function () {
            var viewHelper = this.ViewHelper;
            var router = this.appRouter;
            this.delegateEvents();
            var approveChainId = this.approveChainId;
            var deptBudgeteer = this.deptBudgeteer;
            var deptBudgeteerUM = this.deptBudgeteerUM;
            var approvePerson = this.approvePerson;
            var tripId = this.tripId;
            var allPrice = $('#J_TotalAmount').text();
            var TripInfo = {
                tripId: tripId,
                allPrice: allPrice,
                approveChainId: approveChainId,
                deptBudgeteerUM: deptBudgeteerUM,
                deptBudgeteer: deptBudgeteer,
                approvePerson: approvePerson
            };
            if (approveChainId == null || deptBudgeteerUM == null) {
                viewHelper.showTips(false, '请选择审批人');
            } else {
                $.ajax({
                    type: 'post',
                    url: '/fcs/do/trip/json/ExpenseAccountInfo/submitTripInfo',
                    data: {
                        tripinfo: JSON.stringify(TripInfo)
                    },
                    dataType: 'json',
                    success: function (response) {
                        if (response.flag) {
                            viewHelper.showTips(true, response.message);
                            var guid = response.result.guid;
                            window.localStorage.setItem('guid', guid);
                            router.reimNavigate('reim/add/select/success', true);
                        } else {
                            viewHelper.showTips(false, response.message);
                        }
                    },
                    error: function (xhr) {
                        viewHelper.showTips(false, '网络错误，请重试');
                    }
                });
            }
        },
        destroy: function () {
            this.remove();
            this.stopListening();
        }
    });
    return ReimDocView;
});

/**
 * Created by EX-HUANGLILING001 on 13-12-18.
 */
define(function (require) {
    var Backbone = require('backbone'),
        Handlebars = require('handlebars');
    var ReimAddHotelView = Backbone.View.extend({
        el: '#J_Container',
        events: {
            'tap #select-hotelCy': 'selectHotelCy',
            'tap #update-submit': 'updateSub',
            'tap #J_UpdateEvection': 'selectEvection',
            'tap #hotel-submit': 'hotelSub',
            'tap #J_addHotelEvection': 'addTraffer'
        },
        initialize: function (options) {
            this.appRouter = options.appRouter;
            this.headerView = options.headerView;
            var $ = Backbone.$;
            this._ = require('underscore');
            //获取模板
            this.AddHotelTemplate = Handlebars.compile($('#J_AddHotelTpl').html());
            this.UpdateHotelTemplate = Handlebars.compile($('#J_UpdateHotelTpl').html());
            //获得共享model
            this.addEvection = require('../../model/shareModels').addEvectionModel;
            this.addHotel = require('../../model/shareModels').addHotelModel;
            this.addEvection.on('num_Date', this._.bind(this.nameBack, this));
            this.viewHelper=require('../common/ViewHelper');
        },
        render: function () {
            var updateNum = this.addHotel.get('updateNum');//从修改数据进入
            if (!updateNum) {
                var html = this.AddHotelTemplate();
                this.$el.empty().append(html);
            } else {
                var html = this.UpdateHotelTemplate(updateNum);
                this.$el.empty().append(html);
            }
            var data = $('#J_UpdateEvection').data('inpeopelid');
            this.addEvection.set('dataEvection', data);
//            //添加日期组件
//           var ViewHelper = require('../common/ViewHelper');
//            ViewHelper.datepicker('#J_StartDate', '#J_EndDate');
        },
        //选择城市
        selectHotelCy: function () {
            this.innerHTML = $('#J_Container').html();
            this.appRouter.reimNavigate('reim/add/select/city3', true);
        },
        //city传回来
        selectHotelCityBack: function (cityNo) {
            this.$el.empty().append(this.innerHTML);
            this.$('#select-hotelCy').empty().html(cityNo);
        },
        //保存当前页面
        leave: function () {
            this.content = this.$el.html();
        },
        //选择出差人界面渲染
        selectEvection: function () {
            this.leave();
            this.headerView.showEvectionHeader();
            var StateView = require('../reimburse/rdchildren/ReimHotelEvectionView');
            if (!this.ReimHotelEvectionView) {
                this.ReimHotelEvectionView = new StateView({appRouter: this.appRouter, model: this.addEvection});
            }
            this.ReimHotelEvectionView.render();
        },
        //添加酒店进入出差人
        addTraffer: function () {
            this.selectEvection();
        },
        //时间格式化（用来进行加减）
        dateToTime:function(str,comer){
            var comer=comer||'/';
            var sarr=str.split(comer);
            var sstr='';
            for(var i=0;i<sarr.length;i++){
                sstr=sstr+String(sarr[i]);
            }
            return sstr;
        },
        //修改添加酒店项的提交
        updateSub: function () {
            var cityLevel='';
            var router = this.appRouter;
            var viewHelper=this.viewHelper;
            var that=this.addEvection;
            var name=$('#J_UpdateEvection').text();
            var hotelCity = $('#select-hotelCy').text();
            var amount = $('#priceName').val();
            var tripHotelId=$('#J_UpdateEvection').data('triphotelid');
            var startDate = $('#J_inDay').val();
            var endDate = $('#J_leaveDay').val();
            //比较选择时间
            var bdate=this.dateToTime(startDate,'-');
            var edate=this.dateToTime(endDate,'-');
            if(Number(edate)<Number(bdate)){
                viewHelper.showTips(false,'结束时间不能早于开始时间，请重新选择！');
            }
            //判断资料是否填写完整
            if (name != '' && startDate != '' && endDate != '' && hotelCity != '选择城市' && amount != '') {
                if (hotelCity == '北京' || hotelCity == '上海' || hotelCity == '广州' || hotelCity == '深圳') {
                    cityLevel = '一级';
                } else {
                    cityLevel = '二级';
                }
                if (!(/^(([1-9]\d*)|\d)(\.\d{1,2})?$/).test(amount.toString())) {
                    viewHelper.showTips(false, '金额格式不对，请重填');
                } else {
                    $.post('/fcs/do/trip/json/ExpenseAccountInfo/updateHotel', {
                        tripPersonIds: this.tripPeopleIds,
                        tripId: this.addEvection.get('tripId'),
                        hotelCity: hotelCity,
                        amount: amount,
                        tripHotelId: tripHotelId,
                        inDay: startDate,
                        leaveDay: endDate,
                        cityLevel: cityLevel
                    }, null, 'json').done(function (result) {
                            if (result.flag) {
                                viewHelper.showTips(true, '修改成功');
                                router.reimNavigate('reim/add/document/' + that.get('tripId'), true);
                            } else {
                                viewHelper.showTips(false, result.message);
                            }
                        }).fail(function (jqXHR) {
                            viewHelper.showTips(false, '网络异常');
                        });
                }
            } else {
                viewHelper.showTips(false, '资料填写不完整，请检查');
            }
        },
        //从添加酒店进入的提交
        hotelSub: function () {
            var cityLevel='';
            var router = this.appRouter;
            var that=this.addEvection;
            var viewHelper=this.viewHelper;
            var name=$('#J_UpdateEvection').text();
            var hotelCity = $('#select-hotel').text();
            var amount = $('#select-price').val();
            var startDate = $('#J_StartDate').val();
            var endDate = $('#J_EndDate').val();
            //比较选择时间
            var bdate=this.dateToTime(startDate,'-');
            var edate=this.dateToTime(endDate,'-');
            if (Number(edate) < Number(bdate)) {
                viewHelper.showTips(false, '结束时间不能早于开始时间，请重新选择！');
            }
            if (name != '' && startDate != '' && endDate != '' && hotelCity != '选择城市' && amount != '') {
                if (hotelCity == '北京' || hotelCity == '上海' || hotelCity == '广州' || hotelCity == '深圳') {
                    cityLevel = '一级';
                } else {
                    cityLevel = '二级';
                }
                if (!(/^(([1-9]\d*)|\d)(\.\d{1,2})?$/).test(amount.toString())) {
                    viewHelper.showTips(false, '金额格式不对，请重填');
                } else {
                    $.post('/fcs/do/trip/json/ExpenseAccountInfo/insertHotel', {
                        tripPersonIds: this.tripPeopleIds,
                        tripId: this.addEvection.get('tripId'),
                        hotelCity: hotelCity,
                        amount: amount,
                        inDay: startDate,
                        leaveDay: endDate,
                        cityLevel: cityLevel
                    }, null, 'json').done(function (result) {
                            if (result.flag) {
                                viewHelper.showTips(true, '添加成功');
                                router.reimNavigate('reim/add/document/' + that.get('tripId'), true);
                            } else {
                                viewHelper.showTips(false, result.message);
                            }
                        }).fail(function (jqXHR) {
                            viewHelper.showTips(false, '网络错误，请重试');
                        });
                }
            } else {
                viewHelper.showTips(false, '资料填写不完整，请检查');
            }
        },
        //回传出差人
        nameBack: function (nameval) {
            this.selectBack(".J_ReimName", nameval);
        },
        //处理回传信息
        selectBack: function (selector, value) {
            this.headerView.showAddHotelHeader();
            this.$el.empty().append(this.content);
            var id = '';
            var name = '';
            this._.each(value, function (order) {
                id += order.tripPersonIds.toString().concat(',');
                name += order.inPeopel.toString().concat(',');
            });
            this.tripPeopleIds = id.substring(0, id.length - 1);
            this.evection = name.substring(0, name.length - 1);
            this.$(selector).html(this.evection);
        },
        clear: function () {
            this.model.destroy();
        }
    });
    return ReimAddHotelView;
});

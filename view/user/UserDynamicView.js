/**
 * Created by EX-ZHONGYUBIN001 on 13-12-19.
 */
define(function (require) {
    var Backbone = require('backbone'),
        Handlebars = require('handlebars');
    var UserDynamicView = Backbone.View.extend({
        el: '#J_Container',
        global: window,
        events: {
            'tap #J_SendEnter': 'sendEnter',
            'tap #J_DynamicId': 'sendDynamic',
            'tap #J_SendCencel': 'sendCancel'
        },
        initialize: function (options) {
            var $ = Backbone.$;
            var _ = require('underscore');
            var UserNumber = require('../../model/UserInfo');
            this.numbermodel = UserNumber.userNumber;
            this.appRouter = options.appRouter;
            this.UserDynamic = Handlebars.compile($('#J_TipSendTpl').html());
            this.ViewHelper = require('../common/ViewHelper');
            this.listenTo(this.numbermodel, 'sync', _.bind(this.render, this));
        },
        render: function () {
            this.setElement('#J_Container', true);
            var number = this.numbermodel.attributes;
            var html = this.UserDynamic(number);
            this.$el.empty().append(html);
            this.$dynamicPd = this.$('#J_DynamicPd');
            this.$errorMsgEl = this.$('#J_ErrorTips');
        },
        fetchRecs: function () {
            this.numbermodel.fetch();
        },
        sendDynamic: function (event) {
            var that = this;
            var eTarget = event.target || event.srcElement;
            if (!$(eTarget).hasClass('J_Disabled')) {
                $.getJSON('/fcs/do/common/json/CreateDynamicPassword/band')
                .done(function (result) {
                    if (result.flag == true) {
                        that.hidden_code = result.result;
                        that.runTimer($(eTarget), 120);
                        window.localStorage.setItem('dcnameid',that.hidden_code);
                        that.ViewHelper.showTips(false, '获取验证码成功，请输入验证码');
                    } else {
                        that.ViewHelper.showTips(false, result.message);
                    }
                }).fail(function (jqXHR) {
                    that.ViewHelper.showTips(false, jqXHR.statusText);
                });
            }

        },
        runTimer: function (target, time) {
            var t = time, global = this.global;
            var start = new Date().getTime();
            var d = global.setInterval(function () {
                var current = new Date().getTime();
                var interval = Math.round((current - start)/1000);
                target.text((t - interval) + 's 后重发').addClass('J_Disabled');
                if (t < interval) {
                    target.text('发送验证码').removeClass('J_Disabled');
                    global.clearInterval(d);
                }
            }, 1000);
        },
        sendEnter: function () {
            var dynamic_code = this.$dynamicPd.val();
            var result = this.validateInput(dynamic_code);
            if (true === result.flag && window.localStorage.getItem('dcnameid')) {
                this.sendEpayNum(dynamic_code);
                window.localStorage.removeItem('dcnameid');
            } else if (false === result.flag ) {
               this.showError('验证码不能为空');
            } else if(!window.localStorage.getItem('dcnameid')){
               this.showError('请发送验证码');
            }
        },
        validateInput: function (dynamic_code) {
            if (!dynamic_code) {
                return {flag: false};
            } else {
                return {flag: true};
            }
        },
        //校验验证码
        sendEpayNum: function (dynamic_code) {
            var that = this;
            var EpayResult = '';
            $.ajax({
                type: 'GET',
                url: '/fcs/do/common/AuthAccess/getConfig',
                async: false,
                data: {
                    dynamicPasswordId: this.hidden_code,
                    dynamicPassword: dynamic_code
                },
                dataType: 'json',
                success: function (result) {
                    EpayResult = result;
                    that.goEpayNum(EpayResult);
                },
                error: function (jqXHR) {
                    that.showError('校验密码失败');
                }
            });
        },

        //显示错误信息
        showError: function (errorMsg) {
            this.$errorMsgEl.show();
            this.$errorMsgEl.addClass('register_error');
            this.$('#J_TipsContent').text(errorMsg);
            var that=this;
            var d = window.setTimeout(function(){
                that.$errorMsgEl.hide();
                window.clearTimeout(d);
            }, 2000);
        },
        //显示错误提示

        goEpayNum: function (EpayResult) {
            var EpayURL = EpayResult.result;
            var message = EpayResult.flag;
            if (message === true) {
                window.localStorage.removeItem('dcnameid');
                window.location.href = EpayURL;
                this.stopListening();
            }
        },
        sendCancel: function () {
            this.delegateEvents();
            window.localStorage.removeItem('dcnameid');
            this.appRouter.userNavigate('user/info', true) //历史记录回退
        }
    });
    return UserDynamicView;
});


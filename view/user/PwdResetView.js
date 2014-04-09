/**
 * 密码重置功能
 */
define(function (require) {
    var Backbone = require('backbone');
    var PwdModel = require('../../model/PwdModel');
    var PwdResetView = Backbone.View.extend({
        el: '#J_Container',
        model: PwdModel.pwdReset,
        global: window,
        SEND_INTERVAL: 120,
        events: {
            'blur #J_UmCode': 'checkUm',
            'blur #J_MobileNo': 'checkMobile',
            'blur #J_DynamicCode': 'checkDynamic',
            'blur #J_NewPwd': 'checkNew',
            'blur #J_NewPwd2': 'checkNew2',
            'tap #J_SendDynamic': 'sendDynamic',
            'tap #J_ResetSubmit': 'submitReset',
            'tap #J_ConfirmLogin': 'confirmLogin'
        },
        initialize: function (options) {
            this.appRouter = options.appRouter;
            this.loadingView = require('../shareViews').loadingView;
            this.listenTo(this.model, 'check_error', this.checkResult);
            this.listenTo(this.model, 'invalid', this.invalidResult);
            this.listenTo(this.model, 'send_ok', this.sendDyOk);
            this.listenTo(this.model, 'reset_ok', this.resetOk);
            this.listenTo(this.model, 'fail', this.showTips);//自定义操作失败
            this.listenTo(this.model, 'error', this.updateError);   //后台请求错误
        },
        render: function () {
            this.setElement('#J_Container', true);
            this.$el.empty().html($('#J_ResetPwdTpl').html());
            this.$userEl = this.$('#J_UmCode');
            this.$mobileNo = this.$('#J_MobileNo');
            this.$dynamicCodeEl = this.$('#J_DynamicCode');
            this.$new = this.$('#J_NewPwd');
            this.$new2 = this.$('#J_NewPwd2');
            this.$sendDynamic = this.$('#J_SendDynamic');
            this.$dynamicTips = this.$('#J_DynamicTips');   //发送验证码显示验证码输入提示
            this.$resetDoneTips = this.$('#J_TipsMash');
//            this.$reset = this.$('#J_ResetSubmit');
        },
        validByRegex: function (field, regex) {
            return regex.test(field);
        },
        checkResult: function (result) {
            this.showTips(result.flag, result.message);
        },
        invalidResult: function (model, errorMsg) {
            this.showTips(false, errorMsg);
        },
        resetOk: function (result) {
//            this.showTips(true, result);
            this.$resetDoneTips.show();
        },
        showTips: function (valid, message) {
            var tipsView = require('../shareViews').tipsView;
            if (valid) {
                tipsView.showSuccessTips(message);
            } else {
                tipsView.showErrorTips(message);
            }
        },
        updateError: function (model, jqXHR) {
            this.showTips(false, '网络不给力，错误信息：' + jqXHR.statusText);
        },
        //blur事件, 数据填入model, 并触发前后台校验
        checkUm: function () {
            this.model.checkUm(this.$userEl.val().toUpperCase());
        },
        checkMobile: function () {
            this.model.checkMobile(this.$mobileNo.val());
        },
        sendDyOk: function (model, message) {
            var mobileNo = this.$mobileNo.val();
            this.showTips(true, message);
            this.runTimer(model, this.$sendDynamic, this.SEND_INTERVAL, mobileNo);
        },
        runTimer: function (model, target, time, mobileNo) {
            var $dynamicTips = this.$dynamicTips,
                disabledClass = 'form-sent-check-press',
                t = time, global = this.global, start = new Date().getTime();
            $dynamicTips.text('请输入手机' + mobileNo + '收到的短信校验码').show();
            target.addClass(disabledClass);
            var d = global.setInterval(function () {
                var current = new Date().getTime();
                var interval = Math.round((current - start) / 1000);
                target.text((t - interval) + 's 后重发');
                if (t < interval) {
                    target.removeClass(disabledClass).text('发送验证码');
                    $dynamicTips.hide();
                    global.clearInterval(d);
                    model.set('send_ok', false);  //验证码过期
                }
            }, 1000);
        },
        checkDynamic: function () {
            this.model.checkDynamic(this.$dynamicCodeEl.val());
        },
        checkNew: function () {
            this.model.checkNew(this.$new.val());
        },
        checkNew2: function () {
            this.model.checkNew2(this.$new2.val());
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
        //点击按钮发送验证码
        sendDynamic: function () {
            var umName = this.$userEl.val().toUpperCase();
            var mobileNo = this.$mobileNo.val();
            var deferred = this.model.sendDynamic(umName, mobileNo);
            this.alwaysLoading(deferred);
        },
        submitReset: function () {
            var umName = this.$userEl.val().toUpperCase();
            var mobileNo = this.$mobileNo.val();
            var newPwd = this.$new.val();
            var newPwd2 = this.$new2.val();
            var dynamicPassword = this.$dynamicCodeEl.val();
            var options = {
                umName: umName,
                mobileNo: mobileNo,
                newPwd: newPwd,
                newPwd2: newPwd2,
                dynamicPassword: dynamicPassword
            };
            var deferred = this.model.resetPwd(options);
            this.alwaysLoading(deferred);
        },
        confirmLogin: function () {
            this.$resetDoneTips.hide();
            this.appRouter.navigate('user/login', true);
        }
    });
    return PwdResetView;
});
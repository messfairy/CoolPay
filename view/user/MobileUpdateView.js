define(function (require) {
    var Backbone = require('backbone'),
        Handlebars = require('handlebars');
    var MobileUpdateModel = require('../../model/MobileUpdateModel');
    var MobileUpdateView = Backbone.View.extend({
        el: '#J_Container',
        model: new MobileUpdateModel,
        global: window,
        SEND_INTERVAL: 120,
        template: Handlebars.compile($('#J_MobileUpdateTpl').html()),
        events: {
            'blur #J_LoginPwd': 'checkLoginPwd',
            'blur #J_NewMobile': 'checkMobile',
            'blur #J_DynamicCode': 'checkDynamic',
            'tap #J_SendDynamic': 'sendDynamic',
            'tap #J_UpdateMobile': 'submitUpdate',
            'tap #J_ConfirmLogin': 'confirmLogin',
            'tap #J_ConfirmUpdate': 'confirmUpdate',
            'tap #J_CancelUpdate': 'cancelUpdate'
        },
        initialize: function (options) {
            this.appRouter = options.appRouter;
            this.loadingView = require('../shareViews').loadingView;
            this.listenTo(this.model, 'check_error', this.checkResult);
            this.listenTo(this.model, 'rpc_error', this.checkResult);
            this.listenTo(this.model, 'invalid', this.invalidResult);
            this.listenTo(this.model, 'password_ok', this.pwdOk);
            this.listenTo(this.model, 'send_ok', this.sendDyOk);
            this.listenTo(this.model, 'update_ok', this.updateOk);
            this.listenTo(this.model, 'error', this.updateError);
        },
        render: function () {
            this.setElement('#J_Container', true);
            this.$el.html(this.template());
            this.$password = this.$('#J_LoginPwd');
            this.$newMobile = this.$('#J_NewMobile');
            this.$dynamicCodeEl = this.$('#J_DynamicCode');
            this.$sendDynamic = this.$('#J_SendDynamic');
            this.$dynamicTips = this.$('#J_DynamicTips');   //发送验证码显示验证码输入提示
            this.$updateDoneTips = this.$('#J_TipsMash');
            this.$pwdAuthDialog = this.$('#J_PwdAuthDialog');
        },
        checkLoginPwd: function(){
            this.model.checkLoginPwd(this.$password.val());
        },
        cancelUpdate: function(){
            this.$pwdAuthDialog.hide();
            this.appRouter.appNavigate('user/info', true);
        },
        checkMobile: function () {
            this.model.checkMobile(this.$newMobile.val());
        },
        checkDynamic: function () {
            this.model.checkDynamic(this.$dynamicCodeEl.val());
        },
        showTips: function (valid, message) {
            var tipsView = require('../shareViews').tipsView;
            if (valid) {
                tipsView.showSuccessTips(message);
            } else {
                tipsView.showErrorTips(message);
            }
        },
        validPassed: function (result) {
            this.model.set('dynamicPassword', this.$dynamicCodeEl.val());
            this.checkResult(result);
        },
        //请求密码后台校验
        confirmUpdate: function(){
            var deferred = this.model.requestLoginPwd(this.$password.val());
            this.alwaysLoading(deferred);
        },
        //点击按钮发送验证码
        sendDynamic: function () {
            var mobileNo = this.$newMobile.val();
            var deferred = this.model.sendDynamic(mobileNo);
            this.alwaysLoading(deferred);
        },
        submitUpdate: function(){
            var loginPwd = this.$password.val(),
                newMobile = this.$newMobile.val(),
                dynamicCode = this.$dynamicCodeEl.val();
            var deferred = this.model.updateMobile(loginPwd, newMobile, dynamicCode);
            this.alwaysLoading(deferred);
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
        checkResult: function (result) {
            this.showTips(result.flag, result.message);
        },
        invalidResult: function (model, errorMsg) {
            this.showTips(false, errorMsg);
        },
        pwdOk: function(model, message){
            this.$pwdAuthDialog.hide();
            this.showTips(true, message);
        },
        sendDyOk: function (model, message) {
            var mobileNo = this.$newMobile.val();
            this.runTimer(model, this.$sendDynamic, this.SEND_INTERVAL, mobileNo);
            this.showTips(true, message);
        },
        //更新结果
        updateOk: function (model, message) {
//            this.showTips(true, message);
            this.$updateDoneTips.show();
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
        confirmLogin: function () {
            this.$updateDoneTips.hide();
            this.appRouter.navigate('user/info', true);
        }
    });
    return MobileUpdateView;
});
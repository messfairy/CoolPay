define(function (require) {
    //backbone
    var Backbone = require('backbone'),
        _ = require('underscore'),
        Handlebars = require('handlebars');
    var RegisterView = Backbone.View.extend({
        el: '#J_Container',
        SEND_INTERVAL: 120,
        global: window,
        template: Handlebars.compile($('#J_RegisterTemplate').html()),
        events: {
            //每次blur优先执行前台校验，若有后台校验在前台执行之后再执行
            'blur #J_UserName': 'checkUm',
            'blur #J_Password': 'checkPwd',
            'blur #J_Password2': 'checkPwd2',
            'blur #J_PhoneNumber': 'checkMobile',
            'blur #J_DynamicCode': 'checkDynamic',

            'tap #J_SendDynamic': 'sendDynamic',
            'tap #J_RegisterSubmit': 'doRegister',
            'tap #J_Next': 'registerNext'
//            'tap #J_Cancel': 'cancel'
        },
        initialize: function (options) {
            this.appRouter = options.appRouter;
            this.loadingView = this.appRouter.loadingView;
            var RegUser = require('../../model/RegUser');
            this.model = new RegUser();
            this.model.on({
                //获取前端blur校验结果
                'invalid_um': this.showUmInvalid,
                'invalid_pwd': this.showPwdInvalid,
                'invalid_pwd2': this.showPwd2Invalid,
                'invalid_mobile': this.showMobileInvalid,
                'invalid_dynamic': this.showDynamicInvalid,
                //点击注册，请求前统一校验
                'invalid': this.validateError, //失败
                'valid': this.validatePassed,  //成功
                //获取后台远程方法调用结果
                'um_ok': this.showRpcUmOk,//UM号后台校验结果
//                'mobile_ok': this.showRpcResult,
                'mobile_ok': this.showRpcMobileOk,
                'send_ok': this.sendDyOk,
                'register_ok': this.registerOk,
                'rpc_error': this.showRpcResult
            }, this);
        },
        render: function () {
            this.setElement('#J_Container', true);
            var html = this.template();
            this.$el.empty().append(html);
            //渲染之后才能选择到
            this.$userEl = this.$("#J_UserName");
            this.$passwordEl = this.$("#J_Password");
            this.$passwordEl2 = this.$("#J_Password2");
            this.$phoneNumber = this.$("#J_PhoneNumber");
            this.$dynamicCodeEl = this.$("#J_DynamicCode");
            this.$registerOkTips = this.$('#J_RegisterOKTips');
            this.$sendDynamic = this.$('#J_SendDynamic');
            //校验ui标识
            this.$umCheck = this.$('#J_UMCheckFlag');
            this.$pwdCheck = this.$('#J_PwdCheckFlag');
            this.$pwd2Check = this.$('#J_Pwd2CheckFlag');
            this.$mobileCheck = this.$('#J_MobileCheckFlag');
            this.$dynamicCheck = this.$('#J_DynamicCheckFlag');
        },
        showRpcUmOk: function(attributes, result_flag){
            this.showCheck(this.$umCheck, result_flag);
            this.showRpcResult(attributes, result_flag);
        },
        showRpcMobileOk: function(attributes, result_flag){
            this.showCheck(this.$mobileCheck, result_flag);
            this.showRpcResult(attributes, result_flag);
        },
        showUmInvalid: function(result){
            var flag = result.flag;
            if(result.remove){
                this.showCheck(this.$umCheck, flag, result.remove);
            }else if(!flag){
                this.showCheck(this.$umCheck, flag, result.remove);
                this.showResult(result);//显示结果
            }
        },
        showPwdInvalid: function(result){
            this.validateShow(this.$pwdCheck, result);
        },
        showPwd2Invalid: function(result){
            this.validateShow(this.$pwd2Check, result);
        },
        showMobileInvalid: function(result){
            this.validateShow(this.$mobileCheck, result);
        },
        showDynamicInvalid: function(result){
            this.validateShow(this.$dynamicCheck, result);
        },
        validateShow: function($checkEl, result){
            var flag = result.flag;
            this.showCheck($checkEl, flag, result.remove);
            !flag&&this.showResult(result);//显示结果
        },
        showResult: function (result) {
            result.flag ? this.showSuccessTips(result.message) : this.showErrorTips(result.message);
        },
        showRpcResult: function (attributes, result_flag) {
            var message = result_flag ? attributes['success_msg'] : attributes['error_msg'];
            var result = {
                flag: result_flag,
                message: message
            };
            !result_flag&&this.showResult(result);
        },
        //显示校验ui标识
        showCheck: function($el, flag, remove){
            if(remove){ //remove则隐藏标识
                $el.hide();
            }else if(flag){
                $el.addClass('ipt-right-icon').show();
            }else{
                $el.removeClass('ipt-right-icon').show();
            }
        },
        //blur事件, 数据填入model, 并触发前后台校验
        checkUm: function () {
            this.model.checkUm(this.$userEl.val());
        },
        checkMobile: function () {
            this.model.checkMobile(this.$phoneNumber.val());
        },
        checkPwd: function () {
            this.model.checkPwd(this.$passwordEl.val());
        },
        checkPwd2: function () {
            this.model.checkPwd2(this.$passwordEl2.val());
        },
        checkDynamic: function () {
            this.model.checkDynamic(this.$dynamicCodeEl.val());
        },
        //点击发送按钮，发送验证码
        sendDynamic: function () {
            var businessId = this.$userEl.val();
            var receiverPhone = this.$phoneNumber.val();
            var deferred = this.model.sendDynamic(businessId, receiverPhone);
            this.alwaysLoading(deferred);//无论注册成功或者失败都隐藏loading
        },
        //============================显示model返回结果 start====================================
        sendDyOk: function (attributes, field_flag) {
            this.showRpcResult(attributes, field_flag);
            this.runTimer(this.model, this.$sendDynamic, this.SEND_INTERVAL);
        },
        //注册前统一校验显示结果
        validateError: function (model, message) {
            this.showErrorTips(message);
        },
        //model校验成功
        validatePassed: function () {
            this.showCheck(this.$umCheck, true);
            this.showCheck(this.$pwdCheck, true);
            this.showCheck(this.$pwd2Check, true);
            this.showCheck(this.$mobileCheck, true);
            this.showCheck(this.$dynamicCheck, true);
        },
        //注册成功返回
        registerOk: function (attributes, field_flag) {
            this.showRpcResult(attributes, field_flag);
            this.$registerOkTips.show(); //显示下一步提示
            if(!!this.d){
                this.global.clearInterval(this.d);
                var disabledClass = 'form-sent-check-press';
                this.$sendDynamic.removeClass(disabledClass).text('发送验证码');
            }
        },
        //继续注册
        registerNext: function () {
            this.model.clear();
            this.appRouter.userNavigate('/user/login', true);
        },
        //注册action
        doRegister: function () {
            var deferred = this.model.register({
                dynamicPassword: this.$dynamicCodeEl.val(),//动态验证码（验证码ID已经保存到model）
                phoneNumber: this.$phoneNumber.val(),//手机号
                password: this.$passwordEl.val(),//密码
                um: this.$userEl.val().toUpperCase()//UM号
            });
            //无论注册成功或者失败都隐藏loading
            this.alwaysLoading(deferred);
        },
        //提示信息
        showMsg: function (msg) {
            return this.$errorMsgEl.text(msg).show();
        },
        showTips: function (content, tips, message, valid) {
            this.$(content).html((valid ? '<i></i>' : '') + message);
            var $errorTips = this.$(tips).show();
            var global = this.global;
            var d = global.setTimeout(function () {
                $errorTips.hide();
                global.clearTimeout(d);
            }, 2000);
        },
        //显示错误提示
        showErrorTips: function (errorMsg) {
            this.showTips('#J_TipsContent', '#J_ErrorTips', errorMsg, false);
        },
        //显示合法提示
        showSuccessTips: function (message) {
            this.showTips('#J_SuccessContent', '#J_SuccessTips', message, true);
        },
        //============================检查结果 end==============================================
        //动态验证码获取计时器
        runTimer: function (model, target, time) {
            var t = time, global = this.global,
                disabledClass = 'form-sent-check-press',
                start = new Date().getTime();
            target.addClass(disabledClass);
            var d = this.d = global.setInterval(function () {
                var current = new Date().getTime();
                var interval = Math.round((current - start)/1000);
                target.text((t - interval) + 's 后重发');
                if (t < interval) {
                    target.removeClass(disabledClass).text('发送验证码');
                    global.clearInterval(d);
                    model.set('send_ok', false);  //验证码过期
                }
            }, 1000);
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
        registerNext: function () {
            this.appRouter.userNavigate('/user/login', true);
        },
        cancel: function () {
            this.$dynamicCodeEl.val('');
            this.$userEl.val('');
            this.$passwordEl.val('');
            this.$phoneNumber.val('');
            this.$dynamicCodeEl.val('');
        }
    });
    return RegisterView;
});
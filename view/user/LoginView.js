define(function (require) {
    var Backbone = require('backbone'),
        Handlebars = require('handlebars');
    var LoginView = Backbone.View.extend({
        el: '#J_Container',
        STORE_ID : 'LOGIN_USER',
        STORE_MODEL_ID : 'ANYONE',
        global: window,
        showPassword: false,
        template: Handlebars.compile(Backbone.$('#J_LoginTemplate').html()),
        events: {
            'blur #J_LoginName': 'checkLoginName',
            'blur #J_LoginPwd': 'checkLoginPwd',
            'tap #J_Remember': 'checkMemo',//勾选记住密码
            'tap #J_LoginSubmit': 'doLogin', //点击登录提交
            'tap #J_Cancel': 'cancel',  //取消，清空密码和用户名,
            'tap #J_ResetPwd': 'resetPwd',
            'tap #J_ShowPassword': 'showPwd'
        },
        initialize: function (options) {
            this.appRouter = options.appRouter;
            var shareViews = require('../shareViews');
            this.loadingView = shareViews.loadingView;
            this.LoginUser = require('../../model/LoginUser');
            this.model = new this.LoginUser; //实例化User
            this.model.on({
                'name_check': this.nameResult,
                'pwd_check': this.pwdResult,
                'request': this.requestOn,
                'invalid': this.validateError,  //model校验失败
                'valid': this.validatePassed,   //model校验通过
                'sync': this.loginDone,         //user登录请求成功，但可能有异常
                'error': this.loginError         //user登录失败
            }, this);
        },
        render: function () {
            this.setElement('#J_Container', true);
            var html = this.template();
            this.$el.empty().append(html);
            //获取视图内登录元素
            this.$userEl = this.$('#J_LoginName');
            this.$passwordEl = this.$('#J_LoginPwd');
            //this.$memoCheckEl = this.$('#J_MemoCheck');
            this.$showPwd = this.$('#J_ShowPassword');
            this.$nameCheck = this.$('#J_NameCheckFlag');
            if (this.isRemembered()) {
                this.fetchMemo();
            }
        },
        showPwd: function(){
            this.$showPwd.toggleClass('ipt-show-password-on');
            this.showPassword = !this.showPassword;
            if(this.showPassword){
                this.$passwordEl.attr('type', 'text');
            }else{
                this.$passwordEl.attr('type', 'password');
            }

        },
        checkLoginName: function(){
            this.model.checkMobile(this.$userEl.val());
        },
        checkLoginPwd: function(){
            this.model.checkPwd(this.$passwordEl.val());
        },
        nameResult: function(result){
            this.validateShow(this.$nameCheck, result);
        },
        pwdResult: function(result){
            !result.flag&&this.showResult(result);//显示结果
        },
        validateShow: function($checkEl, result){
            var flag = result.flag;
            this.showCheck($checkEl, flag, result.remove);
            !flag&&this.showResult(result);//显示结果
        },
        showResult: function (result) {
            result.flag ? this.showSuccessTips(result.message) : this.showErrorTips(result.message);
        },
        //显示错误提示
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
        //model校验成功
        validatePassed: function () {
            this.showCheck(this.$nameCheck, true);
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
        //model校验失败
        validateError: function (model, errorMsg) {
            this.showErrorTips(errorMsg);
        },
        //model请求成功
        loginDone: function (model) {
            this.loadingView.hide();
            if (model.get('login_result')) {
                //todo 判断是否需要保存密码，本地localSessionStorage保存用户名密码
                //本地localStorage保存密码
                if (this.isRemembered()) {
                    this.memoUser.save({
                        id: this.STORE_MODEL_ID,
                        j_username: model.get('j_username'),
                        j_password: model.get('j_password')
                    });
                }
                this.requestAirState();
            } else {
                this.showErrorTips('登录异常:' + model.get('error_msg'));
            }
        },
        requestAirState: function(){
            //登陆成功获取万里通机票状态
            var deferred = $.get('/fcs/do/trip/json/OrderStatus/ticketInfoStatus/');
            this.requestStateAlways(deferred);
        },
        //无论更新状态是否成功都跳转并隐藏loading
        requestStateAlways: function(deferred){
            if(!!deferred){
                this.loadingView.show();
                var that = this;
                deferred.always(function(){
                    that.loadingView.hide();
                    that.goHome();
                });
            }
        },
        goHome: function(){
            this.model.clear();
            this.appRouter.appNavigate('home', true);
        },
        //model登录失败，回显错误和错误码
        loginError: function (model, jqXHR) {
            this.loadingView.hide();
            var errorMsg = '网络不给力，请检查!', result;
            try{
                result = $.parseJSON(jqXHR.responseText);
                errorMsg = result['msg'];
            }catch (error){
                errorMsg = '未知错误！';
            }
            this.showErrorTips(errorMsg);
            console.log('状态码：' + jqXHR.status + '状态信息：' + jqXHR.statusText);
            if (403 === jqXHR.status) {
                this.model.clear();
                this.appRouter.userNavigate('/login/error', false);
            }
        },
        doLogin: function () {
            //设置登录名和密码并且登录
            this.model.doLogin(this.$userEl.val(), this.$passwordEl.val());
        },
        requestOn: function(){
            this.loadingView.show();
        },
        //清空用户名和密码
        cancel: function () {
            this.$userEl.val('');
            this.$passwordEl.val('');
        },
        //todo 判断是否需要记住密码 修改UI视图
        checkMemo: function (event) {
            var element = event.target || event.srcElement;
            this.remember = this.$(element).is(':checked');
            this.showSuccessTips(this.remember);
        },
        //todo 渲染前判断是否已经保存密码
        isRemembered: function () {
            return true;
        },
        //渲染本地记住的用户名和密码
        renderMemo:function(user, data){
            var j_username = data[0]?data[0]['j_username']:data[0];
            var j_password = data[0]?data[0]['j_password']:data[0];
            j_username && this.$userEl.val(j_username);
            j_password && this.$passwordEl.val(j_password);
            this.destoryMemo(user);
        },
        //获取用户名和密码
        fetchMemo: function () {
            //用来保存用户名和密码
            var LoginStore = require('localStorage');
            var memoUser = this.memoUser = new this.LoginUser;
            memoUser.localStorage = new LoginStore(this.STORE_ID);
            this.listenTo(memoUser, 'sync', this.renderMemo);
            memoUser.fetch({id: this.STORE_MODEL_ID});
        },
        //销毁记忆model
        destoryMemo: function(memoUser){
            memoUser.off();
            memoUser.destroy();
            delete memoUser;
        },
        //todo 删除本地记住的用户名和密码
        deleteMemo:function(){
            return false;
        },
        //点击忘记密码重置密码
        resetPwd: function(){
            this.appRouter.userNavigate('user/pwd/reset', true);
        },
        //发生路由跳转即销毁各自内存
        destory: function () {
            this.undelegateEvents();
            this.stopListening();
            this.model.off();
            delete this.$userEl;
            delete this.$passwordEl;
            delete this.model
            delete this;
        }
    });
    return LoginView;
});
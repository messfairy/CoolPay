/**
 *  用户处理路由器
 */
define(function (require) {
    var Backbone = require('backbone');
    var UserRouter = Backbone.Router.extend({
        routes: {
            'user/info': 'showUser',//显示用户信息
            'user/login': 'showLogin', //显示登录页面
            'user/loginout': 'showLogin', //登出之后显示登录页面
            'user/register': 'showRegister',
            'user/info/send': 'showSendDynamic',//点击绑定出现的验证码页面
            'user/pwd/update': 'showUpdatePwd',
            'user/pwd/reset': 'showResetPwd',
            'user/mobile/update': 'showUpdateMobile',
            'user/pwd/gesture': 'showChangeGesture'
        },
        initialize: function (options) {
            this.appRouter = options.appRouter; //获取主路由器引用
            var shareViews = require('../view/shareViews');
            this.headerView = shareViews.headerView;
            this.tipsView = shareViews.tipsView;

            //加载User模板
            var UserTpl = require('text!../template/User.hbs');
            var $ = Backbone.$;
            $('body').append(UserTpl);
        },
        //注册
        showRegister: function () {
            this.headerView.showRegister();
            var RegisterView = require('../view/user/RegisterView');
            if (!this.registerView) {
                this.registerView = new RegisterView({appRouter: this.appRouter});
            }
            this.registerView.render();
        },
        //登录
        showLogin: function () {
            if (!this.loginView) {
                var LoginView = require('../view/user/LoginView');
                this.loginView = new LoginView({appRouter: this.appRouter});
            }
            //登录之前强制登出
            var that = this;
            $.get('/fcs/do/common/json/Login/exit')
            .done(function () {
                that.headerView.showLogin();
                that.loginView.render();
            })
            .fail(function () {
                that.tipsView.showErrorTips('登出失败！');
            });
        },
        //显示用户信息
        showUser: function () {
            this.headerView.showUser();
            var UserInfoView = require('../view/user/UserInfoView');
            if (!this.userInfoView) {
                this.userInfoView = new UserInfoView({appRouter: this.appRouter});
            }
            this.userInfoView.render();
        },
        //显示修改密码
        showUpdatePwd: function () {
            var PwdUpdateView = require('../view/user/PwdUpdateView');
            if (!this.pwdUpdateView) {
                this.pwdUpdateView = new PwdUpdateView({appRouter: this.appRouter});
            }
            this.headerView.showUpdatePwd();
            this.pwdUpdateView.render();
        },
        //显示重置密码
        showResetPwd: function () {
            var PwdResetView = require('../view/user/PwdResetView');
            if (!this.pwdResetView) {
                this.pwdResetView = new PwdResetView({appRouter: this.appRouter});
            }
            this.headerView.showResetPwd();
            this.pwdResetView.render();
        },
        showUpdateMobile: function(){
            var MobileUpdateView = require('../view/user/MobileUpdateView');
            if (!this.mobileUpdateView) {
                this.mobileUpdateView = new MobileUpdateView({appRouter: this.appRouter});
            }
            this.headerView.showUpdateMobile();
            this.mobileUpdateView.render();
        },
        showSendDynamic: function () {
            var UserDynamicView = require('../view/user/UserDynamicView');
            if (!this.userDynameicView) {
                this.userDynameicView = new UserDynamicView({appRouter: this.appRouter});
            }
            this.userDynameicView.render();
            this.userDynameicView.fetchRecs();
        }

    });
    return UserRouter;
});
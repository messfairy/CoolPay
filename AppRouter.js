/**
 * 主路由器AppRouter
 * 路由器处理单页面导航
 * 处理主流程视图跳转逻辑
 * Backbone支持pjax无刷新跳转，故能较好支持单页面结构
 */
define(function (require) {
    var Backbone = require('backbone');
    Backbone.emulateHTTP = true; //全用post
    Backbone.emulateJSON = true; //全用json提交
    var AppRouter = Backbone.Router.extend({
        ajaxUrls: {
//===========================todo mock 本地mock数据========================
            checkAuthority: '/fcs/do/common/json/Login/check'
//===========================todo mock 本地mock数据========================

//===========================远程数据========================

//===========================远程数据========================
        },
        routes: {
            'home': 'showHome',  // 云报销首页
            'funcs/left': 'showFunctions', //显示通知消息
            'msg/cloud': 'showCloudMsg',//显示云消息
            'weather/detail': 'showWeather',//显示天气信息
            'dmzstg/air': 'buyAirTicket',
            'dmzstg/hotel': 'bookHotel',
            //测试同域名跳转
            'test/iframe/baidu': 'testIframe',
            'home/sick': 'homeSick'
        },
        //每次路由到指定路由前，判断是否有权限
        checkAuthority: function (hasAurthority) {
            var authorityUrl = this.ajaxUrls.checkAuthority;
            var that = this;
            $.getJSON(authorityUrl)
            .done(function (result) {
                if (result.code==='1') {
                    hasAurthority.call(that);
                } else {
                    that.showTips(false, result.msg);
                    that.userNavigate('user/login', true);
                }
            }).fail(function (jqXHR) {
                if (jqXHR.status === 403) {
                    that.showTips(false, '没有权限！');
                }else{
                    that.showTips(false, '请求失败，没有权限！');
                }
                that.userNavigate('user/login', true);
            });
        },
        initViews: function () {
            var shareViews = this.shareViews = require('./view/shareViews');
            this.loadingView = shareViews.loadingView;
            this.headerView = shareViews.headerView;
            this.tipsView = shareViews.tipsView;
            this.headerView.addRouter(this);
        },
        initialize: function () {
            //路由器初始化
            this._appendAppTpl(); //加载模板，append到html
            this.initViews();//渲染公共header loading视图
            var OrderRouter = require('./router/OrderRouter'),
                ReimRouter = require('./router/ReimRouter'),
                SelectorRouter = require('./router/SelectorRouter'),
                UserRouter = require('./router/UserRouter');
            this.orderRouter = new OrderRouter({headerView: this.headerView, appRouter: this});//订单路由器
            this.reimRouter = new ReimRouter({headerView: this.headerView, appRouter: this});//报销路由器
            this.selectorRouter = new SelectorRouter({headerView: this.headerView, appRouter: this});//用户选择路由器
            this.userRouter = new UserRouter({headerView: this.headerView, appRouter: this}); //用户路由器
            Backbone.history.start({pushState: true});//这里pushstate为true,使用html pjax处理单页面结构
        },
        //加载模板，append到index.html
        _appendAppTpl: function () {
            var headerTpl = require('text!./template/Header.hbs'),//加载Header模板
                AppTpl = require('text!./template/App.hbs');//加载App模板
            Backbone.$('body').append(headerTpl).append(AppTpl);
            //registerHelper Handlebars增强
            var ViewHelper = require('./view/common/ViewHelper');
            ViewHelper.registerHelper();
        },
        setSectionView: function(sectionView){
            this.sectionView = sectionView;
        },
        sectionViewOff: function () {
            this.sectionView && this.sectionView.leave();
            return this;
        },
        appNavigate: function (fragment, options) {
            this.checkAuthority(function(){
                return this.sectionViewOff().navigate(fragment, options);
            });
        },
        userNavigate: function (fragment, options) {
            //return this.sectionViewOff().userRouter.navigate(fragment, options);
            this.sectionViewOff();
            return this.userRouter.navigate(fragment, options);
        },
        orderNavigate: function (fragment, options) {
            this.checkAuthority(function(){
                return this.sectionViewOff().orderRouter.navigate(fragment, options);
            });
        },
        reimNavigate: function (fragment, options) {
            this.checkAuthority(function(){
                return this.sectionViewOff().reimRouter.navigate(fragment, options);
            });
        },
        selectorNavigate: function (fragment, options) {
            this.checkAuthority(function(){
                return this.sectionViewOff().selectorRouter.navigate(fragment, options);
            });
        },
        accquire: function (router) {
            return this[router];
        },
        //todo 测试iframe
        testIframe: function () {
            this.headerView.showIframe();
            var IframeView = require('./view/IframeView');
            new IframeView({locationUrl:'http://www.baidu.com/', loadingView: this.loadingView, appRouter: this});
        },
        homeSick: function () {
            this.showTips(false, 'home sick,我回来啦！');
            this.navigate('home', true);
        },
        //回到主页面
        showHome2: function () {
            //this.headerView.showHome();//渲染页面头
            var IndexView = require('./view/common/IndexView');
            if(!this.indexView){
                this.indexView = new IndexView({appRouter: this});
            }
            this.indexView.render();
        },
        showHome: function(){
            var CenterView = require('./view/common/CenterView');
            if(!this.indexView){
                this.indexView = new CenterView({appRouter: this});
            }
            this.indexView.render();
        },
        //显示云消息
        showCloudMsg: function () {
            var RightMsgView = require('./view/common/RightMsgView');
            if(!this.rightMsgView){
                this.rightMsgView = new RightMsgView({appRouter: this});
            }
            this.rightMsgView.render();
        },
        showFunctions: function(){
            var LeftFuncView = require('./view/common/LeftFuncView');
            if(!this.leftView){
                this.leftView = new LeftFuncView({appRouter: this});
            }
            this.leftView.render();
        },
        //显示通知消息
        showNotice: function () {
            this.headerView.showNotice();
            console.log('showNotice');
            this.showTips(false, '通知功能暂未开放！');
        },
        //显示天气信息
        showWeather: function () {
            console.log('showWeather');
            this.showTips(false, '用户信息暂未开放！');
        },
        //获取万里通跳转URL
        _getTokenUrl: function (redirectUrl, callback) {
            var that = this;
            this.rpcGet(redirectUrl, function (response) {
                if (response.flag) {
                    callback(response.result);
                } else {
                    that.showTips(false, response.message);
                }
            });
        },
        rpcGet: function (url, callback, view) {
            $.getJSON(url).done(callback).fail(function (jqXHR) {
                if (!!view) {
                    view.showErrorMsg(jqXHR);
                }
            });
        },
        renderIframe:function(tokenUrl){
//            this.headerView.clear();
            this.headerView.clear();
            var IframeView = require('./view/IframeView');
            new IframeView({
                loadingView: this.loadingView,
                locationUrl: tokenUrl,
                appRouter: this
            });
        },
        renderWanliTong:function(tokenUrl){
            window.location.href = tokenUrl;
        },
        //买机票
        buyAirTicket: function () {
            var ticketUrl = '/fcs/do/trip/json/TokenInfo/flight';
            var that = this;
            this._getTokenUrl(ticketUrl, function (tokenUrl) {
                //that.renderIframe(tokenUrl);
                that.renderWanliTong(tokenUrl);
            });
        },
        //订酒店
        bookHotel: function () {
            var hotelUrl = '/fcs/do/trip/json/TokenInfo/hotel';
            var that = this;
            this._getTokenUrl(hotelUrl, function (tokenUrl) {
                //that.renderIframe(tokenUrl);
                that.renderWanliTong(tokenUrl);
            });
        },
        //显示提示信息
        showTips: function (valid, message) {
            var tipsView = this.shareViews.tipsView;
            if (valid) {
                tipsView.showSuccessTips(message);
            } else {
                tipsView.showErrorTips(message);
            }
        }
    });
    return AppRouter;
});
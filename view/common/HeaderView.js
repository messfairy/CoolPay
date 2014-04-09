define(function (require) {
    var Backbone = require('backbone'),
        Handlebars = require('handlebars');
    //页面头View
    var HeaderView = Backbone.View.extend({
        el: '#top-bar',
        events: {
            'tap #J_Header': 'handlers',
            'tap #J_OrderList': 'goOrders',
            'tap #J_CloudMsg': 'goCloudMsg',
            'tap #J_Register': 'goRegister',
            'tap #J_Login': 'goLogin',
            'tap #J_ReimAddTool':'addTool',
            'tap #J_MenuLeft' : 'menuLeft',

            'tap #J-GoOrder' : 'goOrder',
            'tap .J_Search': 'goSearch',
            'tap .J_Home': 'goHome',
            'tap .J_Back': 'goBack',
            'tap .J_BackHome':'goHome',
            'tap .J_QueryState':'goQuery',
            'tap .J_goHome':'goFuncsLeft',
            'tap #J_Backhome':'backHome',
            'tap #J_Back':'backSx',
            'tap .J_TravelSubmit': 'changeTraveller',//出差人选择页面
            'tap .J_SelectorBack': 'selectorBack',
            'tap .J_TODO': 'todo'
        },
        initialize: function () {
            //编译Handlebars模板方法
            var $ = Backbone.$;
            this.RegisterHeader = Handlebars.compile($('#J_RegisterHeaderTpl').html());
            this.LoginHeader = Handlebars.compile($('#J_LoginHeaderTpl').html());
            this.UpdatePwdHeader = Handlebars.compile($('#J_UpdatePwdHeadTpl').html());
            this.ResetPwdHeader = Handlebars.compile($('#J_ResetPwdHeadTpl').html());
            this.UpdateMobileHeader = Handlebars.compile($('#J_MobileUpdateHeadTpl').html());

            this.HomeHeader = Handlebars.compile($('#J_HomeHeaderTpl').html());
            this.OrdersHeader = Handlebars.compile($('#J_OrdersHeaderTpl').html());
            this.DetailsHeader = Handlebars.compile($('#J_OrderTopTpl').html());
            this.SearchHeader = Handlebars.compile($('#J_SearchHeaderTpl').html());
            this.ReimOrdersHeader = Handlebars.compile($('#J_ReimOrderTpl').html());
            this.UserInfoheader=Handlebars.compile($('#J_SettingTopTpl').html());
            this.ReimDocHeader=Handlebars.compile($('#J_ReimDocTopTpl').html());
            this.ShowIframe=Handlebars.compile($('#J_IframeBaiduTpl').html());
            this.AddTrafficHeader=Handlebars.compile($('#J_AddTrafficTopTpl').html());
            this.AddHotelHeader=Handlebars.compile($('#J_AddHotelTopTpl').html());

            this.SelectCityHeader=Handlebars.compile($('#J_SelectCityTopTpl').html());
            //选择项头模板
            this.BooksetHeader=Handlebars.compile($('#J_BooksetHeadTpl').html());
            this.TravellerHeader = Handlebars.compile($('#J_TravelSelTpl').html());
            this.EvectionHeader=Handlebars.compile($('#J_TravellerSelTpl2').html());
            this.PayeeHeader=Handlebars.compile($('#J_PayeeHeadTpl').html());
            this.DepHeader=Handlebars.compile($('#J_DepHeadTpl').html());

            //查询报销单头模板
            this.ReimQueryHeader=Handlebars.compile($('#J_QueryReimTpl').html());
            this.RQshaixuanHeader=Handlebars.compile($('#J_ReimSearchHeaderTpl').html());
            this.ReimTripstateTpl=Handlebars.compile($('#J_ReimTripstateTpl').html());
            this.ReimpayeNameTpl=Handlebars.compile($('#J_ReimpayeNameTpl').html())
//            this.EpayNumHeader=Handlebars.compile($('#J_EpayNumTpl').html());
            this.ReimSuccessHeader=Handlebars.compile($('#J_ReimDocSuccessTpl').html());
        },
        addRouter:function(appRouter){
            this.appRouter = appRouter;
        },
        render: function (headerType) {
            var html = this[headerType]();//获取模板
            //进入首页后出来，单例view必须重新设置container，不然backbone无法为container添加事件
            this.setElement('#top-bar', true);
            this.$el.empty().append(html).show();
            return this;
        },
        changeTitle:function(title){
            this.$el.find('h1').text(title);
        },
        clear:function(){
            this.$el = $('#top-bar');
            this.$el.empty().hide();
            return this;
        },
        handlers: function () {
            var id = $(this).attr('id');
            if ('J_Search' === id) {
                this.goSearch();
            } else if ('J_Menu' === id) {
                this.goSearch();
            }
        },
        showIframe:function(){
            this.render('ShowIframe');
        },
        //显示用户信息头
        showUser: function () {
            this.render('UserInfoheader');
        },
        //显示订单头
        showOrders: function () {
            this.render('OrdersHeader');
        },
        //显示订单详情头
        showDetails: function () {
            this.render('DetailsHeader');
        },
        //显示云报销头
        showHome: function () {
            this.render('HomeHeader');
        },
        //显示查询头
        showSearch: function () {
            this.render('SearchHeader');
        },
        //可报销订单查询
        showReimOrders: function () {
            this.render('ReimOrdersHeader');
        },
        //登录 注册 密码修改
        showLogin: function () {
            this.render('LoginHeader');
        },
        showRegister: function () {
            this.render('RegisterHeader');
        },
        showUpdatePwd: function () {
            this.render('UpdatePwdHeader');
        },
        showResetPwd: function () {
            this.render('ResetPwdHeader');
        },
        showUpdateMobile: function(){
            this.render('UpdateMobileHeader');
        },
        //显示报销明细头
        showReimDocHead:function(reimDocView){
            this.reimDocView = reimDocView;
            this.render('ReimDocHeader');
        },
        //显示申请成功头部
        showReimSuccessHeader:function(){
            this.render('ReimSuccessHeader');
        },
        //显示添加交通工具头部
        showAddTrafficHeader:function(){
            this.render('AddTrafficHeader');
        },
        //显示添加酒店头部
        showAddHotelHeader:function(){
            this.render('AddHotelHeader');
        },
        //显示选择城市头部
        showSelectCityHeader:function(){
            this.render('SelectCityHeader');
        },
        //显示查询报销的头部
        showSearchReim:function(){
            this.render('ReimQueryHeader');
        },
        //查询报销筛选头部
        showQueryReim:function(){
            this.render('RQshaixuanHeader')
        },
        showTripstate:function(){
            this.render('ReimTripstateTpl');
        },
        showPayName:function(){
            this.render('ReimpayeNameTpl');
        },
        showTravellerHeader:function(travellerView){
            this.travellerView = travellerView;
            this.render('TravellerHeader');
        },
        showEvectionHeader:function(){
            this.render('EvectionHeader');
        },
        showBooksetHeader:function(){
            this.render('BooksetHeader');
        },
        showPayeeHeader:function(){
            this.render('PayeeHeader');
        },
        showDepHeader:function(){
            this.render('DepHeader');
        },
        //显示跳转平安付头部渲染
//        showEpayNumHeader:function(){
//            this.render('EpayNumHeader');
//        },
        //选中出差人点确定
        changeTraveller:function(){
            this.travellerView.selectTraveller();
        },
        //报销单头信息选择页面head返回触发
        selectorBack: function(){
            var selectModel = require('../../model/SelectorModel').selectModel;
            selectModel.trigger('back_headInfo');
        },
        //单页面显示提示信息
        todo: function(){
            alert('暂不支持返回！');
        },
        menuLeft:function(){
            this.showHome();
            var subHomeViews = require('./subHomeViews');
            subHomeViews.leftMenuView.render();
        },
        goCloudMsg: function () {
//            this.showHome();
//            var subHomeViews = require('./subHomeViews');
//            subHomeViews.messageView.render();
            this.appRouter.appNavigate('msg/cloud', true);
        },
        //显示home
        goHome: function () {
            this.appRouter.appNavigate('home', true);
        },
        //显示上一步 todo 用变量保存上一步的路由还是到appRouter中选择路由？
        goBack: function () {
            this.trigger('back');
            window.history.go(-1); //历史记录回退
        },
        //显示list
        goOrders: function () {
            this.appRouter.orderNavigate('order/list', true);
        },

        //显示search
        goSearch: function () {
            this.appRouter.orderNavigate('order/list/search', true);
        },
        // 跳转到筛选页面
        goQuery:function(){
            this.delegateEvents();
            var model = require('../../model/shareModels')
            var filterModel=model.filterModel;
            filterModel.clear();
            this.appRouter.reimNavigate('reim/query/shaixuan',true);
        },
        //跳转到确定订单页面
        addTool:function(){
            //增加机票项订单
            var tripId = this.reimDocView.tripId;
            this.appRouter.reimNavigate('reim/add/orders/other/' + tripId,true);
        },
        goLogin: function(){
            this.appRouter.userNavigate('user/login', true);
        },

        goRegister: function () {
            this.appRouter.userNavigate('user/register', true);
        },
        backSx:function(){
            window.localStorage.removeItem('ifPage');
            this.delegateEvents();
            this.appRouter.reimNavigate('reim/query',true);
        },
        backHome:function(){
            window.localStorage.removeItem('ifPage');
            this.delegateEvents();
            this.appRouter.appNavigate('home', true);
        },
        goFuncsLeft: function(){
            this.delegateEvents();
            this.appRouter.appNavigate('funcs/left', true);
        },
        goOrder:function(){
            this.delegateEvents();
            this.appRouter.orderNavigate('order/list',true);
        }
    });
    return HeaderView;
});
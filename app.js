define(function (require) {
    var $ = require('zepto');
    //引入zepto增强模块
    require('selector')($);
    require('callbacks')($);
    require('deferred')($);
    require('ajax')($);
    require('touch')($);
    var AppRouter = require('./AppRouter');
    var appRouter = new AppRouter;
    //根据登录情况，导航不同页面
    $.getJSON('/fcs/do/common/json/Login/check')
    .done(function (result) {
        if (result.code === '1') {
            var routeName = window.location.hash.substr(1);
            if (!!routeName) {
                appRouter.appNavigate(routeName, true);
            } else {
                appRouter.appNavigate('home', true);//默认导航到主页面
            }
        } else {
            console.log(result.msg);
            appRouter.userNavigate('user/login', true);//无权限状态，导航到登录页面
        }
    }).fail(function (jqXHR) {
        appRouter.userNavigate('user/login', true);//默认导航到登录页面
    });

});
/**
 * Created by EX-HUANGLILING001 on 13-12-18.
 */
define(function(require){
    var Backbone = require('backbone'),
        Handlebars = require('handlebars');
    var SelectCityView=Backbone.View.extend({
        el:'#J_Container',

        events:{
            //事件
            'tap .citying':'selectCity'
        },
        initialize:function(options){
            this.appRouter = options.appRouter;
            this.model = options.model;
            this.flag = options.flag;
            var $ = Backbone.$;
            this._ = require('underscore');
            this.SelectCityTplTemplate=Handlebars.compile($('#J_SelectCityTpl').html());
            this.render();
        },
        render:function(){
            var html = this.SelectCityTplTemplate();
            //todo mock
            this.$el.empty().append(html);
        },
        //选择城市
        selectCity:function(evt){
            var target = evt.srcElement||evt.target;
            var $target = $(target);
            var cityNo = $target.text();//得到城市页面的值
            //把页面的值导航回交通页面
            this.appRouter.reimNavigate('reim/add/select/other/'+this.flag+'/'+cityNo, true);
            this.appRouter.reimNavigate('reim/add/select/hotel/back/'+cityNo, true);
        },
        clear: function() {
            this.model.destroy();
        }
    });
    return SelectCityView;
});

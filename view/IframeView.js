define(function(require){
    var Backbone = require('backbone'),
        Handlebars = require('handlebars');
    //查询视图
    var IframeView = Backbone.View.extend({
        el:'#J_Container',
        template:Handlebars.compile($('#J_DomainIframeTpl').html()),
        event:{
          'load #J_DomainIframe':'loadReady'
        },
        initialize:function(options){
            this.loadingView = options.loadingView;
            this.locationUrl = options.locationUrl;
            window.appRouter = this.appRouter = options.appRouter;
            this.render();
        },
        render:function(){
            this.$el.empty().append(this.template());
            var iframe = this.$('#J_DomainIframe');
            this.loadingView.show();
            iframe.prop('src', this.locationUrl);
//            iframe.prop('src', 'http://www.baidu.com/');
//            iframe.prop('src', '/fcs/mobile/test_callback.html');
//            Backbone.$(this.$('iframe')[0].contentWindow).load(function(){
//                alert('ready');
//            });
            var _ = require('underscore');
            iframe.on('load', _.bind(this.loadReady, this));
        },
        loadReady:function(){
            this.loadingView.hide();
        }
    });
    return IframeView;
});
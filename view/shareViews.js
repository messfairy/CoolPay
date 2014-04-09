define(function (require, exports) {

    var Backbone = require('backbone'),
        Handlebars = require('handlebars');
    //loading视图
    var LoadingView = Backbone.View.extend({
        el: '#J_Container',
        $body: $('body'),
        template: Handlebars.compile($('#J_LoadingTemplate').html()),
        initialize: function () {
            this.render();
        },
        render: function () {
            this.$body.append(this.template());
        },
        show: function () {
            this.$body.addClass('bg-7a7a7a');
            $('#J_LoadingMash').show();
        },
        hide: function () {
            this.$body.removeClass('bg-7a7a7a');
            $('#J_LoadingMash').hide();
        }
    });
    exports.loadingView = new LoadingView();
    //header视图
    var HeaderView = require('./common/HeaderView');
    exports.headerView = new HeaderView();
    //selector视图
    var SelectorView = Backbone.View.extend({
        el: '#J_ShareContainer',
        events: {
            'tap .J_StateSelect': 'selectPayee'
        },
        initialize: function (options) {
            this.collection = options.collection;
            var tplSelector = options.tplSelector;
            this.template = Handlebars.compile($(tplSelector).html()),
                this.selectModel = options.selectModel;
            this.appRouter = options.appRouter;
        },
        render: function () {
            var dataArray = this.collection.map(function (model) {
                return model.attributes;
            });
            this.$el.empty().append(this.template(dataArray));
        },
        selectPayee: function (event) {
            var eTarget = event.target || event.srcElement;
            var payeeNo = $(eTarget).attr('data-value'); //收款人UM号码
            this.model.set('payeeNo', payeeNo).trigger('payee_select', payeeNo);
            this.hide();
        },
        show: function () {
            this.listenTo(this.collection, 'sync', this.render);
            this.collection.fetch();
            this.$el.show();
        },
        hide: function () {
            this.$el.hide();
            this.stopListening();
        }
    });
    exports.SelectorView = SelectorView;

    var MsgTipsView = Backbone.View.extend({
        el: '#J_MessageTips',
        template: Handlebars.compile($('#J_MsgTipsTpl').html()),
        initialize: function () {
            this.global = window;
            this.render();
        },
        render: function () {
            $('body').append(this.template());
        },
        showTips: function (content, tips, message, valid) {
            $(content).html((valid ? '<i></i>' : '') + message);
            var $errorTips = $(tips).show();
            var global = this.global;
            var d = global.setTimeout(function () {
                $errorTips.hide();
                global.clearTimeout(d);
            }, 3000);
        },
        //显示错误提示
        showErrorTips: function (errorMsg) {
            this.showTips('#J_TipsContent', '#J_ErrorTips', errorMsg, false);
        },
        //显示成功提示
        showSuccessTips: function (message) {
            this.showTips('#J_SuccessContent', '#J_SuccessTips', message, true);
        }
    });
    exports.tipsView = new MsgTipsView;
    var ContainerView = Backbone.View.extend({
        el: '#warp',
        template: Handlebars.compile($('#J_ContainerTpl').html()),
        initialize: function () {
            this.render();
        },
        render: function () {
            this.content = this.template();
            this.$el.empty().html(this.content);
        },
        restore: function(){
            this.setElement('#warp', true);
            $('body').removeClass('bg-233143');
            this.$el.empty().html(this.content);//恢复原状
        }
    });
    exports.containerView = new ContainerView;
});
/**
 * 选择收款人
 */
define(function (require) {
    var Backbone = require('backbone'),
        Handlebars = require('handlebars'),
        PayeeSelectModels = require('../../../model/SelectorModel').PayeeSelectModels,
        PayeeSearchModels = require('../../../model/SelectorModel').PayeeSearchModels;
    var PayeeView = Backbone.View.extend({
        el: '#J_Container',
        template: Handlebars.compile($('#J_PayeeTpl').html()),
        iTemplate: Handlebars.compile($('#J_PayeeItemTpl').html()),
        events: {
            'focus #J_SearchInput': 'openSearch',
            'tap #J_SearchCancel': 'closeSearch',
            'keydown #J_SearchInput': 'enterSearch',
            'blur #J_SearchInput': 'closeResult',
            'tap #J_ClearTxt': 'clearText',
            'tap .J_PayeeItem': 'selectPayee'
        },
        initialize: function (options) {
            this.model = options.model;
            this.appRouter = options.appRouter;
            var shareViews = require('../../shareViews');
            this.loadingView = shareViews.loadingView;
            this.tipsView = shareViews.tipsView;
            this.selectModels = new PayeeSelectModels;
            this.searchModels = new PayeeSearchModels;
            this.listenTo(this.selectModels, 'sync', this.renderCommon);
            this.listenTo(this.selectModels, 'no_um', this.showTips);
            this.listenTo(this.searchModels, 'sync', this.renderSearch);
            this.listenTo(this.searchModels, 'no_um', this.showTips)
        },
        showTips: function (valid, message) {
            var tipsView = this.tipsView;
            if (valid) {
                tipsView.showSuccessTips(message);
            } else {
                tipsView.showErrorTips(message);
            }
        },
        render: function () {
            this.setElement('#J_Container', true);
            this.$el.empty().append(this.template());
            this.$searchInput = this.$('#J_SearchInput');
            this.$clearTxt = this.$('#J_ClearTxt');
            this.$searchResult = this.$('#J_SearchResult');
            this.$searchLayout = this.$('#J_SearchLayout');
            this.$content = this.$('#content');
        },
        renderItems: function (dataArray) {
            return this.iTemplate(dataArray);
        },
        fetchPayee: function (tripId) {
            this.render();
            var deferred =  this.selectModels.select(tripId);
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
        renderCommon: function (models) {
            var dataArray = models.toJSON();
            var selectItem = this.renderItems(dataArray);
            this.$('#J_PayeeCommonList').html(selectItem);
            return this;
        },
        renderSearch: function (models) {
            var dataArray = models.toJSON();
            var searchItem = this.renderItems(dataArray);
            this.$('#J_PayeeSearchList').html(searchItem);
            this.openResult();
            this.selectModels.add(dataArray);  //id不同的才会拼到一起
            return this;
        },
        //打开搜索，隐藏原列表
        openSearch: function () {
            this.$searchLayout.removeClass('search-btn-no');
            this.$content.hide();
        },
        //取消，显示原列表
        closeSearch: function () {
            this.$searchLayout.addClass('search-btn-no');
            this.$content.show();
            this.$searchResult.addClass('fn-hide');
            this.clearText();
        },
        //回车弹出搜索结果
        openResult: function () {
            this.$clearTxt.show(); //清除按钮显示
            this.$searchResult.removeClass('fn-hide'); //显示搜索
            this.$content.hide();
        },
        //隐藏搜索结果隐藏
        closeResult: function () {
            this.$clearTxt.hide(); //清除按钮隐藏
            this.$searchResult.addClass('fn-hide'); //显示搜索
            this.$content.show();
        },
        //回车进入搜索
        enterSearch: function (evt) {
            var keyCode = evt.keyCode ? evt.keyCode : (evt.which ? evt.which : evt.charCode);
            if (keyCode == 13) {
                //搜索事件
                var umAccount = this.$searchInput.val().toUpperCase();
                this.searchModels.search(umAccount);
            }
        },
        //清除输入框
        clearText: function () {
            this.$clearTxt.hide(); //清除按钮隐藏
            this.$searchInput.val('');
        },
        //选中收款人
        selectPayee: function (event) {
            var eTarget = event.currentTarget;
            var payeeUm = $(eTarget).attr('data-value'); //收款人UM号码
            var payeeModel = this.selectModels.get(payeeUm);
            var payeeName = payeeModel.get('payeName');
            var payeeENo = payeeModel.get('payeeENo');
            var employeeNo = payeeModel.get('employeeNo'); //收款人employeeNo工号
            this.undelegateEvents(); //解绑事件
            if(!payeeENo){
                this.model.trigger('select_error','被选中收款人'+payeeUm+'e钱包帐户为空！');
            }
            if(!employeeNo){
                this.model.trigger('select_error','被选中收款人'+payeeUm+'员工号为空！');
            }
            this.model.set({payeName:payeeName, payeeUm: payeeUm, payeeENo: payeeENo, employeeNo: employeeNo})
            .trigger('payee_select', payeeName, payeeUm, payeeENo, employeeNo);
        }
    });
    return PayeeView;
});
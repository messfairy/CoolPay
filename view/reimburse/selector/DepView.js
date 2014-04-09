/**
 * 选择部门
 */
define(function (require) {
    var Backbone = require('backbone'),
        _ = require('underscore'),
        Handlebars = require('handlebars');
    var DepView = Backbone.View.extend({
        el: '#J_Container',
        template: Handlebars.compile($('#J_DepSelectTpl').html()),
        iTemplate: Handlebars.compile($('#J_DepItemTpl').html()),
        PAGE_SIZE: 10,
        PAGE_NO: 1,
        events: {
            'tap .J_DepItem': 'selectDep',
            'keydown #J_DepInput': 'searchDep',
            'focus #J_DepInput': 'openSearch',
            'tap #J_LoadMore': 'loadMore',
            'tap #J_SearchCancel': 'closeSearch',
            'tap #J_ClearTxt': 'clearText'
        },
        initialize: function (options) {
            var shareViews = require('../../shareViews');
            this.loadingView = shareViews.loadingView;
            this.tipsView = shareViews.tipsView;
            this.model = options.model;
            this.appRouter = options.appRouter;
            var CommonDepModels = require('../../../model/SelectorModel').CommonDepModels;
            var SearchDepModels = require('../../../model/SelectorModel').SearchDepModels;
            this.commonModels = new CommonDepModels;
            this.searchModels = new SearchDepModels;
            this.listenTo(this.commonModels, 'sync', this.renderCommon);
            this.listenTo(this.commonModels, 'fetch_fail', this.showErrorTips);
            this.listenTo(this.searchModels, 'sync', this.renderSearch);
            this.listenTo(this.searchModels, 'fetch_fail', this.showErrorTips);
        },
        render: function () {
            this.setElement('#J_Container', true);
            this.$el.empty().append(this.template());
            this.$searchInput = this.$('#J_DepInput');
            this.$clearTxt = this.$('#J_ClearTxt');
            this.$searchLayout = this.$('#J_SearchLayout');
            this.$content = this.$('#content'); //出差人选择区域
            this.$searchResult = this.$('#J_SearchResult');
        },
        renderInfo: function (models) {
            return this.iTemplate(models.toJSON());
        },
        renderSearchInfo: function (models) {
            var dataArray = models.map(function (model) {
                return {segment3: model.get('segment_value'), segment3Desc: model.get('segment_desc')};
            });
            if (dataArray.length === 0) {
                this.tipsView.showErrorTips('没有搜索到该部门！');
                return '';
            } else {
                return this.iTemplate(dataArray);
            }
        },
        renderCommon: function (models) {
            $('#J_UsualDepList').html(this.renderInfo(models));
            return this;
        },
        renderSearch: function (models) {
            this.openResult();
            $('#J_DepList').html(this.renderSearchInfo(models));
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
            this.$searchResult.addClass('fn-hide');
            this.clearText();
            this.$content.show();
        },
        //回车弹出搜索结果
        openResult: function () {
            this.$clearTxt.show(); //清除按钮显示
            this.$searchResult.removeClass('fn-hide'); //显示搜索
            this.$content.hide(); //常用部门区域隐藏
        },
        //隐藏搜索结果隐藏
        closeResult: function () {
            this.$clearTxt.hide(); //清除按钮隐藏
            this.$searchResult.addClass('fn-hide'); //显示搜索
            this.$content.show();
        },
        //清除输入框
        clearText: function () {
            this.$clearTxt.hide(); //清除按钮隐藏
            this.$searchInput.val('');
        },
        //获取常用部门
        fetchCommon: function (setOfBooksId) {
            this.render();
            this.setOfBooksId = setOfBooksId;
            this.commonModels.fetchCommon();
        },
        //回车事件触发查询匹配部门
        searchDep: function (evt) {
            var keyCode = evt.keyCode ? evt.keyCode : (evt.which ? evt.which : evt.charCode);
            this.PAGE_NO = 1;
            if (keyCode == 13) {
                this.fetchSearch(this.PAGE_NO, this.PAGE_SIZE); //搜索部门
            }
        },
        //加载更多部门
        loadMore: function () {
            this.fetchSearch(++this.PAGE_NO, this.PAGE_SIZE);
        },
        //分页加载部门信息
        fetchSearch: function (pageNo, pageSize) {
            var segment_value = this.$searchInput.val();
            var deferred = this.searchModels.searchDep(this.setOfBooksId, segment_value, pageNo, pageSize);
            if (!!deferred) {
                this.loadingView.show();
                deferred.always(_.bind(this.hideLoading, this));
            }
        },
        hideLoading: function () {
            this.loadingView.hide();
        },
        selectDep: function (event) {
            var eTarget = event.target || event.srcElement;
            var depId = $(eTarget).attr('data-value'); //部门Id
            var depName = $(eTarget).text();
            this.model.set({segment3: depId, segment3Desc: depName})
                .trigger('department_select', depName, depId);
        },
        leave: function () {
            this.content = this.$el.html();
            this.undelegateEvents();
        }
    });
    return DepView;
});
/**
 * 选择出差人
 */
define(function (require) {
    var Backbone = require('backbone'),
        Handlebars = require('handlebars'),
        _ = require('underscore'),
        TrItemView = require('./TrItemView'),
        SelectorModel = require('../../../model/SelectorModel'),
        TrModels = SelectorModel.TrModels,
        TrSearchModels = SelectorModel.TrSearchModels,
        MtsModel = SelectorModel.MtsModel;
    var TravellerView = Backbone.View.extend({
        el: '#J_Container',
        template: Handlebars.compile($('#J_TravellerTpl').html()),
        mtsTemplate: Handlebars.compile($('#J_MtsTpl').html()),
        prevItems: [],
        commonItems: [],
        searchItems: [],
        events: {
//            'blur #J_TravelInput': 'closeResult',
            'focus #J_TravelInput': 'openSearch',
            'tap #J_SearchCancel': 'closeSearch',
            'keydown #J_TravelInput': 'enterSearch',
            'tap #J_ClearTxt': 'clearText'
        },
        initialize: function (options) {
            this.appRouter = options.appRouter;
            var shareViews = require('../../shareViews');
            this.loadingView = shareViews.loadingView;
            this.tipsView = shareViews.tipsView;
            this.selectModel = options.model;
            this.commonModels = new TrModels;
            this.searchModels = new TrSearchModels;
            this.mtsModel = new MtsModel;
            //监听各类model
            this.commonModels.on({
                'sync': this.renderCommon,
                'add': this.addContentView,
                'error': this.renderError
            }, this);
            this.searchModels.on({
                'sync': this.renderSearch,
                'error': this.renderError,
                'change:checked': this.appendSearchResult
            }, this);
            this.listenTo(this.mtsModel, 'sync', this.renderMts);
        },
        render: function () {
            this.setElement('#J_Container', true);
            this.$el.html(this.template());
            var sobId = this.selectModel.get('sobId');
            this.mtsModel.fetchMts(sobId);
            this.$searchInput = this.$('#J_TravelInput');
            this.$clearTxt = this.$('#J_ClearTxt');
            this.$searchLayout = this.$('#J_SearchLayout');
            this.$prevResult = this.$('#J_PrevResult');
            this.$commonResult = this.$('#J_CommonResult'); //出差人选择区域
            this.commonTitle  = this.$commonResult.html();//保存常用出差人title
            this.$searchResult = this.$('#J_SearchResult');
        },
        appendSearchResult:function(model, checked){
            if(checked){
                this.closeSearch();
                this.searchModels.remove(model);
                this.commonModels.add(model);
            }
        },
        //commonModels触发添加子项视图
        addContentView: function(model){
            var trItemView = new TrItemView({model: model, mtsHtml: this.mtsInfo});
            this.$commonResult.append(trItemView.render().el);
        },
        renderError: function(){
            this.tipsView.showErrorTips('查询出差人失败！');
        },
        renderPrevs: function () {
            var tripArray = this.selectModel['tripArray'];
            this.prevModels = new TrModels(tripArray);
            //函数式编程强大的表现力
            this.prevModels.reduce(this.addIView, this.$prevResult.empty(), this);
            return this;
        },
        //渲染常用
        renderCommon: function (models) {
            models.each(function(model){
                model.attributes.checked = true;
            });
            models.reduce(this.addIView, this.$commonResult.empty().html(this.commonTitle), this);
            return this;
        },
        //渲染搜索
        renderSearch: function (models) {
            this.openResult();
            models.each(function(model){
                model.attributes = {
                    tripPersonId: '',
                    tripPersonName:model.get('chineseName'),
                    tripPersono:model.get('employeeNo'),
                    mts:model.get('paicRankDesc'),
                    tripPersonUm:model.get('umName')
                }
            });
            models.reduce(this.addIView, this.$searchResult.empty(), this);
            return this;
        },
        //渲染出差人子项
        addIView: function (container, model) {  //常用的或搜索到的model
            model.set('mtsList', this.mtsModel.get('result')); //添加职级model
            var trItemView = new TrItemView({model: model, mtsHtml: this.mtsInfo});
            this.prevItems.push(trItemView);
            return container.append(trItemView.render().el);
        },
        //渲染职级子项
        //获取职级信息html，之后渲染常用出差人和前一页面出差人
        renderMts: function (model) {
            this.renderPrevs(); //渲染前一页面出差人
//            this.mtsInfo = models.reduce(this.addMts, '', this);
            this.mtsInfo = this.mtsTemplate(model.toJSON());
            var tripId = this.selectModel.get('tripId');
            this.commonModels.selectCommon(tripId);
        },
        //打开搜索，隐藏原列表
        openSearch: function () {
            this.$searchLayout.removeClass('search-btn-no');
            this.$commonResult.hide();
        },
        //取消，显示原列表
        closeSearch: function () {
            this.$searchLayout.addClass('search-btn-no');
            this.$searchResult.addClass('fn-hide');
            this.clearText();
            this.$commonResult.show();
            this.$prevResult.show();
        },
        //回车弹出搜索结果
        openResult: function () {
            this.$clearTxt.show(); //清除按钮显示
            this.$searchResult.removeClass('fn-hide'); //显示搜索
            this.$commonResult.hide();
            this.$prevResult.hide();
        },
        //隐藏搜索结果隐藏
        closeResult: function () {
            this.$clearTxt.hide(); //清除按钮隐藏
            this.$searchResult.addClass('fn-hide'); //显示搜索
            this.$commonResult.show();
            this.$prevResult.show();
        },
        //回车进入搜索
        enterSearch: function (evt) {
            var keyCode = evt.keyCode ? evt.keyCode : (evt.which ? evt.which : evt.charCode);
            if (keyCode == 13) {
                //搜索事件
                var umAccount = this.$searchInput.val().toUpperCase();
                this.doSearch(umAccount);
            }
        },
        doSearch: function(umAccount){
            var deferred = this.searchModels.search(umAccount);
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
        //清除输入框
        clearText: function () {
            this.$clearTxt.hide(); //清除按钮隐藏
            this.$searchInput.val('');
        },
        leave: function(){
            this.$prevResult.empty();
            this.$commonResult.empty();
            this.undelegateEvents();
        },
        findCheckedArray: function(){
            var prevArray = this.prevModels.checkedModels();
            var commonArray = this.commonModels.checkedModels();
            var searchArray = this.searchModels.checkedModels();//连接两个collection
            var checkedArray = commonArray.concat(searchArray); //被选中的出差人列表
            var checkedArray = checkedArray.concat(prevArray);//头信息出差人列表
            return checkedArray;
        },
        //选中出差人
        selectTraveller: function () {
            var checkedArray = this.findCheckedArray();
            var tripArray = checkedArray.map(function (model) {
                return model.toJSON();
            });
            var tripPersonNames = checkedArray.map(function (model) {
                var mts = model.get('mts');
                var tripPersonName = model.get('tripPersonName');
                return tripPersonName + '(' + (mts?mts:'请选择职级') + ')';
            });
            this.selectModel.setTripArray(tripArray).trigger('traveller_select', tripPersonNames.join(' '));
            this.leave();
        }

    });
    return TravellerView;
});
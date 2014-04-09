/**
 * Created by EX-ZHONGYUBIN001 on 13-12-17.
 */
define(function (require) {
    var Backbone = require('backbone'),
        Handlebars = require('handlebars');
    var ReimQueryView = Backbone.View.extend({
        el: '#J_Container',
        pageSize: 20,
        page: 1,
        events: {
            'tap #J_Right': 'selectId',
            'tap #loadMore': 'loadMore',
            'tap #loadMore-1': 'loadOther'
        },
        initialize: function (options) {
            var $ = Backbone.$;
            this._ = require('underscore');
            //获取数据
            var shareModels = require('../../model/shareModels');
            // model初始化
            this.searchReim = shareModels.searchReim;
            this.filterModel = require('../../model/shareModels').filterModel;
            this.appRouter = options.appRouter;
            this.SearchTemplate = Handlebars.compile($('#J_ReimSearchTpl').html());
            // 子view
            this.StateSearhTempate = Handlebars.compile($('#J_StateSearhTpl').html());

            this.listenTo(this.searchReim, 'sync', this.renderEach);
            this.listenTo(this.searchReim, 'sync', this.hideLoad);
        },
        render: function () {
            this.page = 1;
            this.delegateEvents();
            this.setElement('#J_Container', true);
            var headerView = require('../shareViews').headerView;
            headerView.showSearchReim();//替换头部
            var html = this.SearchTemplate();
            this.$el.empty().append(html);
            this.$loadMore = $('#loadMore');
            this.$loadOther = $('#loadMore-1');
            this.$SearchContent = this.$('#J_SearchContent');
            this.showLoad();
            var ViewHelper = require('../common/ViewHelper');
            ViewHelper.datepicker();
        },
        renderEach: function () {
            var SearchContent = this.$SearchContent;
            SearchContent && SearchContent.append(this.getEachHtml());
            if ($('.J_Filter').text() == '中心退回' ||
                $('.J_Filter').text() == '部门预算员退回' ||
                $('.J_Filter').text() == '领导审批退回' ||
                $('.J_Filter').text() == '支付失败' ||
                $('.J_Filter').text() == '待员工还款' ||
                $('.J_Filter').text() == '待支付') {
                $('.J_Filter').addClass('fn-c-ff522f');
            };
        },
        getEachHtml: function () {
            var html_in = '',
                _that = this,
                searchOrder = this.searchReim;
            var ifNull = JSON.stringify(searchOrder);

            if (ifNull !== '[]') {
                searchOrder.each(function (order, index) {
                    var orderRecord = order.attributes;
                    console.log(orderRecord);
                    orderRecord.index = index;
                    if (orderRecord) {
                        html_in += _that.StateSearhTempate(orderRecord);
                    }
                });
            } else if (ifNull === '[]') {
                alert('无记录');
            }
            ;
            return html_in;
        },
        showLoad: function () {
            var data = this.filterModel.get('data');
            if (!data) {
                this.$loadMore.show();
                this.$loadOther.hide();
            } else if (data) {
                this.$loadMore.hide();
                this.$loadOther.show();
            }
        },
        hideLoad: function () {
            var ifPage = window.localStorage.getItem('ifPage');
            if (ifPage) {
                this.$loadMore.hide();
                this.$loadOther.hide();
            }
        },
        loadMore: function () {
            this.ifPage = window.localStorage.getItem('ifPage');
            if (this.ifPage) {
                $('#loadMore').hide();
            }
            this.searchReim.fetchMore(++this.page, this.pageSize);
        },
        loadOther: function () {
            this.ifPage = window.localStorage.getItem('ifPage');
            if (this.ifPage) {
                $('#loadMore-1').hide();
            }
            var data = this.filterModel.get('data');
            this.searchReim.fetchOther(data, ++this.page, this.pageSize);
            alert('dfa');
        },
        selectId: function (event) {
            var eTarget = event.target || event.srcElement;
            var idSet = $(eTarget).parent().attr('data-value');
            window.localStorage.setItem('tripId_BX', idSet);
            window.location.href = '/fcs/mobile/html/redim.html?reimId=1';
        },
        leave: function () {
            this.content = this.$el.html();
        }
    });
    return ReimQueryView;
});
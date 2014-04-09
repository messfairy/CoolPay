/**
 * 头信息选择所用model类集合（展）
 */
define(function (require, exports) {
    var Backbone = require('backbone'),
        _ = require('underscore');
    //数据收集model
    var SelectModel = Backbone.Model.extend({
        urlRoot: '/fcs/do/trip/json/ExpenseAccountInfo',
        controllerUrl: '/UpdateTripHeaderInfoByTripId',
        tripArray: [],
        url: function () {
            return this.urlRoot + this.controllerUrl;
        },
        validate: function (attributes) {
            if (!attributes) {
                return '数据格式错误！';
            }
            else if (!attributes['tripId']) {
                return '报销单Id不能为空！';
            }
            else if (!attributes['sobId']) {
                return '请选择单位！';
            }
            else if (!attributes['payeeENo']) {
                return '支付账号不能为空！';
            }
            else if (!attributes['employeeNo']) {
                return '员工编号不能为空！';
            }
            else if (!attributes['segment3']) {
                return '请选择部门！';
            }
            else if (!this['tripArray'] || !this['tripArray'][0]) {
                return '请选择出差人！';
            }
            else if (!attributes['tripStartDate']) {
                return '请选择出差起始日期！';
            }
            else if (!attributes['tripEndDate']) {
                return '请选择出差结束日期！';
            }
            else if (!attributes['tripReason']) {
                return '出差事由不能为空！';
            } else {
                return this.validateTripArray(this['tripArray']);
            }
        },
        setTripArray: function(tripArray){
            this['tripArray'] = tripArray;
            return this;
        },
        validateTripArray: function (tripArray) {
            var emptyMtsPersonNames = _.reduce(tripArray, function (memo, tripPerson) {
                var mts = tripPerson['mts'];
                if (!mts) {
                    return memo + ' ' + tripPerson['tripPersonName'];
                } else {
                    return memo;
                }
            }, '');
            if (!!emptyMtsPersonNames) {
                return emptyMtsPersonNames + '：没有职级，请选择！'
            }
        },
        parse: function (response) {
            if (response.flag) {
                return {tripPersons: response.result};
            } else {
                return response.message;
            }
        }
    });
    exports.selectModel = new SelectModel;
    var PayeeModel = Backbone.Model.extend({
        idAttribute: 'payeeUm'
    });
    var PayeeModels = Backbone.Collection.extend({
        urlRoot: '/fcs/do/trip/json/ExpenseAccountInfo',
        commonUrl: '/getTripCommonPersonByTripId?tripId=',
        searchUrl: '/getChamberlainByUmAndName',
        model: PayeeModel,
        initialize: function () {
            this.actionUrl = this.commonUrl;
        },
        url: function () {
            return this.urlRoot + this.actionUrl;
        },
        select: function (tripId) {
            this.actionUrl = this.commonUrl + tripId;
//            var url = '/fcs/mobile/service/payeeInfo.json';
//            return this.fetch({url: url, reset: true});
            return this.fetch({reset: true});
        },
        search: function (umAccount) {
            this.actionUrl = this.searchUrl;
            return this.fetch({reset: true, data: {umAccount: umAccount}});
        }
    });
    var PayeeSelectModels = PayeeModels.extend({
        commonArray: function (resultArray) {
            if (!resultArray || resultArray.length === 0) {
                this.trigger('no_um', false, '没有搜索到该UM用户!');
            } else {
                return _.map(resultArray, function (item) {
                    return {payeeUm: item.payeeUm, payeeENo: item.payeeENo,
                        payeName: item.payeName, employeeNo: item.operatorNo
                    };
                });
            }
        },
        parse: function (response) {
            if (response.flag) {
                var resultArray = response.result;
                return this.commonArray(resultArray);
            } else {
                this.trigger('no_um', false, response.message);
            }
        }
    });
    var PayeeSearchModels = PayeeModels.extend({
        searchArray: function (resultArray) {
            if (!resultArray || resultArray.length === 0) {
                this.trigger('no_um', false, '没有搜索到该UM用户!');
            } else {
                return _.map(resultArray, function (item) {
                    return {payeeUm: item.umName, payeeENo: item.ePayNum,
                            payeName: item.chineseName, employeeNo: item.employeeNo
                    };
                });
            }
        },
        parse: function (response) {
            if (response.flag) {
                var resultArray = response.result.pdList;
                return this.searchArray(resultArray);
            } else {
                this.trigger('no_um', false, response.message);
            }
        }
    });
    exports.PayeeSelectModels = PayeeSelectModels;
    exports.PayeeSearchModels = PayeeSearchModels;

    //出差人页面选择职级所有用model
    var MtsModel = Backbone.Model.extend({
        urlRoot: '/fcs/do/trip/json/ExpenseAccountInfo',
        mtsUrl: '/getPositionLevelByUm?sobId=',
        url: function () {
            return this.urlRoot + this.actionUrl;
        },
        fetchMts: function (sobId) {
            this.actionUrl = this.mtsUrl + sobId;
            this.fetch();
        },
        parse: function (response) {
            if (response.flag) {
                return response;
            } else {
                alert('获取职级信息失败!');
                return response.message;
            }
        }
    });
    exports.MtsModel = MtsModel;

    var TrItemModel = Backbone.Model.extend({
        defaults: {
            'checked': false
        },
        toggle: function () {
            this.set('checked', !this.get('checked'));
        }
    });
    var TrModels = Backbone.Collection.extend({
        model: TrItemModel,
        urlRoot: '/fcs/do/trip/json/ExpenseAccountInfo',
        commonUrl: '/getTripCommonOutPersonByTripId?tripId=',//常用出差人
        searchUrl: '/getChamberlainByUmAndName',
        initialize: function () {
            this.actionUrl = this.commonUrl;
        },
        url: function () {
            return this.urlRoot + this.actionUrl;
        },
        checkedModels: function () {
            return this.where({'checked': true});
        },
        selectCommon: function (tripId) {
            this.actionUrl = this.commonUrl + tripId;
            return this.fetch({reset: true});
        },
        search: function (umAccount) {
            this.actionUrl = this.searchUrl;
            return this.fetch({reset: true, data: {umAccount: umAccount}});
        },
        parse: function (response) {
            if (response.flag) {
                return response.result;
            } else {
                alert('获取出差人失败！');
                return response.message;
            }
        }
    });
    exports.TrModels = TrModels;
    var TrSearchModels = Backbone.Collection.extend({
        model: TrItemModel,
        urlRoot: '/fcs/do/trip/json/ExpenseAccountInfo',
        searchUrl: '/getChamberlainByUmAndName',
        url: function () {
            return this.urlRoot + this.searchUrl;
        },
        search: function (umAccount) {
            return this.fetch({reset: true, data: {umAccount: umAccount}});
        },
        checkedModels: function () {
            return this.where({'checked': true});
        },
        parse: function (response) {
            if (response.flag) {
                return response.result.pdList;
            } else {
                alert('搜索出差人失败！');
                return response.message;
            }
        }
    });
    exports.TrSearchModels = TrSearchModels;

    var BookSetModel = Backbone.Model.extend({
        idAttribute: 'addressId'
    });
    var BookSetModels = Backbone.Collection.extend({
        model: BookSetModel,
        urlRoot: '/fcs/do/trip/json/ExpenseAccountInfo',
        selectUrl: '/getVendorSitesList?employeeNo=',
        searchUrl: '/getVendorSitesList',
        initialize: function () {
            this.actionUrl = this.selectUrl;
        },
        url: function () {
            return this.urlRoot + this.actionUrl;
        },
        fetchBookSet: function (employeeNo) {
            this.actionUrl = this.selectUrl + employeeNo;
            return this.fetch({reset: true});
        },
        parse: function (response) {
            if (response.flag) {
                return response.result.vendorSitesList;
            } else {
                alert('获取帐套公司失败');
                return response.message;
            }
        }
    });
    exports.BookSetModels = BookSetModels;

    var DepModels = Backbone.Collection.extend({
        model: Backbone.Model,
        urlRoot: '/fcs/do/trip/json/ExpenseAccountInfo',
        commonUrl: '/getTripCommonDepertment',
        selectUrl: '/getSegmentFlexValueList?setOfBooksId=',
        searchUrl: '/getSegmentFlexValueList?setOfBooksId=',//查询结果
        initialize: function () {
            this.actionUrl = this.selectUrl;
        },
        url: function () {
            return this.urlRoot + this.actionUrl;
        },
        pageUrl: function (url, pageNo, pageSize) {
            if (!!pageNo) {
                url += '&page=' + pageNo;
            }
            if (!!pageSize) {
                url += '&pageSize=' + pageSize;
            }
            return url;
        },
        fetchDep: function (setOfBooksId, pageNo, pageSize) {
            this.actionUrl = this.pageUrl(this.selectUrl + setOfBooksId, pageNo, pageSize);
            return this.fetch({reset: true});
        },
        refresh: function (setOfBooksId, pageNo, pageSize) {
            this.actionUrl = this.pageUrl(this.selectUrl + setOfBooksId, pageNo, pageSize);
            return this.fetch({reset: true});
        },
        parse: function (response) {
            if (response.flag) {
                return response.result.segmentFlexValueList;
            } else {
                this.trigger('fetch_fail', '获取部门失败');
                return response.message;
            }
        }
    });
    var CommonDepModels = DepModels.extend({
        fetchCommon: function () {
            this.actionUrl = this.commonUrl;
            return this.fetch({common: true, reset: true});
        },
        parse: function (response) {
            if (response.flag) {
                return response.result.depertMentList;
            } else {
                this.trigger('fetch_fail', '获取常用部门失败');
                return response.message;
            }
        }
    });
    var SearchDepModels = DepModels.extend({
        search_url: function (setOfBooksId, segment_value, pageNo, pageSize) {
            var url = this.searchUrl + setOfBooksId;
            if (!!segment_value) {
                url += '&segment_value=' + segment_value;
            }
            return this.pageUrl(url, pageNo, pageSize);
        },
        searchDep: function (setOfBooksId, segment_value, pageNo, pageSize) {
            this.actionUrl = this.search_url(setOfBooksId, segment_value, pageNo, pageSize);
            return this.fetch({reset: true});
        },
        parse: function (response) {
            if (response.flag) {
                return response.result.segmentFlexValueList;
            } else {
                this.trigger('fetch_fail', '搜索部门失败');
                return response.message;
            }
        }
    });
    exports.DepModels = DepModels;
    exports.CommonDepModels = CommonDepModels;
    exports.SearchDepModels = SearchDepModels;
});
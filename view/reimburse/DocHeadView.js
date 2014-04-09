/**
 * 报销单视图
 */
define(function (require) {
    var Backbone = require('backbone'),
        _ = require('underscore'),
        Handlebars = require('handlebars');
    //选择model
    var DocHeadView = Backbone.View.extend({
        el: '#J_Container',
        template: Handlebars.compile($('#J_ReimDocHeadTpl').html()),
        events: {
            'tap #J_SelectPayee': 'selectPayee',
            'tap #J_SelectBookset': 'selectBookset',
            'tap #J_SelectDep': 'selectDep',
            'tap #J_SelectTraveller': 'selectTraveller',
            'tap #J_ButtonNext': 'submit'
        },
        depPageNo: 1,
        depPageSize: 10,
        initialize: function (options) {
            this.appRouter = options.appRouter;
            var shareViews = require('../shareViews');
            this.headerView = shareViews.headerView;
            this.loadingView = shareViews.loadingView;
            this.ViewHelper = require('../common/ViewHelper');
            //提交用的model
            this.createSubmitModel();
            //创建帐套model
            this.createBookSet();
            //创建部门model
            this.createDep();
            //headInfoModel
            var shareModels = require('../../model/shareModels');
            this.headInfoModel = shareModels.reimModel;//报销提交model
        },
        render: function () {
            this.setElement('#J_Container', true);
            var headInfoModel = this.headInfoModel;
            var tripDto = headInfoModel.getTripInfo();
            var perList = headInfoModel.getTripPersons();
            this.tripId = tripDto.tripId;
            this.updateDft(tripDto);
            this.updateSelection(tripDto, perList); //更新selectModel
            var html = this.template(headInfoModel.attributes);
            this.$el.empty().append(html);
            this.ViewHelper.datepicker();
        },
        hideLoading: function () {
            this.loadingView.hide();
        },
        //头信息提交model
        createSubmitModel: function () {
            var selectModel = this.selectModel = require('../../model/SelectorModel').selectModel;
            selectModel.on({
                'payee_select': this.payeeSelBack,
                'traveller_select': this.travellerSelBack,
                'bookset_select': this.bookSetSelBack,
                'department_select': this.depSelBack,
                'back_headInfo': this.selectBack,
                'select_error': this.selectError,
                'invalid': this.validateError,
                //后台save报销单结果
                'sync': this.saveResult,
                'error': this.errorResult
            }, this);
        },
        selectError: function(errorMsg){
            this.showErrorTips(errorMsg);
        },
        //提交后台之前，验证数据发生错误
        validateError: function (model, errorMsg, options) {
            this.showErrorTips(errorMsg);
        },
        createBookSet: function () {
            var BookSetModels = require('../../model/SelectorModel').BookSetModels;
            this.bookSets = new BookSetModels;
            this.listenTo(this.bookSets, 'sync', this.changeBookSet);
            this.listenTo(this.bookSets, 'error', this.errorBookSet);
        },
        createDep: function () {
            var DepModels = require('../../model/SelectorModel').DepModels;
            this.depModels = new DepModels;
            this.listenTo(this.depModels, 'sync', this.changeDep);
            this.listenTo(this.depModels, 'fetch_fail', this.showErrorTips);
        },
        updateDft: function (tripDto) {
            tripDto.tripStartDate = this.ViewHelper.formatDate(tripDto.tripStartDate);
            tripDto.tripEndDate = this.ViewHelper.formatDate(tripDto.tripEndDate);
        },
        updateSelection: function (tripDto, tripArray) {
            var tripDto = {
                tripId: tripDto.tripId,
                sobId: tripDto.sobId,
                sobDesc: tripDto.sobDesc,
                segment3: tripDto.segment3,
                segment3Desc: tripDto.segment3Desc,
                orgName: tripDto.orgName,
                payeeUm : tripDto.payeeUm,
                payeName: tripDto.payeName,
                payeeENo: tripDto.payeeENo,
                employeeNo: tripDto.operatorNo
            };
            this.selectModel.clear().setTripArray(tripArray).set(tripDto);
        },
        //选择收款人回调修改帐套
        changeBookSet: function (bookSet) {
            var sets = bookSet.toJSON(), sobId, sobDesc;
            if (!sets || !sets[0]) {
                $('#J_BooksetValue').text('请选择');
                this.selectModel.set({'sobId': null, 'sobDesc': null});
                return;
            }else if (sets[1]) {
                $('#J_BooksetValue').text('请选择');
                this.selectModel.set({'sobId': null, 'sobDesc': null});
            } else {
                sobId = sets[0]['setOfBooksId'];
                sobDesc = sets[0]['sobName'];
                $('#J_BooksetValue').text(sobDesc);
                this.selectModel.set({'sobId': sobId, 'sobDesc': sobDesc});
            }
        },
        //回调修改部门
        changeDep: function (department) {
            var deps = department.attributes, segment3, segment3Desc;
            if (!deps || !deps[0]) {
                $('#J_DepValue').text('请选择');
                this.selectModel.set({'segment3': null, 'segment3': null});
            }else if (deps[1]) {
                $('#J_DepValue').text('请选择');
                this.selectModel.set({'segment3': null, 'segment3': null});
            } else {
                segment3 = deps[0]['segment_value'];
                segment3Desc = deps[0]['segment_desc'];
                $('#J_DepValue').text(segment3Desc);
                this.selectModel.set({'segment3': segment3, 'segment3Desc': segment3Desc});
            }
        },
        errorBookSet: function (model, xhr, options) {
            this.showErrorTips('查询帐套公司失败！');
        },
        selectBack: function () {
            this.back();
            this.ViewHelper.datepicker();
            this.headerView.showReimDocHead(); //显示头信息
        },
        //回传收款人
        payeeSelBack: function (payeeName, payeeUm, payeeENo, employeeNo) {
            this.selectBack();
            this.$('#J_PayeeValue').html(payeeName + '(' + payeeUm + ')支付帐号(' + payeeENo + ')');
            this.bookSets.fetchBookSet(employeeNo);
        },
        //回传帐套值
        bookSetSelBack: function (sobDesc, orgName, sobId) {
            this.selectBack();
            this.$('#J_BooksetValue').html(sobDesc + '(' + orgName + ')');
            var deferred = this.depModels.fetchDep(sobId, this.depPageNo, this.depPageSize);
            this.alwaysLoading(deferred);
        },
        alwaysLoading: function (deferred) {
            if (!!deferred) {
                this.loadingView.show();
                var that = this;
                deferred.always(function () {
                    that.loadingView.hide();
                });
            }
        },
        //回传部门
        depSelBack: function (depName, depId) {
            this.selectBack();
            this.$('#J_DepValue').html(depName);
            this.setDataField('segment3', depId);
            this.setDataField('segment3Desc', depName);
        },
        //回传出差人
        travellerSelBack: function (tripPersonNames) {
            this.selectBack();
            this.$('#J_TravellerValue').html(tripPersonNames);
        },
        setDataField: function (key, value) {
            this.selectModel.set(key, value);
        },
        //选择收款人
        selectPayee: function () {
            this.leave();
            this.headerView.showPayeeHeader();
            var PayeeView = require('./selector/PayeeView');
            if (!this.payeeView) {
                this.payeeView = new PayeeView({appRouter: this.appRouter, model: this.selectModel});
            }
            this.payeeView.fetchPayee(this.tripId);
        },
        //选择账套公司
        selectBookset: function () {
            this.leave();
            this.headerView.showBooksetHeader();
            var BooksetView = require('./selector/BooksetView');
            if (!this.booksetView) {
                this.booksetView = new BooksetView({
                    appRouter: this.appRouter,
                    model: this.selectModel
                });
            }
            var employeeNo = this.selectModel.get('employeeNo');
            if (employeeNo) {
                this.booksetView.fetchBookSet(employeeNo);
            } else {
                this.showErrorTips('请先选择收款人，再选帐套！');
            }

        },
        //选择入账部门
        selectDep: function () {
            this.leave();
            this.headerView.showDepHeader();
            var DepView = require('./selector/DepView');
            if (!this.depView) {
                this.depView = new DepView({appRouter: this.appRouter, model: this.selectModel});
            }
            var sobId = this.selectModel.get('sobId');
            this.depView.fetchCommon(sobId);
        },
        //选择出差人
        selectTraveller: function () {
            this.leave();
            var sobId = this.selectModel.get('sobId');
            if (!sobId) {
                this.showErrorTips('查询出差人职级信息，需要选择入账单位！');
                return;
            }
            var TravellerView = require('./selector/TravellerView');
            if (!this.travellerView) {
                this.travellerView = new TravellerView({
                    appRouter: this.appRouter,
                    model: this.selectModel
                });
            }
            this.headerView.showTravellerHeader(this.travellerView);
            this.travellerView.render();
        },
        showErrorTips: function (message) {
            var tipsView = require('../shareViews').tipsView;
            tipsView.showErrorTips(message);
        },
        errorResult: function (model, jqXHR) {
            this.showErrorTips('保存头信息后台错误！');
            console.log('后台错误信息：' + jqXHR.responseText);
        },
        saveResult: function (model, response) {
            if (response.flag) {
                var tripId = model.get('tripId'),
                    tripArray = model.tripArray,
                    allAmount = model.get('allAmount');
                this.saveForAdd(tripId, tripArray, allAmount);
                this.appRouter.reimNavigate('reim/add/document/' + tripId, true); //进入报销单明细
            } else {
                this.showErrorTips(response.message);
            }
        },
        saveForAdd: function (tripId, tripArray, allAmount) {
            var tripPersons = _.map(tripArray, function (tripPerson) {
                return {
                    mts: tripPerson.mts,
                    inPeopel: tripPerson.tripPersonName,
                    tripPersonIds: tripPerson.tripPersonId
                }
            });
            var addEvection = require('../../model/shareModels').addEvectionModel;
            addEvection.set({data: tripPersons, tripId: tripId, allAmount: allAmount});
        },
        submit: function () {
            var selectModel = this.selectModel;
            var tripReason = $('#J_TravelReason').val();
            var tripStartDate = $('#J_StartDate').val();
            var tripEndDate = $('#J_EndDate').val();
            //后台保存头信息
            var deferred = selectModel.save({
                deductionAmount: 0, //核减金额
                tripReason: tripReason,
                tripStartDate: tripStartDate,
                tripEndDate: tripEndDate,
                tripPersons: JSON.stringify(selectModel['tripArray'])
            }, {data: selectModel.attributes});
            this.alwaysLoading(deferred);
        },
        leave: function () {
            this.content = this.$el.html();
            var model = this.selectModel;
            var tripStartDate = this.$('#J_StartDate').val();
            var tripEndDate = this.$('#J_EndDate').val();
            var tripReason = this.$('#J_TravelReason').val();
            model.set('tripStartDate', tripStartDate);
            model.set('tripStartDate', tripEndDate);
            model.set('tripReason', tripReason);
        },
        back: function () {
            this.$el.empty().append(this.content);
            var model = this.selectModel;
            var tripStartDate = model.get('startDate');
            var tripEndDate = model.get('endDate');
            var tripReason = model.get('tripReason');
            if (!!tripStartDate) {
                this.$('#J_StartDate').val(tripStartDate);
            }
            if (!!tripEndDate) {
                this.$('#J_EndDate').val(tripEndDate);
            }
            if (!!tripReason) {
                this.$('#J_TravelReason').val(tripReason);
            }
        }
    });
    return DocHeadView;
});
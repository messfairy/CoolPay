define(function (require) {
    var Backbone = require('backbone');
    var PwdModel = require('../../model/PwdModel');
    var PwdUpdateView = Backbone.View.extend({
        el: '#J_Container',
        model: PwdModel.pwdUpdate,
        events: {
            'blur #J_CurrentPwd':'checkCurrent',
            'blur #J_NewPwd':'checkNew',
            'blur #J_NewPwd2':'checkNew2',
            'tap #J_ConfirmLogin': 'confirmLogin',
            'tap #J_UpdatePwd':'submitUpdate'
        },
        initialize: function (options) {
            this.appRouter = options.appRouter;
            this.loadingView = require('../shareViews').loadingView;
            this.listenTo(this.model, 'check_error', this.checkResult);
            this.listenTo(this.model, 'invalid', this.invalidResult);
//            this.listenTo(this.model, 'sync', this.updateResult);
            this.listenTo(this.model, 'update_ok', this.updateResult);
            this.listenTo(this.model, 'update_fail', this.updateResult);
            this.listenTo(this.model, 'error', this.updateError);
        },
        render: function(){
            this.setElement('#J_Container', true);
            this.$el.empty().html($('#J_ChangePwdTpl').html());
            this.$current = this.$('#J_CurrentPwd');
            this.$new = this.$('#J_NewPwd');
            this.$new2 = this.$('#J_NewPwd2');
            this.$updateDoneTips = this.$('#J_TipsMash');
        },
        checkCurrent:function(){
            this.model.checkCurrent(this.$current.val());
        },
        checkNew:function(){
            this.model.checkNew(this.$new.val());
        },
        checkNew2:function(){
            this.model.checkNew2(this.$new2.val());
        },
        invalidResult: function(model, errorMsg){
            var tipsView = require('../shareViews').tipsView;
            tipsView.showErrorTips(errorMsg);
        },
        checkResult: function(result){
            var tipsView = require('../shareViews').tipsView;
            if(result.flag){
                tipsView.showSuccessTips(result.message);
            }else{
                tipsView.showErrorTips(result.message);
            }
        },
        showTips: function (valid, message) {
            var tipsView = require('../shareViews').tipsView;
            if (valid) {
                tipsView.showSuccessTips(message);
            } else {
                tipsView.showErrorTips(message);
            }
        },
        updateResult:function(response){
            if(response.flag){
                this.$updateDoneTips.show();
            }else{
                this.showTips(false, response.message);
            }
        },
        updateError: function(model, jqXHR){
            var tipsView = require('../shareViews').tipsView;
            tipsView.showErrorTips('网络不给力，错误信息：', jqXHR.statusText);
        },
        submitUpdate: function(){
            var currentPwd = this.$current.val();
            var newPwd = this.$new.val();
            var newPwd2 = this.$new2.val();
            var deferred = this.model.updatePwd(currentPwd, newPwd, newPwd2);
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
        confirmLogin: function(){
            this.appRouter.navigate('user/login', true);
        }
    });
    return PwdUpdateView;
});
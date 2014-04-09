/**
 * Created by EX-LIXUEWEN001 on 13-12-31.
 * 申请成功界面
 */
define(function(require){
    var Backbone = require('backbone'),
        Handlebars = require('handlebars');
    var DocSuccessView=Backbone.View.extend({
        el: '#J_Container',
        events:{
            'tap #J_BackHeader':'backHeader',
            'tap #J_ContinueReim':'reimContinue',
            'tap #J_ReimToDetail':'reimToDetail'
        },
        initialize:function(options){
            this.appRouter = options.appRouter;
            this.DocSuccessTemplate= Handlebars.compile($('#J_ReimDocSuccess').html());
            this.viewHelper=require('../common/ViewHelper');
        },
        render:function(){
            //请求后台获取审批人和收款人信息
           var guid= window.localStorage.getItem('guid');
           var viewHelper=this.viewHelper;
           var that=this;
           var successModel={};
            $.ajax({
                type:'get',
                url:'/fcs/do/trip/json/ExpenseAccountInfo/getTripSubmitNoteById?guid='+guid,
                dataType:'json',
                success:function(response){
                    if(response.flag){
                        var tripId=response.result.tripId;
                        successModel.payName=response.result.payName;
                        successModel.allAmount=response.result.allAmount;
                        successModel.submitDate=response.result.submitDate;
                        successModel.approvePerson=response.result.approvePerson;
                        that.$el.empty().append(that.DocSuccessTemplate(successModel));
                        window.localStorage.removeItem('guid');
                        window.localStorage.setItem('successTripId',tripId);
                    }else{
                        viewHelper.showTips(false,response.message);
                    }
                },
                error:function(xhr){
                    viewHelper.showTips(false,'网络错误，请重试');
                }
            });
        },
        //返回首页
        backHeader:function(){
            this.appRouter.appNavigate('home', true);
        },
        //继续报销
        reimContinue:function(){
            this.appRouter.reimNavigate('reim/add/orders',true);
        },
        //跳转到报销详情界面
        reimToDetail:function(){
            window.location.href='/fcs/mobile/html/redim.html';
        }
    });
    return DocSuccessView;
});
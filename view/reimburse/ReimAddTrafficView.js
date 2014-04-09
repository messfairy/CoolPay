/**
 * Created by EX-HUANGLILING001 on 13-12-18.
 */
define(function(require){
    var Backbone = require('backbone'),
        Handlebars = require('handlebars');
    var means='';
    var ReimAddTrafficView=Backbone.View.extend({
        el:'#J_Container',
        events:{
            //事件
            'tap .sleTraffic':'showTraffiCnt',//点击添加交通
            'tap .ipt-rdo-label':'selectTraffic',//选择交通工具
            'tap .J_city':'selectCity',//选择城市
            'tap .J_city':'selectEndCity',//选择城市
            'tap  #J_updateTraffic_submit':'updateTrafficSubmit',//修改页面确定提交
            'tap #J_addTraffic_submit':'addTrafficSubmit'//添加页面确定提交
        },
        initialize:function(options){
            this.appRouter = options.appRouter;
            var $ = Backbone.$;
            this._ = require('underscore');
            this.AddTrafficTemplate=Handlebars.compile($('#J_AddTrafficTpl').html());
            this.UpdataTrafficTemplate=Handlebars.compile($('#J_UpdateTrafficTpl').html());
            //获得共享model
            this.addEvection = require('../../model/shareModels').addEvectionModel;
            this.addTrafficModel=require('../../model/shareModels').addTrafficModel;
            this.viewHelper=require('../common/ViewHelper');
        },
        render:function(){
            var travellers=this.addTrafficModel.get('travellers');//点击添加交通获得
            var updateNum=this.addTrafficModel.get('updateNum');//点击修改数据获得
            if(travellers){//添加交通工具页面
                var html = this.AddTrafficTemplate({'dataArray':travellers});
                this.$el.empty().append(html);
                return this;
            }else if(updateNum){//修改数据页面
                var html = this.UpdataTrafficTemplate(updateNum);
                this.$el.empty().append(html);
                if(updateNum.means=='火车'){
                    $('#J_selectTrain').removeClass('rdo-selected').addClass('rdo-selected');
                }else if(updateNum.means=='轮船'){
                    $('#J_selectSteamship').removeClass('rdo-selected').addClass('rdo-selected');
                }else{
                    $('#J_selectCar').removeClass('rdo-selected').addClass('rdo-selected');
                }
                return this;
            }
        },
        //显示添加交通内容
        showTraffiCnt:function(e){
            var trfShow=$(e.currentTarget||e.srcElement);
            if(!trfShow.hasClass('switch-show')){
                trfShow.addClass('switch-show');
                trfShow.next().removeClass('fn-hide');
            }else if(trfShow.hasClass('switch-show')){
                trfShow.removeClass('switch-show');
                trfShow.next().addClass('fn-hide');
            }
        },
        //选择交通类型
        selectTraffic:function(e){
            var target = e.srcElement||e.target;
            if(target.nodeName.toLocaleLowerCase()==='label'){
                $(target).addClass("rdo-selected").siblings().removeClass("rdo-selected");
            }
        },
        //选择城市
        selectCity:function(e){
            var a=e.currentTarget||e.srcElement;
            console.log(a);
            this.innerHTML1 = $('#J_Container').html();
            this.appRouter.reimNavigate('reim/add/select/city',true);
        },
        //选择城市
        selectEndCity:function(e){
            var a=e.currentTarget||e.srcElement;
            console.log(a);
            this.innerHTML2 = $('#J_Container').html();
            this.appRouter.reimNavigate('reim/add/select/city2',true);
        },
        //cityStart传回来
        selectStartCityBack:function(cityNo){
            this.$el.empty().append(this.innerHTML1);
            this.$('#J_StartCity').empty().html(cityNo);
        },
        //cityEnd传回来
        selectEndCityBack:function(cityNo){
            this.$el.empty().append(this.innerHTML2);
            this.$('#J_EndCity').empty().html(cityNo);
        },
        //修改页面确定提交按钮
        updateTrafficSubmit:function(e){
            var viewHelper=this.viewHelper;
            var that=this.addEvection;
            var a=e.currentTarget||e.srcElement;
            var router=this.appRouter;
            var roundTripId=$(a).data('roundtripid');
            var price=$('#J_price').val();
            var means='';
            var selectTrain=$('#J_selectTrain');
            var selectSteamship=$('#J_selectSteamship');
            var selectCar=$('#J_selectCar');
            if(selectTrain.hasClass('rdo-selected')){
                means=selectTrain.text().trim();
            }else if(selectSteamship.hasClass('rdo-selected')){
                means=selectSteamship.text().trim();
            }else if(selectCar.hasClass('rdo-selected')){
                means=selectCar.text().trim();
            }
            var startCity=$('#J_StartCity').text();
            var endCity=$('#J_EndCity').text();
            //判断资料是否填写完整
            if(price!=''&& startCity!='选择城市'&& endCity!='选择城市'){
                if(!(/^([1-9][\d]{0,7}|0)(\.[\d]{1,2})?$/).test(price.toString())){
                    viewHelper.showTips(false,'金额格式不对，请重填');
                }else{
                    $.ajax({
                        type:'get',
                        url:'/fcs/do/trip/json/ExpenseAccountInfo/updateTripRoundInfo?roundTripId='+roundTripId+'&price='+price+'&means='+means+'&startCity='+startCity+'&endCity='+endCity,
                        dataType:'json',
                        success:function(response){
                            if(response.flag){
                                viewHelper.showTips(true,response.message);
                                router.reimNavigate('reim/add/document/'+that.get('tripId'),true);
                            }else{
                                viewHelper.showTips(false,response.message);
                            }
                        },
                        error:function(){
                            viewHelper.showTips(false,'网络异常，请重试');
                        }
                    });
                }
            }else{
                viewHelper.showTips(false,'资料填写不完整，请检查');
            }
        },
        //添加页面确定提交按钮
        addTrafficSubmit:function(e){
            var viewHelper=this.viewHelper;
            var that=this.addEvection;
            var a=e.currentTarget||e.srcElement;
            var router=this.appRouter;
            var trafficList=[];
            var item=$(a).siblings();
            this._.each(item,function(order){
                var tripNum={};
                var a=$(order);
                if(a.find('.J_B').hasClass('rdo-selected') && (/^([1-9][\d]{0,7}|0)(\.[\d]{1,2})?$/).test(a.find('.J_C input').val().toString())&& a.find('.J_D').text()!='选择城市'&& a.find('.J_E').text()!='选择城市'){
                        tripNum.tripId= a.find('.J_A').data('tripid');
                        tripNum.tripPersonId= a.find('.J_A').data('trippersonid');
                        tripNum.means= a.find('.J_B').filter('.rdo-selected').text().trim();
                        tripNum.price= a.find('.J_C input').val();
                        tripNum.startCity= a.find('.J_D').text();
                        tripNum.endCity= a.find('.J_E').text();
                        trafficList.push(tripNum);
                }
            });
            //判断资料是否填写完整
            if(trafficList.length>0){
                    $.ajax({
                        type:'post',
                        url:'/fcs/do/trip/json/ExpenseAccountInfo/saveTripRoundInfo',
                        data:{
                            sos:JSON.stringify(trafficList)
                        },
                        dataType:'json',
                        success:function(response){
                            if(response.flag){
                                viewHelper.showTips(true,response.message);
                                router.reimNavigate('reim/add/document/'+that.get('tripId'),true);
                            }else{
                                viewHelper.showTips(false,response.message);
                            }
                        },
                        error:function(){
                            viewHelper.showTips(false,'网络错误，请重试');
                        }
                    });
            }else{
                    viewHelper.showTips(false,'信息填写错误或不完整，请检查');
            }
        }
    });
    return ReimAddTrafficView;
});
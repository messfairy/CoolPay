define(function (require, exports) {
    var Backbone = require('backbone');
    //生成报销单model
    var ReimburseModel = Backbone.Model.extend({
        airIds: [],//被选中的订单ids
        hotelIds: [],
        urlRoot: '/fcs/do/trip/json/ExpenseAccountInfo',
        actionUrl: '/expenseAccount',
        url: function () {
            return this.urlRoot + this.actionUrl;
        },
        //提交无订单报销单
        submitNoOrder: function () {
            return this.clear().save(null, {data: null});
        },
        //提交报销单
        submitDoc: function (aIds, hIds, tripId) {
            var options = {airIds: aIds.join(','), hotelIds: hIds.join(',')};
            if (!!tripId) {
                options.tripId = tripId;
            }
            return this.clear().save(options, {data: this.attributes});
        },
        //报销单头信息获取
        parse: function (response) {
            return response.result;
        },
        getTripInfo: function () {
            return this.attributes.tdto;
        },
        getTripPersons: function () {
            return this.attributes.perList;
        }
    });
    exports.reimModel = new ReimburseModel;
    //首页订单model(一条机票一条酒店)
    var IndexOrder = Backbone.Model.extend({
        url: '/fcs/do/trip/json/OrderInfoQurey/newOrderInfo',
        initialize: function () {
        },
        airInfo: function () {
            return this.get('newAieInfo');
        },
        hotelInfo: function () {
            var newHotelInfo = this.get('newHotelInfo');
            if (!!newHotelInfo) {
                this.mapStatusIn(newHotelInfo);
                return newHotelInfo;
            }
        },
        //处理酒店状态
        mapStatusIn: function (newHotelInfo) {
            var orderStatus = newHotelInfo['orderStatus'],
                status_in = false;
            if (orderStatus) {
                //订单状态00:新建;01已下单;02已入住;03已离店;04已取消
                switch (orderStatus) {
                    case '00':
                        status_in = false;
                        break;
                    case '01':
                        status_in = false;
                        break;
                    case '02':
                        status_in = false;
                        break;
                    case '03':
                        status_in = true;
                        break;
                    default :
                        status_in = false;
                }
                newHotelInfo['status_in'] = status_in;
            }
        },
        parse: function (response) {
            if (response.flag) {
                return response.result;//newAieInfo newHotelInfo
            } else {
                return {errorMsg: response.message};
            }
        }
    });
    exports.indexOrderModel = new IndexOrder;
    //唯一订单对象
    var OrderList = require('./OrderModel').OrderList;
    exports.orderList = new OrderList;
    //可報銷訂單信息：
    exports.reimOrders = new OrderList({url: '/fcs/do/trip/json/OrderInfoQurey/orderInfoComplate'});

    //给工具页面传值（共享数据）
    var AddTrafficModel = Backbone.Model;
    exports.addTrafficModel = new AddTrafficModel;

    //给酒店页面传值(共享数据)
    var AddHotelModel = Backbone.Model;
    exports.addHotelModel = new AddHotelModel;

    //点击添加酒店的出差人（获得出差人）
    var AddEvectionModel = Backbone.Model;
    exports.addEvectionModel = new AddEvectionModel;

    //查询收款人（共享数据）
    var PaynameModel = Backbone.Model;
    exports.paynameModel = new PaynameModel;
    //查询状态
    var StateModel = Backbone.Model;
    exports.statesModel = new StateModel;

    var SearchReim = Backbone.Collection.extend({
//        model:Backbone.Model,
//       /fcs/do/trip/json/ExpenseAccountInfo/getTripHearderPayNameByUm
//        ?page=1&pageSize=60
//        url:'http://iqsz-d1189:7001/fcs/do/trip/json/ExpenseAccountInfo/getExpenseAccountList',
        pagesNum: 20,
        url: '/fcs/do/trip/json/ExpenseAccountInfo/getExpenseAccountList',
        search: function (options, page, pageSize) {
            var stateVal = options.tripStatus ? options.tripStatus : null;
            var nameVal = options.payeName ? options.payeName : null;
            if (stateVal == null && nameVal !== null) {
                this.fetch({data: {
                    startTime: options.startTime,
                    endTime: options.endTime,
                    payeName: nameVal,
                    page: page,
                    pageSize: pageSize
                }});
            } else if (stateVal !== null && nameVal == null) {
                this.fetch({data: {
                    startTime: options.startTime,
                    endTime: options.endTime,
                    tripStatus: stateVal,
                    page: page,
                    pageSize: pageSize
                }});
            } else if (stateVal == null && nameVal == null) {
                this.fetch({data: {
                    startTime: options.startTime,
                    endTime: options.endTime,
                    page: page,
                    pageSize: pageSize
                }});
            } else if (stateVal && nameVal) {
                this.fetch({data: {
                    startTime: options.startTime,
                    endTime: options.endTime,
                    tripStatus: stateVal,
                    payeName: nameVal,
                    page: page,
                    pageSize: pageSize
                }});
            }
        },
        fetchOther: function (options, page, pageSize) {
            this.search(options, page, pageSize);
        },
        fetchMore: function (page, pageSize) {
            this.fetch({
                reset: true,
                data: {
                    page: page,
                    pageSize: pageSize
                }
            })
            this.pagesNum = page*pageSize;
        },

//        url:'/fcs/mobile/service/payee.json',
//        url:'http://iqsz-d1189:7001/fcs/do/trip/json/ExpenseAccountInfo/getExpenseAccountList?startTime',
        parse: function (response) {
            var list = [];
            var count;
            if (response.flag === true) {
                if (response.result !== null) {
                    count = response.result.count;
                    list = list.concat(response.result.thdList);

                    if (this.pagesNum >= count) {
                        var ifPage = false;
                        window.localStorage.setItem('ifPage', ifPage);
                    } else {
                        window.localStorage.removeItem('ifPage');
                    }
                }
            } else if (response.flag === false) {
                window.localStorage.setItem('ifPage', ifPage);
                return response.message;
            }
            return list;
        }
    });
    exports.searchReim = new SearchReim();//

    var ShenpiModels = Backbone.Collection.extend({
        url: '/fcs/do/trip/json/ExpenseAccountInfo/getTripExpApproveSettList',
        parse: function (response) {
            var list = [];
            if (response.flag === true) {
                list = response.result.tripElecExpApproveList;
            } else if (response.flag === false) {
                list = [];
            }
            return list;
        }
    });
    exports.shenpiModel = new ShenpiModels();//
    var FilterModel = Backbone.Model.extend({
    });
    exports.filterModel = new FilterModel;

    var PayeeModel = Backbone.Model.extend({
        url: '/fcs/do/trip/json/ExpenseAccountInfo/getTripHearderPayNameByUm',
        pageNum:20,
        fetchAdd:function(page,pageSize){
            this.fetch({
                data:{
                    page:page,
                    pageSize:pageSize
                }
            })
            this.pageNum = pageSize*page;
        },
        parse: function (response) {
            if (response.flag == false) {
                alert(response.message);
            }
            if (response.flag == true) {
                if(this.pageNum>=response.result.count){
                    var nameSize= false;
                    window.localStorage.setItem('nameSize',nameSize);
                } else {
                    window.localStorage.removeItem('nameSize');
                }
                return response.result;
            }

        }
    });
    exports.payeeModel = new PayeeModel();
});
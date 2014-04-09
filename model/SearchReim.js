/**
 * Created by EX-ZHONGYUBIN001 on 13-12-18.
 */
define(function(require,exports){
    var Backbone = require('backbone');
    var SearchReim=Backbone.Collection.extend({
//        model:Backbone.Model,
        url:'/fcs/do/trip/json/ExpenseAccountInfo/getExpenseAccountList',
        parse: function (response) {
            var list = [];
            if(response.flag===true){
               list = response.result.thdList;
            }else if(response.flag===false){
                list=[];
            }
            return list;
        }
    });
    exports.searchReim=new SearchReim();//
//    return SearchReim;
});
/**
 * Created by EX-ZHONGYUBIN001 on 13-12-16.
 */
define(function(require,exports){
    var Backbone = require('backbone');
    var UserInfo=Backbone.Model.extend({
        url:'/fcs/do/trip/json/UserInfo/getUser/?isSecret=Y',
        parse: function (response) {
            if(response.flag===true){
                return response.result;
            }else{
                return response;
            }
        }
    });
    exports.userInfo=new UserInfo;

    var UserNumber=Backbone.Model.extend({
        url:'/fcs/do/trip/json/UserInfo/getUser/?isSecret=N',
        parse: function (response) {
            if(response.flag===true){
                return response.result;
            }else{
                return response;
            }
        }
    });
    exports.userNumber=new UserNumber;;
});
/**
 * Created by EX-LIUZHAN001 on 13-12-20.
 */
define(function(require, exports){
    var Backbone = require('backbone');
    var RegisterUser = Backbone.Model.extend({
        checkUmUrl: '/fcs/do/common/json/Register/checkUm',
        checkPhoneUrl: '/fcs/do/common/json/Register/checkPhoneNumber',
        dynamicUrl: '/fcs/do/common/json/CreateDynamicPassword/register',
        registerUrl: '/fcs/do/common/json/Register/',
        defaults:{
            'payeeNo':'小A',
            'department':'开发三部',
            'bookset':'平安科技',
            'traveller':'小C'
        }
    });
    exports.registerUser = new RegisterUser();
    var LoginUser = Backbone.Model.extend({
        defaults:{
            'payeeNo':'小A',
            'department':'开发三部',
            'bookset':'平安科技',
            'traveller':'小C'
        }
    });
    exports.loginUser = new LoginUser();
});
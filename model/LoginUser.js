define(function (require) {
    var Backbone = require('backbone');
    var User = Backbone.Model.extend({
        url: '/fcs/j_security_check',
        PWD_REGEX: /^[a-zA-Z0-9]{6,16}$/,
        MOBILE_REGEX: /^1[3|4|5|6|8][0-9]\d{8}$/,
        defaults: {
            login_result: false,
            error_msg: '未登录'
        },
        checkMobile: function (phoneNumber) {
            this.abstractCheck({
                field: phoneNumber,
                regex: this.MOBILE_REGEX,
                request: false,
                emptyMsg: '手机号不能为空！',
                invalidMsg: '手机号格式有误!',
                eventName: 'name_check'
            });
        },
        checkPwd: function (password) {
            this.abstractCheck({
                field: password,
                regex: this.PWD_REGEX,
                request: false,
                emptyMsg: '密码不能为空！',
                invalidMsg: '密码只能为6-16位',
                eventName: 'pwd_check'
            });
        },
        //blur触发的验证，抽象逻辑方法
        abstractCheck: function (options) {
            var field = options.field, request = options.request, result, checkOther = options.checkOther;
            if (!!field) {
                if (!options.regex.test(field)) {
                    result = {flag: false, message: options.invalidMsg};
                    this.trigger(options.eventName, result);
                } else {
                    if (!!checkOther) {
                        if (!checkOther.apply(this)) {
                            result = {flag: false, message: options.otherMsg};
                            this.trigger(options.eventName, result);
                        } else {
                            request && request.call(this, field);
                            this.trigger(options.eventName, {flag: true, message: '其他校验通过！'});
                        }
                    } else {
                        request && request.call(this, field);
                        this.trigger(options.eventName, {flag: true, message: '格式校验通过！'});
                    }
                }
            }
            else{//为空不触发校验, 并移除标识
                this.trigger(options.eventName, {flag: true, remove: true});
            }
        },
        validateUserName: function (j_username) {
            return this.MOBILE_REGEX.test(j_username);
        },
        validatePassword: function (j_password) {
            return this.PWD_REGEX.test(j_password);
        },
        doLogin: function(j_username, j_password){
            return this.save({
                j_username: j_username,
                j_password: j_password
            }, {data: this.attributes})
        },
        //客户端验证逻辑(比如必须为邮箱名，密码正则校验等等)
        validate: function (attributes) {
            var message;
            if (!attributes) {
                message = 'model出错!';
            } else if(!attributes.j_username){
                message = '手机号不能为空!';
            } else if(!attributes.j_password){
                message = '密码不能为空!';
            } else if (!this.validateUserName(attributes.j_username)) {
                message = '手机号格式有误！';
            } else if (!this.validatePassword(attributes.j_password)) {
                message = '密码格式有误!';
            } else{
                this.trigger('valid');
            }
            return message;
        },
        parse: function (response, options) {
            return {
                j_username: options.data&&options.data['j_username'],
                j_password: options.data&&options.data['j_password'],
                login_result: response.code==='1',
                error_msg: response.msg
            };
        }
    });
    return User;
});
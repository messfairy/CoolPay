define(function (require) {
    var Backbone = require('backbone');
    var MobileUpdateModel = Backbone.Model.extend({
        defaults: {
            send_ok: false
        },
        actionUrl: '/checkLoginPwd',
        urlRoot: '/fcs/do/common/json/CreateDynamicPassword',
        MOBILE_REGEX: /^1[3|4|5|6|8][0-9]\d{8}$/,
        PWD_REGEX: /^[a-zA-Z0-9]{6,16}$/,
        DYNAMIC_CODE_REGEX: /^[0-9]{6}$/,
        PWD_CHECK_URL: '/checkPassword/',
        DYNAMIC_SEND_URL: '/changePhone/',
        MOBILE_UPDATE_URL: '/changePhoneNumber',
        url: function () {
            return this.urlRoot + this.actionUrl;
        },
        validate: function (attributes) {
            var message;
            if (!attributes) {
                message = '手机信息有误，请重输!';
            } else if (!attributes['password']) {
                message = '请输入密码！';
            } else if (!attributes['newPhoneNumber']) {
                message = '请输入新手机号！';
            } else if (!attributes['dynamicPassword']) {
                message = '请输入动态验证码！';
            } else if (!this.validByRegex(attributes['password'], this.PWD_REGEX)) {
                message = '登录密码格式有误';
            } else if (!this.validByRegex(attributes['newPhoneNumber'], this.MOBILE_REGEX)) {
                message = '手机号格式有误!';
            } else if (!this.validByRegex(attributes['dynamicPassword'], this.DYNAMIC_CODE_REGEX)) {
                message = '短信验证码格式有误!';
            } else if (!attributes['password_ok']) {
                message = '请验证登录密码!';
            } else if (!attributes['send_ok']) {
                message = '请发送验证码!';
            }
            return message;
        },
        validByRegex: function (field, regex) {
            return regex.test(field);
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
                        }
                    } else {
                        request && request.call(this, field);
                    }
                }
            }
        },
        checkLoginPwd: function (loginPwd) {
            this.abstractCheck({
                field: loginPwd,
                regex: this.PWD_REGEX,
                request: false,
                otherMsg: '登录密码错误，请重新验证！',
                emptyMsg: '登录密码不能为空！',
                invalidMsg: '密码只能为6-16位!',
                eventName: 'check_error'
            });
        },
        checkMobile: function (mobileNo) {
            this.abstractCheck({
                field: mobileNo,
                regex: this.MOBILE_REGEX,
                request: this.requestMobile,
                emptyMsg: '手机号不能为空！',
                invalidMsg: '手机号格式有误!',
                eventName: 'check_error'
            });
        },
        checkDynamic: function (dynamicPassword) {
            this.abstractCheck({
                field: dynamicPassword,
                regex: this.DYNAMIC_CODE_REGEX,
                request: false,
                emptyMsg: '短信验证码不能为空！',
                invalidMsg: '短信验证码为6位数字!',
                eventName: 'check_error'
            });
        },
        //后台校验登录密码
        requestLoginPwd: function (password) {
            this.actionUrl = this.PWD_CHECK_URL + password;
            if (!this.validByRegex(password, this.PWD_REGEX)) {
                this.trigger('check_error', {flag: false, message: '密码不少于6-16位!'});
            } else {
                return this.save(null, {action: 'check_pwd', validate: false});
            }
        },
        sendDynamic: function (newMobile) {
            var send_ok = this.get('send_ok');
            if (!newMobile) {
                this.trigger('check_error', {flag: false, message: '请输入手机号！'});
            } else if (send_ok) {
                this.trigger('check_error', {flag: false, message: '验证码不能重复发送！'});
            } else if (!this.validByRegex(newMobile, this.MOBILE_REGEX)) {
                this.trigger('check_error', {flag: false, message: '手机号格式有误！'});
            } else {
                this.actionUrl = this.DYNAMIC_SEND_URL + newMobile;
                return this.fetch({action: 'send_dynamic'});
            }
        },
        updateMobile: function (loginPwd, newMobile, dynamicCode) {
            this.actionUrl = this.MOBILE_UPDATE_URL;
            var dynamicPasswordId = this.get('dynamicPasswordId');
            return this.save({password: loginPwd, newPhoneNumber: newMobile,
                    dynamicPasswordId: dynamicPasswordId, dynamicPassword: dynamicCode},
                {action: 'update_mobile', data: this.attributes});
        },
        parse: function (response, options) {
            var action = options['action'];
            if (response.flag) {
                switch (action) {
                    case 'check_pwd':
                        this.set('password_ok', true).trigger('password_ok', this, '密码验证通过！');
                        break;
                    case 'send_dynamic':
                        this.set('send_ok', true).trigger('send_ok', this, '发送验证码成功，请检查短信息！');
                        this.set('dynamicPasswordId', response.result);
                        break;
                    case 'update_mobile':
                        this.set('update_ok', true).trigger('update_ok', this, '手机更新成功！');
                    default : ;
                }
            } else {
                //请求失败!
                this.trigger('rpc_error', {flag: false, message: response.message});
            }
        }
    });
    return MobileUpdateModel;
});
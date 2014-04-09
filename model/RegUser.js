define(function (require) {
    var Backbone = require('backbone');
    var UserRegister = Backbone.Model.extend({
        urlRoot: '/fcs/do/common/json',
        actionUrl: '/Register/checkUm',  //默认为um检查url
        UM_CHECK_URL: '/Register/checkUm',
        MOBILE_CHECK_URL: '/Register/checkPhoneNumber',
//        DYNAMIC_FETCH_URL: '/CreateDynamicPassword/register',
        DYNAMIC_FETCH_URL: '/DynamicPassword/register',
        REGISTER_SAVE_URL: '/Register/',
        UM_REGEX: /^[a-zA-Z0-9]+$/,
        PWD_REGEX: /^[a-zA-Z0-9]{6,16}$/,
        MOBILE_REGEX: /^1[3|4|5|6|8][0-9]\d{8}$/,
        DYNAMIC_CODE_REGEX: /^[0-9]{6}$/,
        defaults: {
            //校验请求参数
            um: '',
            phoneNumber: '',
            businessId: '',
            receiverPhone: '',
            //注册请求参数
            cnName: '',
            password: '',
            password2: '',
            dynamicPassword: '',
            dynamicPasswordId: '',
            //响应结果
            um_ok: false,
            mobile_ok: false,
            send_ok: false,
            register_ok: false,
            //响应信息
            success_msg: '',
            error_msg: ''
        },
        url: function () {
            return this.urlRoot + this.actionUrl;
        },
        parse: function (response, options) {
            var attributes = {}, result_flag = response.code, action = options.action;
            if (result_flag === '1') {
                switch (action) {
                    case 'check_um':
                        attributes.um_ok = true;
                        attributes.success_msg = '检查um成功,' + response.data;
                        attributes.cnName = response.data;
                        this.trigger('um_ok', attributes, true);
                        break;
                    case 'check_mobile':
                        attributes.mobile_ok = true;
                        attributes.success_msg = response.msg;
                        this.trigger('mobile_ok', attributes, true);
                        break;
                    case 'send_dynamic':
                        attributes.send_ok = true;
                        attributes.success_msg = '获取验证码成功!';
                        attributes.dynamicPasswordId = response.data;
                        this.trigger('send_ok', attributes, true);
                        break;
                    case 'register_user':
                        attributes.register_ok = true;
                        attributes.success_msg = '注册成功!';
                        this.trigger('register_ok', attributes, true);
                        break;
                    default : ;
                }
            } else {
                switch (action) {
                    case 'check_um':
                        attributes.um_ok = false;
                        attributes.error_msg = response.msg;
                        this.trigger('um_ok', attributes, false);
                        break;
                    case 'check_mobile':
                        attributes.mobile_ok = false;
                        attributes.error_msg = response.msg;
                        this.trigger('mobile_ok', attributes, false);
                        break;
                    case 'send_dynamic':
                        attributes.send_ok = false;
                        attributes.error_msg = response.msg;
                        break;
                    case 'register_user':
                        attributes.register_ok = false;
                        attributes.error_msg = response.msg;
                    default : ;
                }
                //获取验证码失败!
                this.trigger('rpc_error', attributes, false);
            }
            return attributes;
        },
        checkUm: function (um) {
            this.set('um', um);
            this.abstractCheck({
                field: um,
                regex: this.UM_REGEX,
                request: this.requestUm,
                emptyMsg: 'UM不能为空！',
                invalidMsg: 'UM由数字和字母组成！',
                eventName: 'invalid_um'
            });
        },
        checkPwd: function (password) {
            this.set('password', password);
            this.abstractCheck({
                field: password,
                regex: this.PWD_REGEX,
                request: false,
                emptyMsg: '密码不能为空！',
                invalidMsg: '密码只能为6-16位',
                eventName: 'invalid_pwd'
            });
        },
        checkPwd2: function (password) {
            this.set('password2', password);
            var checkPwdSame = function () {
                return this.get('password') === this.get('password2')
            }
            this.abstractCheck({
                field: password,
                regex: this.PWD_REGEX,
                checkOther: checkPwdSame,
                request: false,
                emptyMsg: '确认密码不能为空！',
                invalidMsg: '确认密码只能为6-16位',
                otherMsg: '密码不一致！',
                eventName: 'invalid_pwd2'
            });
        },
        checkMobile: function (phoneNumber) {
            this.set('phoneNumber', phoneNumber);
            this.abstractCheck({
                field: phoneNumber,
                regex: this.MOBILE_REGEX,
                request: this.requestMobile,
                emptyMsg: '手机号不能为空！',
                invalidMsg: '手机号格式有误!',
                eventName: 'invalid_mobile'
            });
        },
        checkDynamic: function (dynamicPassword) {
            this.set('dynamicPassword', dynamicPassword);
            this.abstractCheck({
                field: dynamicPassword,
                regex: this.DYNAMIC_CODE_REGEX,
                request: false,
                emptyMsg: '验证码不能为空！',
                invalidMsg: '验证码为6位数字!',
                eventName: 'invalid_dynamic'
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
        validByRegex: function (field, regex) {
            return regex.test(field);
        },
        //注册前，统一验证前端逻辑(比如必须为邮箱名，密码正则校验等等)
        validate: function (attributes) {
            var message;
            if (!attributes) {
                message = '用户信息有误，请重输!';
            } else if (!attributes.um) {
                message = 'UM号码不能为空!';
            } else if (!attributes.password) {
                message = '密码不能为空!';
            } else if (!attributes.password2) {
                message = '确认密码不能为空!';
            } else if (!attributes.dynamicPassword) {
                message = '验证码不能为空!';
            } else if (!attributes.phoneNumber) {
                message = '手机号不能为空!';
            } else if (!this.validByRegex(attributes.um, this.UM_REGEX)) {
                message = 'UM号码格式有误!';
            } else if (!this.validByRegex(attributes.password, this.PWD_REGEX)) {
                message = '密码格式错误!';
            } else if (!this.validByRegex(attributes.password2, this.PWD_REGEX)) {
                message = '确认密码格式错误!';
            } else if (attributes.password !== attributes.password2) {
                message = '密码不一致!';
            } else if (!this.validByRegex(attributes.phoneNumber, this.MOBILE_REGEX)) {
                message = '请输入手机号!';
            } else if (!attributes.send_ok) {
                message = '请发送验证码!';
            } else if (!this.validByRegex(attributes.dynamicPassword, this.DYNAMIC_CODE_REGEX)) {
                message = '验证码为6位数字!';
            } else{
               this.trigger('valid');
            }
            return message;
        },
        //后台校验UM
        requestUm: function (j_username) {
            this.actionUrl = this.UM_CHECK_URL + '?um=' + j_username.toUpperCase();
            return this.fetch({action: 'check_um'});
        },
        //后台校验手机号
        requestMobile: function (phoneNumber) {
            this.actionUrl = this.MOBILE_CHECK_URL + '?phoneNumber=' + phoneNumber;
            return this.fetch({action: 'check_mobile'});
        },
        //后台发送验证码
        sendDynamic: function (um, mobile) {
            var mobile_ok = this.get('mobile_ok');
            var send_ok = this.get('send_ok');
            var um_ok = this.get('um_ok');
            if(!um||!mobile){
                this.trigger('invalid', this, '请输入um号和手机号，再发送验证码');
            }else if(!um_ok){
                this.trigger('invalid', this, 'UM号验证失败，请修改！');
            }else if(!mobile_ok){
                this.trigger('invalid', this, '手机号验证失败，请修改！');
            }else if(send_ok){
                this.trigger('invalid', this, '验证码不能重复发送！');
            }else{
                this.actionUrl = this.DYNAMIC_FETCH_URL + '?businessId=' + um + '&receiverPhone=' + mobile;
                return this.fetch({action: 'send_dynamic'});
            }
        },
        //注册用户
        register: function (params) {
            this.actionUrl = this.REGISTER_SAVE_URL;
            //返回xhr的deferred对象
            return this.save(params, {action: 'register_user', data: this.attributes});
        }
    });
    return UserRegister;
});
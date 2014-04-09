define(function (require, exports) {
    var Backbone = require('backbone');
    var PwdModel = Backbone.Model.extend({
        PWD_REGEX: /^[a-zA-Z0-9]{6,16}$/,
        UM_REGEX: /^[a-zA-Z0-9]+$/,
        MOBILE_REGEX: /^1[3|4|5|6|8][0-9]\d{8}$/,
        DYNAMIC_CODE_REGEX: /^[0-9]{6}$/,
        urlRoot: '/fcs/do/common/json/CreateDynamicPassword', //todo
        actionUrl: '/reset',
        DYNAMIC_SEND_URL: '/reset',
        PWD_UPDATE_URL: '/updatePassword',
        PWD_RESET_URL: '/resetPassword',
        url: function () {
            return this.urlRoot + this.actionUrl;
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
        checkNew: function (newPwd) {
            this.set('newPwd', newPwd);
            //新旧密码不能相同
            var isCurrentNew = function () {
                return this.get('oldPwd') !== this.get('newPwd');
            };
            this.abstractCheck({
                field: newPwd,
                regex: this.PWD_REGEX,
                request: false,
                emptyMsg: '新密码不能为空！',
                invalidMsg: '新密码只能为6-16位',
                checkOther: isCurrentNew,
                otherMsg: '新旧密码不能相同',
                eventName: 'check_error'
            });
        },
        checkNew2: function (newPwd2) {
            this.set('newPwd2', newPwd2);
            //两次密码输入须一致
            var checkPwdSame = function () {
                return this.get('newPwd') === this.get('newPwd2')
            }
            this.abstractCheck({
                field: newPwd2,
                regex: this.PWD_REGEX,
                checkOther: checkPwdSame,
                request: false,
                emptyMsg: '新确认密码不能为空！',
                invalidMsg: '新确认密码只能为6-16位',
                otherMsg: '新确认密码不一致！',
                eventName: 'check_error'
            });
        }
    });
    //修改密码
    var PwdUpdateModel = PwdModel.extend({
        validate: function (attributes) {
            var message;
            if (!attributes) {
                message = '密码信息有误，请重输!';
            } else if (!attributes.oldPwd) {
                message = '原密码不能为空!';
            } else if (!attributes.newPwd) {
                message = '新密码不能为空!';
            } else if (!attributes.newPwd2) {
                message = '确认新密码不能为空!';
            } else if (!this.validByRegex(attributes.oldPwd, this.PWD_REGEX)) {
                message = '原密码格式错误!';
            } else if (!this.validByRegex(attributes.newPwd, this.PWD_REGEX)) {
                message = '新密码格式错误!';
            } else if (!this.validByRegex(attributes.newPwd2, this.PWD_REGEX)) {
                message = '确认新密码格式错误!';
            } else if (attributes.newPwd2 !== attributes.newPwd) {
                message = '两次密码不一致!';
            } else if (attributes.oldPwd === attributes.newPwd) {
                message = '新旧密码不能相同!';
            }
            return message;
        },
        checkCurrent: function (oldPwd) {
            this.set('oldPwd', oldPwd).abstractCheck({
                field: oldPwd,
                regex: this.PWD_REGEX,
                request: false,
                emptyMsg: '原密码不能为空！',
                invalidMsg: '原密码只能为6-16位',
                eventName: 'check_error'
            });
        },
        updatePwd: function (oldPwd, newPwd, newPwd2) {
            this.actionUrl = this.PWD_UPDATE_URL;
            return this.save({oldPwd: oldPwd, newPwd: newPwd, newPwd2: newPwd2}, {data: this.attributes});
        },
        parse: function (response) {
            if(response.flag){
                this.trigger('update_ok', response);
            }else{
                this.trigger('update_fail', response);
            }
        }
    });
    exports.pwdUpdate = new PwdUpdateModel;

    //重置密码
    var PwdResetModel = PwdModel.extend({
        defaults: {
            send_ok: false
        },
        validate: function (attributes) {
            var message;
            if (!attributes) {
                message = '密码信息有误，请重输!';
            } else if (!attributes.dynamicPassword) {
                message = '验证码不能为空!';
            } else if (!attributes.prepassword) {
                message = '新密码不能为空!';
            } else if (!attributes.newPwd2) {
                message = '确认密码不能为空!';
            } else if (!this.validByRegex(attributes.dynamicPassword, this.DYNAMIC_CODE_REGEX)) {
                message = '短信验证码格式有误!';
            } else if (!this.validByRegex(attributes.prepassword, this.PWD_REGEX)) {
                message = '新密码格式错误!';
            } else if (!this.validByRegex(attributes.newPwd2, this.PWD_REGEX)) {
                message = '确认新密码格式错误!';
            } else if (attributes.newPwd2 !== attributes.newPwd) {
                message = '两次密码不一致!';
            } else if (!attributes['send_ok']) {
                message = '请点击发送验证码!';
            } else {
                this.trigger('valid');
            }
            return message;
        },
        checkUm: function (um) {
            this.set('um', um);
            this.abstractCheck({
                field: um,
                regex: this.UM_REGEX,
                request: false,
                emptyMsg: 'UM不能为空！',
                invalidMsg: 'UM由数字和字母组成！',
                eventName: 'check_error'
            });
        },
        checkMobile: function (mobileNo) {
            this.set('mobileNo', mobileNo);
            this.abstractCheck({
                field: mobileNo,
                regex: this.MOBILE_REGEX,
                request: false,
                emptyMsg: '手机号不能为空！',
                invalidMsg: '手机号格式有误!',
                eventName: 'check_error'
            });
        },
        checkDynamic: function (dynamicPassword) {
            this.set('dynamicPassword', dynamicPassword);
            this.abstractCheck({
                field: dynamicPassword,
                regex: this.DYNAMIC_CODE_REGEX,
                request: false,
                emptyMsg: '短信验证码不能为空！',
                invalidMsg: '短信验证码为6位数字!',
                eventName: 'check_error'
            });
        },
        //参数：um号码，手机号
        sendDynamic: function (um, receiverPhone) {
            this.actionUrl = this.DYNAMIC_SEND_URL;
            var send_ok = this.get('send_ok');
            if (send_ok) {
                this.trigger('invalid', this, '验证码不能重复发送！');
            } else if (!um||!receiverPhone) {
                this.trigger('invalid', this, '发送验证码前请输入手机号和UM号!');
            } else {
                return this.fetch({valid_event: 'send_ok', data: {umName: um, phoneNumber: receiverPhone}});
            }
        },
        resetPwd: function (options) {
            this.actionUrl = this.PWD_RESET_URL;
            var attributes = {
                umName: options.umName,
                phoneNumber: options.mobileNo,
                prepassword: options.newPwd,
                newPwd2:  options.newPwd2,
                dynamicPassword: options.dynamicPassword,
                dynamicPasswordId: this.get('dynamicPasswordId')
            };
            return this.save(attributes, {valid_event: 'reset_ok', data: attributes});
        },
        parse: function (response, options) {
            if (response.flag) {
                var event = options.valid_event;
                if ('send_ok' === event) {//发送验证码返回
                    this.set('send_ok', true).trigger('send_ok', this, '发送验证码成功，请检查短信息！');
                    this.set('dynamicPasswordId', response.result);
                }else if('reset_ok' === event) {//找回密码返回
                    this.trigger(event, response.message);
                }
            } else {
                this.trigger('fail', false, response.message);
            }
        }
    });
    exports.pwdReset = new PwdResetModel;
});
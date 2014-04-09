/**
 * ViewHelper
 */
define(function (require, exports) {
    var _ = require('underscore'),
        Handlebars = require('handlebars');
    //加载datescroll picker
    exports.datepicker = function (options) {
        require('datetime');
        require('themes-zhCN');
        var options = options || {startSelector: '#J_StartDate', endSelector: '#J_EndDate'},
            startSelector = options.startSelector,
            endSelector = options.endSelector,
            date = new Date();
        $(startSelector + ',' + endSelector).mobiscroll().date({
            theme: 'default',
            lang: 'zh',
            display: 'bottom',
            mode: 'scroller',
            dateOrder: 'yymmdd',
            dateFormat: 'yy-mm-dd',
            startYear: date.getFullYear() - 100,
            endYear: date.getFullYear() + 20,
            invalid: [ 'w0', 'w6', '5/1', '12/24', '12/25' ]
        });
    };
    exports.showLoading = function () {
        var loadingView = require('../shareViews').loadingView;
        loadingView.show();
    };
    exports.hideLoading = function () {
        var loadingView = require('../shareViews').loadingView;
        loadingView.hide();
    };
    //单页面显示提示信息
    exports.showTips = function (valid, message) {
        var tipsView = require('../shareViews').tipsView;
        if (valid) {
            tipsView.showSuccessTips(message);
        } else {
            tipsView.showErrorTips(message);
        }
    };
    exports.formatDate = function (date, dateFormat) {
        var dateFormat = dateFormat || 'yyyy-MM-dd';
        try {
            var XDate = require('xdate');
            var dateString = new XDate(date).toString(dateFormat);
        } catch (error) {
            return date;
        }
        return dateString;
    };
    exports.registerHelper = function () {
        Handlebars.registerHelper('hotelSplit', function (order) {
            if(order.leaveAmount !== order.realCash){
                return 'order-record-enable';
            }else{
                return 'order-record-disable';
            }
        });

        Handlebars.registerHelper('showTime', function (time) {
            if (time) {
                return time.substring(0, 2) + ':' + time.substring(2);
            } else {
                return '';
            }
        });
        Handlebars.registerHelper('showPsgNames', function (psgNames) {
            var html = '';
            _.each(psgNames, function (psgName) {
                html += '<p>乘机人: ' + psgName + '</p>';
            });
            return html;
        });
        Handlebars.registerHelper('showOrders', function (order) {
            var psgNames = order.psgNames, html = '';
            _.each(psgNames, function (psgName) {
                html += '<p>' + psgName + '</p>';
            });
            return html;
        });
        Handlebars.registerHelper('getMeans', function (map) {
            var means = map[0] ? map[0].means : '';
            return means;
        });
        Handlebars.registerHelper('getPrice', function (price, day) {
            return price * day;
        });
        Handlebars.registerHelper('getNumber', function (number) {
            return number|0;
        });
        Handlebars.registerHelper('getChinese', function (tripSequence) {
            if ('00' === tripSequence) {
                tripSequence = '去程';
            } else if ('01' === tripSequence) {
                tripSequence = '返程';
            }
            return tripSequence;
        });
        Handlebars.registerHelper('totalPrice', function (preCash) {
            return 3 * preCash;
        });

        Handlebars.registerHelper('getRide', function (order) {
            var isRide = order.isRide;
            var toSharePersonUm = order.toSharePersonUm;
            if ('01' === isRide && toSharePersonUm == null) {
                return new Handlebars.SafeString('<div class="content-footer"><input type="button" class="btn-css btn-cancel" id="go-share" value="拆单"></p></div>')
            } else if ('01' === isRide && toSharePersonUm !== null) {
                return new Handlebars.SafeString('<div class="content-footer"><input type="button" class="btn-css btn-cancel" id="show-share" value="查看拆单详情"></p></div>')
            }

        });
        Handlebars.registerHelper('showRide', function (isRide) {
            if ('01' === isRide) {
                isRide = '已乘坐';
            } else if ('00' === isRide) {
                isRide = '未乘坐';
            }
            return isRide;
        });
        Handlebars.registerHelper('getOpType', function (opType) {
            switch (opType) {
                case '00':
                    opType = '新建订单';
                    break;
                case '01':
                    opType = '改签';
                    break;
                default :
                    opType = '退票';
            }
            return opType;
        });
        Handlebars.registerHelper('showOrderStatus', function (order) {
            var orderStatus = order.orderStatus;
            var leaveAmount = order.leaveAmount;
            var realCash = order.realCash;
             if ('03' == orderStatus) {
                if (leaveAmount == null || leaveAmount==realCash) {
                    return new Handlebars.SafeString('<div class="content-footer"><input type="button" class="btn-css btn-cancel" id="go-split" value="拆单"></p></div>');
                } else if (leaveAmount > 0 && (leaveAmount != realCash)) {
                    return new Handlebars.SafeString('<div class="content-footer"><input type="button" class="btn-css btn-cancel" id="go-split" value="拆单"></p></div>+' +
                        '<div class="content-footer"><input type="button" class="btn-css btn-cancel" id="show-split" value="查看拆单详情"></p></div>');
                } else if (leaveAmount == 0) {
                    return new Handlebars.SafeString('<div class="content-footer"><input type="button" class="btn-css btn-cancel" id="show-split" value="查看拆单详情"></p></div>');
                }
            }

        });

        //报销审批状态翻译
        Handlebars.registerHelper('getTripStatus', function (tripStatus) {
            switch (tripStatus) {
                case 'PAY_SUCCESS':
                    tripStatus = '支付成功';
                    break;
                case 'PAY_FAILED':
                    tripStatus = '支付失败'
                    break;
                case 'INPROCESS':
                    tripStatus = '待匹配扫描影像';
                    break;
                case 'EOA_APPROVING':
                    tripStatus = '待领导审批';
                    break;
                case 'INCOMPLETE':
                    tripStatus = '已保存';
                    break;
                case 'PREPROCESS':
                    tripStatus = '待部门预算员审批';
                    break;
                case 'BUDGET_REJECTED':
                    tripStatus = '部门预算员退回';
                    break;
                case 'EOA_REJECTED':
                    tripStatus = '领导审批退回';
                    break;
                case 'CENTER_APPROVING':
                    tripStatus = '中心作业中';
                    break;
                case 'REJECTED':
                    tripStatus = '中心退回';
                    break;
                case 'PAY_BACK':
                    tripStatus = '待员工还款';
                    break;
                case 'COMPLETED':
                    tripStatus = '完成';
                    break;
                case 'PAYING':
                    tripStatus = '待支付';
                    break;
            }
            return tripStatus;
        });
        Handlebars.registerHelper('getDeptPrincipal', function (deptPrincipal) {
            if (deptPrincipal) {
                deptPrincipal = deptPrincipal + '-';
            } else {
                deptPrincipal = '';
            }
            return deptPrincipal;
        });

        Handlebars.registerHelper('getFilialeManager', function (filialeManager) {
            if (filialeManager) {
                filialeManager = filialeManager + '-';
            } else {
                filialeManager = '';
            }
            return filialeManager;
        });
        Handlebars.registerHelper('getPrincipal', function (principal) {
            if (principal) {
                principal = principal + '-';
            } else {
                principal = '';
            }
            return principal;
        });
        Handlebars.registerHelper('getFinancialPrincipal', function (financialPrincipal) {
            if (financialPrincipal) {
                financialPrincipal = financialPrincipal + '-';
            } else {
                financialPrincipal = '';
            }
            return financialPrincipal;
        });
        Handlebars.registerHelper('getChName', function (chName) {
            if (chName) {
                chName = chName + '-';
            } else {
                chName = '';
            }
            return chName;
        });
        Handlebars.registerHelper('getTime', function (dateCreated) {
            if (dateCreated) {
                dateCreated = dateCreated.toString().trim().substring(0, 10);
                return dateCreated;
            }
        });
        Handlebars.registerHelper('showPerson', function (order) {
            var orderStatus = order.orderStatus,
                realPerson = order.realPerson,
                prePerson = order.prePerson
            if (orderStatus == '03' || orderStatus == '02') {
                return realPerson;
            } else {
                return prePerson;
            }

        });
    };
});
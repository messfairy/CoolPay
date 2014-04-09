define(function(require){
    var $ = require('zepto');
    //android
    $.mobiscroll.themes.android = {
        dateOrder: 'Mddyy',
        mode: 'clickpick',
        height: 50,
        showLabel: false
    };

    //android-ics
    var theme = {
        dateOrder: 'Mddyy',
        mode: 'mixed',
        rows: 5,
        minWidth: 70,
        height: 36,
        showLabel: false,
        useShortLabels: true
    };
    $.mobiscroll.themes['android-ics'] = theme;
    $.mobiscroll.themes['android-ics light'] = theme;

    //ios
    $.mobiscroll.themes.ios = {
        dateOrder: 'MMdyy',
        rows: 5,
        height: 30,
        minWidth: 55,
        headerText: false,
        showLabel: false,
        btnWidth: false,
        useShortLabels: true
    };

    //windows phone
    var anim;
    $.mobiscroll.themes.wp = {
        minWidth: 70,
        height: 76,
        accent: 'none',
        dateOrder: 'mmMMddDDyy',
        headerText: false,
        showLabel: false,
        btnWidth: false,
        onAnimStart: function (dw, i, time) {
            $('.dwwl' + i, dw).addClass('wpam');
            clearTimeout(anim[i]);
            anim[i] = setTimeout(function () {
                $('.dwwl' + i, dw).removeClass('wpam');
            }, time * 1000 + 100);
        },
        onMarkupInserted: function (elm, inst) {
            var click,
                active;

            anim = {};

            $('.dw', elm).addClass('wp-' + inst.settings.accent);

            //$('.dwwl', elm).on('touchstart mousedown DOMMouseScroll mousewheel', function () {
            $('.dwwl', elm).on('touchstart mousedown DOMMouseScroll mousewheel', '.dw-sel', function () {
                click = true;
                active = $(this).closest('.dwwl').hasClass('wpa');
                $('.dwwl', elm).removeClass('wpa');
                $(this).closest('.dwwl').addClass('wpa');
            }).on('touchmove mousemove', function () {
                    click = false;
                }).on('touchend mouseup', function () {
                    if (click && active) {
                        $(this).closest('.dwwl').removeClass('wpa');
                    }
                });
        },
        onThemeLoad: function (lang, s) {
            if (lang && lang.dateOrder && !s.dateOrder) {
                var ord = lang.dateOrder;
                ord = ord.match(/mm/i) ? ord.replace(/mmMM|mm|MM/,  'mmMM') : ord.replace(/mM|m|M/,  'mM');
                ord = ord.match(/dd/i) ? ord.replace(/ddDD|dd|DD/,  'ddDD') : ord.replace(/dD|d|D/,  'dD');
                s.dateOrder = ord;
            }
        }
    };

    $.mobiscroll.themes['wp light'] = $.mobiscroll.themes.wp;

    $.mobiscroll.i18n.zh = $.extend($.mobiscroll.i18n.zh, {
        // Core
        setText: '确定',
        cancelText: '取消',
        clearText: '明确',
        selectedText: '选',
        // Datetime component
        dateFormat: 'dd/mm/yy',
        dateOrder: 'ddmmyy',
        dayNames: ['周日','周一','周二','周三','周四','周五','周六'],
        dayNamesShort: ['日','一','二','三','四','五','六'],
        dayText: '日',
        hourText: '时',
        minuteText: '分',
        monthNames: ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'],
        monthNamesShort: ['一','二','三','四','五','六','七','八','九','十','十一','十二'],
        monthText: '月',
        secText: '秒',
        timeFormat: 'HH:ii',
        timeWheels: 'HHii',
        yearText: '年',
        nowText: '当前',
        // Calendar component
        dateText: '日',
        timeText: '时间',
        calendarText: '日历',
        closeText: '关闭',
        // Daterange component
        fromText: 'Start',
        toText: 'End',
        // Measurement components
        wholeText: 'Whole',
        fractionText: 'Fraction',
        unitText: 'Unit',
        // Time / Timespan component
        labels: ['Years', 'Months', 'Days', 'Hours', 'Minutes', 'Seconds', ''],
        labelsShort: ['Yrs', 'Mths', 'Days', 'Hrs', 'Mins', 'Secs', ''],
        // Timer component
        startText: 'Start',
        stopText: 'Stop',
        resetText: 'Reset',
        lapText: 'Lap',
        hideText: 'Hide'
    });
})
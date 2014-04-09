/**
 * Created by EX-LIXUEWEN001 on 13-12-26.
 */
define(function (require) {
    var Backbone = require('backbone'),
        Handlebars = require('handlebars');
    var ReimHotelEvectionView = Backbone.View.extend({
        el: '#J_Container',
        events: {
            'tap .J_Evection': 'selectEvection',
            'tap #J_evection_submit': 'submit'
        },
        initialize: function (options) {
            this.appRouter = options.appRouter;
            this.model = options.model;
            var $ = Backbone.$;
            this._ = require('underscore');
            this.AddEvectionTemplate = Handlebars.compile($('#J_ReimDocEvectionTpl').html());
            this.addEvection = require('../../../model/shareModels').addEvectionModel;
        },
        render: function () {
            this.delegateEvents();
            var tripId = this.addEvection.get('tripId');
            var data = this.addEvection.get('data');
            var html = this.AddEvectionTemplate({'dataArray': data, 'tripId': tripId});
            this.$el.empty().append(html);
            var dataEvection = this.addEvection.get('dataEvection');
            var li = $('#J_ReimEvection').find('li');
            if (dataEvection) {
                var str = dataEvection.toString();
                if (str.indexOf(',') != -1) {
                    var a = dataEvection.split(',');
                    this._.each(a, function (order1) {
                        this._.each(li, function (order) {
                            if ($(order).find('span').eq(0).data('trippersonids') == order1) {
                                $(order).find('span').find('figure').removeClass('sure-icon').addClass('sure-icon-en');
                            }
                        });
                    });
                } else {
                    this._.each(li, function (order) {
                        if ($(order).find('span').eq(0).data('trippersonids') == dataEvection) {
                            $(order).find('span').find('figure').removeClass('sure-icon').addClass('sure-icon-en');
                        }
                    });
                }
            }
        },
        selectEvection: function (e) {
            var a = e.currentTarget || e.srcElement;
            var b = $(a).find('.J_EvectionTarget');
            if (b.hasClass('sure-icon')) {
                b.removeClass('sure-icon').addClass('sure-icon-en');
            } else {
                b.removeClass('sure-icon-en').addClass('sure-icon');
            }
        },
        submit: function (e) {
            var a = e.currentTarget || e.srcElement;
            var divElement = $(a).siblings().find('li');
            var list = [];
            var ids = [];
            this._.each(divElement, function (order, index) {
                var numData = {};
                if ($(order).find('figure').hasClass('sure-icon-en')) {
                    numData.tripPersonIds = $(order).find('span').eq(0).data('trippersonids');
                    ids.push(numData.tripPersonIds);
                    numData.inPeopel = $(order).text().trim();
                    list[index] = numData;
                }
            });
            this.addEvection.set('numData', list).trigger('num_Date', list);
            this.addEvection.set('dataEvection', ids.join(','));

        }
    });
    return ReimHotelEvectionView;
});

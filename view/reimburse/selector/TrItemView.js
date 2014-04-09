define(function (require) {
    var Backbone = require('backbone'),
        Handlebars = require('handlebars');
    var TrItemView = Backbone.View.extend({
        tagName: 'div',
        template: Handlebars.compile($('#J_TravelItemTpl').html()),
        events: {
            'tap .J_TravelItem': 'checkTraveller',
            'tap .J_ReadedMts': 'selectMts',
            'tap .J_MtsItem': 'selected'
        },
        initialize: function (options) {
            this.model = options.model;
            this.mtsHtml = options.mtsHtml;
        },
        checkTraveller: function () {
            var eTarget = event.currentTarget;
            var checkFigure = this.$('.J_CheckFigure', eTarget);
            this.toggleClass(checkFigure);
            this.model.toggle();
        },
        toggleClass: function (checkFigure) {
            if (checkFigure.hasClass('sure-icon-en')) {
                checkFigure.removeClass('sure-icon-en').addClass('sure-icon');
            } else {
                checkFigure.removeClass('sure-icon').addClass('sure-icon-en');
            }
        },
        selectMts: function (event) {
            var eTarget = event.currentTarget,
                mts = $(eTarget).attr('data-value'),
                staticVal = this.$('.J_ReadedMts'),
                staticTxt = this.$('.J_ReadedMtsText'),
                mtsItem = this.$('.J_MtsItem');
            staticTxt.text(!!mts ? mts : '选择职级');
            staticVal.attr('data-value', mts);
            this.model.set('mts', mts);//选定职级
            mtsItem.toggle();
        },
        selected: function (event) {
            var eTarget = event.currentTarget;
            var selectTxt = $(eTarget).attr('data-value');
            this.selectItem(selectTxt);
        },
        selectItem: function (selectTxt) {
            this.model.set('mts', selectTxt);
            this.$('.J_ReadedMtsText').text(selectTxt);
            this.$('.J_MtsItem').hide();
        },
        render: function () {
            this.$el.empty().html(this.template(this.model.toJSON()));
            this.$('.J_TravelMts').append(this.mtsHtml);
            return this;
        }
    });
    return TrItemView;
})
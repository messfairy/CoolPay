/**
 *  财务报销抽象View
 */
define(function (require) {
    var Backbone = require('backbone'),
        Handlebars = require('handlebars');
    var ErrorTipsView = Backbone.View.extend({
        el: '#J_Container',
        events: {
        },
        initialize: function (options) {
        },
        render: function () {
            this.$el.empty().append(this.template());
        },
        leave:function(){
            this.content = this.$el.html();
            this.stopListening();
        }
    });
    return ErrorTipsView;
});
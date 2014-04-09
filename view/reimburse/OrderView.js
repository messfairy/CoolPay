//订单项子视图
define(function (require) {
    var Backbone = require('backbone');
    var OrderView = Backbone.View.extend({
        tagName:'section',
        uncheckedCls:'sure-icon',
        checkedCls:'sure-icon-en',
        events: {
            'tap .J_Check': 'handleCheck'
        },
        initialize: function (options) {
            this.model = options.model;
            this.template = options.template;
        },
        render: function () {
            var html = this.template(this.model.attributes);
            this.$el.append(html);
            return this;
        },
        //自身check事件方法
        handleCheck:function(){
            var checkItem = this.$el.find('.J_Check'),
                eChecked = checkItem.hasClass(this.checkedCls);
            this.toggleCheck(!eChecked);
            if(eChecked){
                checkItem.removeClass(this.checkedCls).addClass(this.uncheckedCls);
            }else{
                checkItem.removeClass(this.uncheckedCls).addClass(this.checkedCls);
            }
            (!eChecked)&&this.trigger('un_check', this.model);
        },
        //母视图接口方法
        itemCheck:function(eChecked){
            this.toggleCheck(!eChecked); //上一步是否被选中
            var item = this.$el.find('.J_Check');
            if(eChecked){
                item.removeClass(this.checkedCls).addClass(this.uncheckedCls);
            }else{
                item.removeClass(this.uncheckedCls).addClass(this.checkedCls);
            }
        },
        toggleCheck: function (checked) {
            this.model.set('checked', checked);
        },
        clear: function() {
            this.model.destroy();
        }
    });
    return OrderView;
});
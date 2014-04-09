/**
 * 选择帐套公司
 */
define(function(require){
    var Backbone = require('backbone'),
        Handlebars = require('handlebars');
    var BooksetView = Backbone.View.extend({
        el:'#J_Container',
        template:Handlebars.compile($('#J_BooksetSelectTpl').html()),
        iTemplate:Handlebars.compile($('#J_BookItemTpl').html()),
        events: {
            'tap .J_BooksetItem': 'selectBookset'
        },
        initialize: function () {
            var SelectorModel = require('../../../model/SelectorModel');
            this.model = SelectorModel.selectModel;
            var BookSetModels = SelectorModel.BookSetModels;
            this.bookSets = new BookSetModels;
            this.listenTo(this.bookSets, 'sync', this.renderSelect);
            this.loadingView = require('../../shareViews').loadingView;
        },
        render: function () {
            this.setElement('#J_Container', true);
            this.$el.empty().append(this.template());
        },
        fetchBookSet:function(employeeNo){
            this.render();
            var deferred = this.bookSets.fetchBookSet(employeeNo);
            this.alwaysLoading(deferred);
        },
        alwaysLoading: function(deferred){
            if(!!deferred){
                this.loadingView.show();
                var that = this;
                deferred.always(function(){
                    that.loadingView.hide();
                });
            }
        },
        renderSelect:function(models){
            var bookSetInfo = this.iTemplate(models.toJSON());
            $('#J_BookSetList').html(bookSetInfo);
            return this;
        },
        selectBookset: function (event) {
            var eTarget = event.target||event.srcElement;
            var addressId = $(eTarget).attr('data-value'); //唯一标识
            var bookModel = this.bookSets.get(addressId);
            var sobId = bookModel.get('setOfBooksId');
            var sobDesc = bookModel.get('sobName'); //帐套名称
            var orgName = bookModel.get('orgName'); //帐套名称
            bookModel.set({
                sobId:sobId,
                sobDesc: sobDesc,
                employeeNo: this.model.get('employeeNo'),
                tripId: this.model.get('tripId')
            });
            var data = this.model.attributes;
            this.model.set(bookModel.attributes).trigger('bookset_select', sobDesc, orgName, sobId);
        }
    });
    return BooksetView;
});
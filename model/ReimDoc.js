define(function (require) {
    var Backbone = require('backbone');
    var ReimDoc = Backbone.Model.extend({
        urlRoot: '/fcs/do/trip/json/ExpenseAccountInfo',
        actionUrl: '/getAirByTripHeaderId?tripId=',
        model: Backbone.Model,
        initialize: function (tripId) {
            this.tripId = tripId;
        },
        url: function () {
//            return '/fcs/mobile/service/doc_info.json'
            return this.urlRoot + this.actionUrl + this.tripId;
        },
        parse: function (response) {
            return response.result;
        }
    });
    return ReimDoc;
});
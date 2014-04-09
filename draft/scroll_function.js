var scrollBtM = function () {
    var scrollTop = $(window).scrollTop();
    var scrollHeight = $(document).height();
    var windowHeight = $(window).height();
    if (scrollTop + windowHeight >= scrollHeight) {
        //this.stopListening();
        this.models.fetch({data: {start: 1, end: 20}});
    }
};
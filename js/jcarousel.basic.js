(function($) {
    $(function() {
        $('.jcarousel').jcarousel();
		
        //bind slide event
        $("#panelDiv").bind("swipeleft",function(e){
        	$('.jcarousel-control-next').click();
        });
        $("#panelDiv").bind("swiperight",function(e){
        	$('.jcarousel-control-prev').click();
        });
        
        
        //sliding to left
        $('.jcarousel-control-prev').on('jcarouselcontrol:active', function() {
            $(this).removeClass('inactive');
        })
        .on('jcarouselcontrol:inactive', function() {
            $(this).addClass('inactive');
        })
        .jcarouselControl({
            target: '-=1'
        });

        //sliding to right
   		$('.jcarousel-control-next')
        .on('jcarouselcontrol:active', function() {
            $(this).removeClass('inactive');
        })
        .on('jcarouselcontrol:inactive', function() {
            $(this).addClass('inactive');
        })
        .jcarouselControl({
            target: '+=1'
        });

        //paging
        $('.jcarousel-pagination')
            .on('jcarouselpagination:active', 'a', function() {
                $(this).addClass('active');
            })
            .on('jcarouselpagination:inactive', 'a', function() {
                $(this).removeClass('active');
            })
            .jcarouselPagination();
    	});
})(jQuery);
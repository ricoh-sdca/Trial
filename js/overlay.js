function touchScroll(id){
	if(isTouchDevice()){ //if touch events exist...
		var el=document.getElementById(id);
		var scrollStartPos=0;
 		
 		
		document.getElementById(id).addEventListener("touchstart", function(event) {
			if(event.target == '[object HTMLSelectElement]' || event.target == '[object HTMLInputElement]'){
				return;
			 }
		    scrollStartPos=this.scrollTop+event.touches[0].pageY;
			event.preventDefault();
		},false);
 
		document.getElementById(id).addEventListener("touchmove", function(event) {
			if(event.target == '[object HTMLSelectElement]' || event.target == '[object HTMLInputElement]'){
				return;
			 }
			this.scrollTop=scrollStartPos-event.touches[0].pageY;
			event.preventDefault();
		},false);
	}
}

function isTouchDevice(){
	try{
		document.createEvent("TouchEvent");
		return true;
	}catch(e){
		return false;
	}
}

function loadPopup(popUp, backGround) {
	//loads popup only if it is disabled  
	if ($(backGround).data("state") == 0) {
		$(backGround).css({
			"opacity" : "0.7"
		});
		$(backGround).fadeIn("medium");
		$(popUp).fadeIn("medium");
		$(backGround).data("state", 1);
	}
}

function disablePopup(popUp, backGround) {
	if ($(backGround).data("state") == 1) {
		$(backGround).fadeOut("medium");
		$(popUp).fadeOut("medium");
		$(backGround).data("state", 0);
	}
}

function centerPopup(popUp, backGround) {
	$(popUp).css({
		 'top' : ($(window).height() - $(popUp).height())/2,
		 'left' : ($(window).width() - $(popUp).width())/2,
		 'position' : 'fixed'
		 
	});
}


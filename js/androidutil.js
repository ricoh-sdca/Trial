	
function getBrowserType() {
	var browserType ="<%=BrowserTypeEnum.GW.getId()%>";	
	var userAgent = navigator.userAgent; 	
	var screenType = getScreenType();
	//alert(userAgent);
	if(typeof System == "undefined"){
		browserType = "<%=BrowserTypeEnum.ANDROID.getId()%>";
	}else{
	
	    if (userAgent != "TW") {
	    	if(screenType == "<%=ScreenTypeEnum.WVGA.getId()%>"){
				browserType = "<%=BrowserTypeEnum.GW_PLUS.getId()%>";			
			}else if(screenType == "<%=ScreenTypeEnum.UWVGA.getId()%>"){
				browserType = "<%=BrowserTypeEnum.GW_PLUS_SMALL.getId()%>";
			} 		
		}  else {
			if(screenType == "<%=ScreenTypeEnum.WVGA.getId()%>"){			
				browserType = "<%=BrowserTypeEnum.GW.getId()%>";			
			} 
		} 
	}
	return browserType;	
}


function getScreenType(){
	var screenType = "<%=ScreenTypeEnum.WVGA.getId()%>";
	
	var width = window.innerWidth;
	
	if (width < 744 ) { 
		screenType = "<%=ScreenTypeEnum.UWVGA.getId()%>";
	}	
	return screenType;
}
	

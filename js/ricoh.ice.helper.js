/**
 * @copyright Copyright 2013 Ricoh Americas Corporation. All Rights Reserved.
 * 
 * Copyright (c) 2013 Ricoh Americas Corporation. All Rights Reserved.
 * 
 * @fileOverview This library provides a simple way to validate security token for ICE RAMP application
 * @author Ricoh Americas Corporation.
 */
(function( root ) {	
	"use strict";

	var ricoh;
	
	if (typeof root.ricoh === "undefined" || root.ricoh === null) {
		ricoh = root.ricoh = {};
	} else {
		ricoh = root.ricoh;
	}
	
	var ice = ricoh.ice = ricoh.ice || {};
	ice.helper = ricoh.ice.helper || {};	
	
    var token= "/yRUEU9p0bcbIoN5wA3BT5asv0NS+Hj8jHmJTeDmTkIjarHI0IUCG1SraA1Ed+emyPC8ESV41/kU/VRbivAW5UTMzmKHhfJchQsaqDnMTxyfGPK/Cy7vuveSm++rjLVzrF8tFZBeMV5QQxqyxu0Pdd6gnz9i7skfs3hGtfACvnrh1X/qYveYUwf2wacv8XpzMtpQC6O/rDX3/tY1jGK6jw==";
    var productName = "ICE"; 
  
    function _init(result) {
    	if (result.result === true) {
    		_validateSuccessCallback()
    	} else if (result.result === false && result.detail === "busy") {
    		var pToken = token;
    		var _pInit = _init;
    		console.log("SDCA , _init is busy.");
    		setTimeout(ricoh.dapi.validateAccessToken,1000,pToken,_pInit);
    	}else {
    		alert("Failed to validate this application.");
    	}
    }
    
    function _validateSuccessCallback() {
    }

    function _startValidate(){
    	if(typeof ricoh.dapi.getSupport !== "undefined" && ricoh.dapi.getSupport() != undefined && ricoh.dapi.getSupport().validateAccessToken == true ) {
            document.title = productName;
    	    ricoh.dapi.validateAccessToken(token,_init);
	    } else {
           ricoh.dapi.validateAccessToken = function( accessToken, resultCallback ) {
                setTimeout(ricoh.dapi.internal.validateAccessTokenResult, 0, JSON.stringify({"result":true, "accesstoken": accessToken}), resultCallback);
           };
           ricoh.dapi.validateAccessToken(token,_init);
        }
    }
    
    /**
	 * ricoh.dapi initialization (token validation)
	 */
	ice.helper.dapi = {
		init: function(onSuccessCallback){
		    if( onSuccessCallback != null ){
    			_validateSuccessCallback = onSuccessCallback;
    		}
    		_startValidate();
    	}
	};
  
})( window );

/**
 * @copyright Copyright 2015 Ricoh Americas Corporation. All Rights Reserved.
 * @license Released under the MIT license
 *
 * Copyright (c) 2015 Ricoh Americas Corporation. All Rights Reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

/**
 * This ricoh.ice.header.ext.js ( version : modified from ice.intent.js  [11/19/2015] )
 */

( function( root ) {

  "use strict";

  var ricoh, dapi, ice, 
      logger, util, supported, 
      size, headers, deviceInfo;

  /**
   * Define top-level objects.
   */

  if ( root.ricoh ) {
    ricoh = root.ricoh;
  } else {
    console.error( "namespace 'ricoh' is not defined." );
    return;
  }
  if ( ricoh.dapi ) {
    dapi = ricoh.dapi;
  } else {
    console.error( "namespace 'ricoh.dapi' is not defined." );
    return;
  }

  if ( ricoh.ice ) {
    ice = ricoh.ice;
  } else {
    console.error( "namespace 'ricoh.ice' is not defined." );
    return;
  }

  supported = dapi.getSupport();

  if ( !supported ) {
    console.error( "Failed to retreive dapi capability in ricoh.ice.header.ext.js" );
    return;
  }

  dapi.internal = dapi.internal || {};

  // for setLevel
  logger = dapi._logger;
  util = dapi._util;

  ice.header = ice.header || {};


  // ICE Custom header extension
  if( supported.modifiedHeader && dapi.apiClient ) {

    /**
     * define getCustomHeaders
     */
    dapi.internal.getCustomHeaders = function() {
      var json = ricoh.dapi.internal.browserCall( "[[RICOH:EXJS]]" + "ricoh.dapi.internal.getCustomHeaders", "" );
      console.log(json);
      try{
        return JSON.parse( json );
      } catch ( e ) {
        console.log( e );
        return null;
      }
    };

    /**
     * define setCustomHeaders
     */
    dapi.internal.setCustomHeaders = function( param ) {
      return ricoh.dapi.internal.browserCall( "[[RICOH:EXJS]]" + "ricoh.dapi.internal.setCustomHeaders", JSON.stringify( param ) );
    };

    /**
     * define setCustomHeadersResult()
     */
    dapi.internal.setCustomHeadersResult = function( json ) {
      var result;
      console.log( json );
      if ( json ) {
        try{
          result = JSON.parse( json );
        } catch ( e ) {
          console.log( e );
        }
      }
      if ( result ) {
        console.log( "result=" + result.result );
      }
    };


    ice.header.init = function(){
       headers = dapi.internal.getCustomHeaders();
       // This value is used to enforce to clear the cached headers in BrowserNX.
       // Don't forget to increase this value when ICE custom headers' specification is updated.
       var myCustomHeaderVersion = 1;

       if( headers == null || !headers || !headers[0] || !headers[0].url || 
	   !headers[0].headers["x-header-version"] || headers[0].headers["x-header-version"] < myCustomHeaderVersion ) {
	   size = dapi.getViewSize();
	   deviceInfo = dapi.apiClient.request({
		path: "/property/deviceInfo",
		async: false,
	   });
	    
	   dapi.internal.setCustomHeaders( [ 
	      {	     
		     url : "http://"+ location.host +"/path",
		     headers : {
		  	"x-browser-type" : "WebBrowserNX",
		  	"x-user-auth" : "%userAuth",
		  	"x-user-name" : "%userId",
		  	"x-user-name-available" : "%userIdAvailable",
		  	"x-screen-size" : ( size ) ? ( size.width + "*" + size.height ) : ( "" ),
			"x-serial-number" : ( deviceInfo && deviceInfo.deviceDescription && deviceInfo.deviceDescription.serialNumber ) ? ( deviceInfo.deviceDescription.serialNumber ) : ( "" ),
			"x-device-model" : ( deviceInfo && deviceInfo.deviceDescription && deviceInfo.deviceDescription.modelName ) ? ( deviceInfo.deviceDescription.modelName ) : ( "" ),
			"x-device-scanner-available" :( deviceInfo ) ? (( deviceInfo.scanner ) ? ( "true" ) : ( "false" )) : ( "" ),
			"x-header-version" : myCustomHeaderVersion,         
		     },
		 }
             ]);
	  }
       };
       ice.header.clear = function(){
           ricoh.dapi.internal.setCustomHeaders(null);
       };
  }

  ice.header.isSupported = function(){
     if( supported.modifiedHeader && dapi.apiClient ) {
         return true;
     } else {
         return false;
     }
  };

})( window );

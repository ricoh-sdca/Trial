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
 * This ricoh.ice.kiosk.ms.js
 *
 * This js file provides a simple API to send/receive a message to/from Kiosk Embedded App.
 *  
 */
 
( function( root ) {

  "use strict";

  var ricoh, dapi, ice;

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

  ice.kiosk = ice.kiosk || {};
  ice.kiosk.ms = ice.kiosk.ms || {};

  ice.kiosk.ms.sendMessage = function(messageMap){
      var param  = {
           action : "com.ricoh.ice.kiosk.function.messaging.RECEIVE_MESSAGE",
           packageName : "com.ricoh.ice.kiosk",
           permission : "jp.co.ricoh.isdk.browser.Browser.APP_CMD_PERMISSION",
           extra : messageMap
      };
      // Add senderInfo into extras.
      param.extra.senderInfo = "ricoh.ice.kiosk.ms.js";        
      
      ricoh.dapi.sendBroadcast( param );
  }


  ice.kiosk.ms.init = function(){
      // 1. Define onReceive action
  	  ricoh.dapi.onReceive = function( result ){
  	      if( !result ) {
  	         return;
  	      }
  	  	  var action = result.action;
  	  	  var extras = result.extras;
  	  	  ice.kiosk.ms.onMessageReceived(extras);   	  	 
  	  };
      // 2. Register receiver (like IntentFilter + Permission )
      var result, receiver = {
          id : "ricoh.ice.kiosk.ms.receiver",
          actions : [
             "ricoh.ice.kiosk.ms.RECEIVE_MESSAGE",
          ],
          permission : "jp.co.ricoh.isdk.browser.Browser.APP_CMD_PERMISSION",
      };
      result = ricoh.dapi.registerReceiver( receiver );
      if( !result ) {
          console.log( "registerReceiver:" + result );
      }
  };

  ice.kiosk.ms.onMessageReceived = function(message){
      // Kiosk application needs to override this function to receive message.
  }
  
})( window );

/**
 * @copyright Copyright 2015 Ricoh Company, Ltd. All Rights Reserved.
 * @license Released under the MIT license
 *
 * Copyright (c) 2015 Ricoh Company, Ltd. All Rights Reserved.
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
 * This ricoh.ice.intent.ext.js ( Original version : 11/19/2015 ice.intent.js  )
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
    console.error( "Fail to load Ricoh ICE Intent Extension." );
    return;
  }

  dapi.internal = dapi.internal || {};


  // for setLevel
  logger = dapi._logger;
  util = dapi._util;

  // Intent Extension:
  if( supported.modifiedIntent ) {
    /**
     * Request to register BroadcastReceiver.<br>
     *
     * @param   {Object}  param
     * @param   {String}  param.id  :  receiver id
     * @param   {Array}   param.actions     :  intent filter
     * @param   {String}  param.permission  :  receiver permission
     * @return  {Boolean} result
     */
    dapi.internal.registerReceiver = function( param ) {
      return ricoh.dapi.internal.browserCall( "[[RICOH:EXJS]]" + "ricoh.dapi.internal.registerReceiver", JSON.stringify( param ) );
    };

    /**
     * Request to unregister BroadcastReceiver.<br>
     *
     * @param   {Object}  param
     * @param   {String}  param.id  :  receiver id
     * @return  {Boolean} result
     */
    dapi.internal.unregisterReceiver = function( param ) {
      return ricoh.dapi.internal.browserCall( "[[RICOH:EXJS]]" + "ricoh.dapi.internal.unregisterReceiver", JSON.stringify( param ) );
    };

    /**
     * Request to send Broadcast( sendBroadcast or sendOrderedBroadcast ).<br>
     *
     * @param   {Object}  param
     * @param   {String}  param.action  :  intent action
     * @param   {Object}  param.extras  :  intent extras
     * @param   {String}  param.permission  :  intent permission
     * @param   {String}  param.resultReceiverId  :  receiver id ( resultReceiver )
     * @return  {Boolean} result
     */
    dapi.internal.sendBroadcast = function( param ) {
      return ricoh.dapi.internal.browserCall( "[[RICOH:EXJS]]" + "ricoh.dapi.internal.sendBroadcast", JSON.stringify( param ) );
    };

    /**
     * Receive to Broadcast Intent.<br>
     *
     * @param   {Object}  result
     * @param   {String}  result.action  :  intent action
     * @param   {String}  result.receiverId  :  intent receiver id
     * @param   {Object}  result.extras  :  intent extras
     * @param   {Object}  result.resultExtras  :  intent resultExtras
     */
    dapi.internal.onReceive = function( json ) {
      var key, result;
      console.log( json );

      if ( json ) {
        try{
          result = JSON.parse( json );
        } catch ( e ) {
          console.log( e );
        }
      }
      if ( result ) {
        console.log( "action=" + result.action + ", receier id=" + result.receiverId );
        if( result.extras ) {
          console.log( "extras" );
          for ( key in result.extras ) {
            console.log( key + "=" + result.extras[key] );
          }
        }
        if ( result.resultExtras ) {
          console.log( "resultExtras" );
          for ( key in result.resultExtras ) {
            console.log( key + "=" + result.resultExtras[key] );
          }
        }
      }
    };
  }
})( window );

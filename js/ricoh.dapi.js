/**
 * @copyright Copyright 2013-2016 Ricoh Company, Ltd. All Rights Reserved.
 * @license Released under the MIT license
 *
 * Copyright (c) 2013-2016 Ricoh Company, Ltd. All Rights Reserved.
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
  * This ricoh.dapi.js supports SmartSdk Version : 2.12
  */
(function() {
  var root = this,
    ricoh_exjs,
    ricoh,
    ssdkSSLAccept,
    completedResult,
    completedResultObject;
  
  if ( navigator.userAgent.indexOf( "AppleWebKit/" ) !== -1 ) {
    if ( navigator.userAgent.toLowerCase().indexOf( "ricoh" ) !== -1 ) {
      ricoh_exjs = "[[RICOH:EXJS]]";
    }
  }
  
  
  /**
   * @namespace ricoh.dapi
   */
  if ( typeof root.ricoh === "undefined" || root.ricoh === null ) {
    ricoh = root.ricoh = {};
  } else {
    ricoh = root.ricoh;
  }
  ricoh.dapi = ricoh.dapi || {};

  /**
   * The address of SmartSDK WebAPI.
   *
   * @property address
   * @type     String
   */
  ricoh.dapi.address;

  /**
   * The port numbers of SmartSDK WebAPI.
   *
   * @property port
   * @type     Object
   */
  ricoh.dapi.port;

  /**
   * The status of hardware key.
   *
   * @property backMenuState
   * @type     Boolean
   * @default  true
   */
  ricoh.dapi.backMenuState = true;

  /**
   * Acquire the heap size used by browser.
   *
   * @method getHeapSize
   * @return {Object} heap size
   */
  ricoh.dapi.getHeapSize = function() {
    var heap, heap_json;
    heap_json = ricoh.dapi.internal.browserCall( ricoh_exjs + "ricoh.dapi.getHeapSize", "" );
    if ( typeof heap_json !== "undefined" && heap_json !== null ) {
      heap = JSON.parse( heap_json );
    }
    return heap;
  };

  /**
   * Returns the address of SmartSDK WebAPI.
   *
   * @method getAddress
   * @return {String} the address of SmartSDK WebAPI
   */
  ricoh.dapi.getAddress = function() {
    if ( !ricoh.dapi.address ) {
      ricoh.dapi.address = ricoh_exjs ? "gw.machine.address" : "localhost";
    }
    return ricoh.dapi.address;
  };

  /**
   * Returns the port numbers of SmartSDK WebAPI.
   *
   * @method getPort
   * @return {Object} the port numbers of SmartSDK WebAPI
   */
  ricoh.dapi.getPort = function() {
    if ( !ricoh.dapi.port ) {
      ricoh.dapi.port = {
        http: 54080,
        https: 54443
      };
    }
    return ricoh.dapi.port;
  };

  /**
   * Buzzer.<br>
   * Output tone number at console.
   *
   * @method buzzer
   * @param  {String} tone - tone type
   */
  ricoh.dapi.buzzer = function( tone ) {
    if ( tone === "Confirmation" ) {
      tone = 0;
    }
    else if ( tone === "Invalid" ) {
      tone = 1;
    }
    else if ( tone === "BasePoint" ) {
      tone = 2;
    }
    else if ( tone === "SuccessfullyCompleted" ) {
      tone = 3;
    }
    else if ( tone === "Ready" ) {
      tone = 4;
    }
    else if ( tone === "LightWarning1" ) {
      tone = 5;
    }
    else if ( tone === "LightWarning2" ) {
      tone = 6;
    }
    else if ( tone === "LightWarning3" ) {
      tone = 7;
    }
    else if ( tone === "StrongWarning" ) {
      tone = 8;
    }

    if ( typeof tone === "number" && tone >= 0 && tone <= 8 ) {
      ricoh.dapi.internal.browserCall( ricoh_exjs + "ricoh.dapi.buzzer", tone );
    }
    else {
      console.log( "parameter error" );
    }
  };

  /**
   * Returns whether hard key is enable.
   *
   * @method getBack_Menu
   * @return {Boolean} hardware key state
   */
  ricoh.dapi.getBack_Menu = function() {
    return ricoh.dapi.backMenuState;
  };

  /**
   * Set hardware key state.
   *
   * @method setBack_Menu
   * @param  {Boolean} hardkey the state of hardware key
   */
  ricoh.dapi.setBack_Menu = function( hardkey ) {
    if ( typeof hardkey === "boolean" ) {
      ricoh.dapi.backMenuState = hardkey;
      
      ricoh.dapi.internal.browserCall( ricoh_exjs + "ricoh.dapi.setBack_Menu", hardkey );
    }
    else {
      console.log( "parameter error" );
    }
  };

  /**
   * Lock power mode.
   *
   * @method lockPowerMode
   */
  ricoh.dapi.lockPowerMode = function() {
    ricoh.dapi.internal.browserCall( ricoh_exjs + "ricoh.dapi.lockPowerMode", "" );
  };
  
  /**
   * Callback of lockPowerMode
   *
   * @method lockPowerModeResult
   * @param  {Boolean} result
   */
  ricoh.dapi.lockPowerModeResult = function() {
    // This JavaScript library user must override this function.
  };

  /**
   * Unlock power mode.
   *
   * @method unlockPowerMode
   */
  ricoh.dapi.unlockPowerMode = function() {
    ricoh.dapi.internal.browserCall( ricoh_exjs + "ricoh.dapi.unlockPowerMode", "" );
  };

  /**
   * Lock offlice
   *
   * @method lockOffline
   */
  ricoh.dapi.lockOffline = function() {
    ricoh.dapi.internal.browserCall( ricoh_exjs + "ricoh.dapi.lockOffline", "" );
  };
  
  /**
   * Callback of lockOffline.
   *
   * @method lockOfflineResult
   * @param  {Boolean} result
   */
  ricoh.dapi.lockOfflineResult = function() {
    // This JavaScript library user must override this function.
  };

  /**
   * Unlock offlice
   *
   * @method lockOffline
   */
  ricoh.dapi.unlockOffline = function() {
    ricoh.dapi.internal.browserCall( ricoh_exjs + "ricoh.dapi.unlockOffline", "" );
  };

  /**
   * Lock system reset
   *
   * @method lockSystemReset
   */
  ricoh.dapi.lockSystemReset = function() {
    var supported = ricoh.dapi.getSupport();
    
    if ( !supported || !supported.lockSystemReset ) {
      console.log( "lockSystemReset unsupported" );
    }
    else {
      ricoh.dapi.internal.browserCall( ricoh_exjs + "ricoh.dapi.lockSystemReset", "" );
    }
  };

  /**
   * Callback of lockSystemReset
   *
   * @method lockSystemResetResult
   */
  ricoh.dapi.lockSystemResetResult = function() {
    // This JavaScript library user must override this function.
  };

  /**
   * Unlock system reset
   *
   * @method unlockSystemReset
   */
  ricoh.dapi.unlockSystemReset = function() {
    var supported = ricoh.dapi.getSupport();
    if ( !supported || !supported.lockSystemReset ) {
      console.log( "lockSystemReset unsupported" );
    }
    else {
      ricoh.dapi.internal.browserCall( ricoh_exjs + "ricoh.dapi.unlockSystemReset", "" );
    }
  };
  
  ricoh.dapi.state;
  
  /**
   * Browser state is changed.
   *
   * @method onBrowserEvent
   * @param  {String} state
   */
  ricoh.dapi.onBrowserEvent = function() {
    // This JavaScript library user must override this function.
  };
  
  /**
   * Language is changed.
   *
   * @method onLanguageEvent
   * @param  {String} language
   */
  ricoh.dapi.onLanguageEvent = function() {
    // This JavaScript library user must override this function.
  };

  /**
   * Return view size.
   *
   * @method getViewSize
   * @return {Object} browser screen size
   */
  ricoh.dapi.getViewSize = function( ) {
    var size_json = ricoh.dapi.internal.browserCall( ricoh_exjs + "ricoh.dapi.getViewSize", "" );
    if ( size_json !== null ) {
      ricoh.dapi.navigator.v_size = JSON.parse( size_json );
    }
    return ricoh.dapi.navigator.v_size;
  };

  /**
   * Display an alert dialog.
   *
   * @method displayAlertDialog
   * @param  {String} app_type
   * @param  {String} state
   * @param  {String} state_reason
   */
  ricoh.dapi.displayAlertDialog = function( app_type, state, state_reason ) {
    var json_string, param_json = {};
    param_json.APP_TYPE = ricoh.dapi.internal.getAppType( app_type );
    param_json.STATE = state;
    param_json.STATE_REASON = state_reason;

    json_string = JSON.stringify( param_json );

    ricoh.dapi.internal.browserCall( ricoh_exjs + "ricoh.dapi.displayAlertDialog", json_string );
  };

  /**
   * Hide an alert dialog.
   *
   * @method hideAlertDialog
   */
  ricoh.dapi.hideAlertDialog = function() {
    ricoh.dapi.internal.browserCall( ricoh_exjs + "ricoh.dapi.hideAlertDialog", "" );
  };

  /**
   * Return a serial number.
   *
   * @method getSerialNumber
   * @return {String} serialNumber
   */
  ricoh.dapi.getSerialNumber = function() {
    return ricoh.dapi.internal.getSerialNumber();
  };

  /**
   * Set app status
   *
   * @method setAppStatus
   * @param  {String} app_type
   * @param  {String} status
   * @param  {String} message
   */
  ricoh.dapi.setAppStatus = function( app_type, status, message ) {
    var json_string, param_json = {};
    param_json.APP_TYPE = ricoh.dapi.internal.getAppType( app_type );
    if ( "NORMAL" === status ) {
      param_json.STAT = 0;
    }
    else if ( "ERROR" === status ) {
      param_json.STAT = 1;
    }
    else if ( "WARNING" === status ) {
      param_json.STAT = 2;
    }
    param_json.ERR_MESSAGE = message;

    json_string = JSON.stringify( param_json );

    ricoh.dapi.internal.browserCall( ricoh_exjs + "ricoh.dapi.setAppStatus", json_string );
  };

  /**
   * Validate access token.
   *
   * @method validateAccessToken
   * @param  {String} accessToken
   * @param  {Function} callback
   */
  ricoh.dapi.validateAccessToken = function( accessToken, resultCallback ) {
    var cache,
      supported,
      result;
    
    if ( typeof accessToken !== "string" ) {
      console.log( "parameter error" );
      return undefined;
    }

    //Caching
    cache = ricoh.dapi.internal.validateAccessTokenCache;
    if ( typeof cache.requestToken === "string" ) {
      if ( cache.requestToken === accessToken ) {
        // same cache token request.
        if ( typeof cache.validateResult !== "undefined" && cache.validateResult.result ) {
          // already validate success.
          // delay call.
          setTimeout( ricoh.dapi.internal.validateAccessTokenResult, 0, JSON.stringify( cache.validateResult ) , resultCallback );
          return undefined;
        } else if ( typeof cache.validateResult !== "undefined" && !cache.validateResult.result ) {
          // validate failed.
          // call native validate function.
        } else {
          console.log( "already validate requesting." );
          // already requesting
          // add callback.
          ricoh.dapi.internal.validateAccessTokenResultListeners = ricoh.dapi.internal.addListElement( ricoh.dapi.internal.validateAccessTokenResultListeners, resultCallback );
          return undefined;
        }

      } else {
        // other token request.
        if ( typeof cache.validateResult !== "undefined" ) {
          // already validate successed other token
          // call native validate function.
        } else {
          // other accesstoken validating..
          // callback busy
          if ( typeof resultCallback !== "function" ) {
            resultCallback = function(){};
          }
          setTimeout( ricoh.dapi.internal.validateAccessTokenResult, 0, JSON.stringify( { "requestToken":accessToken,"result":false,"detail":"busy" } ), resultCallback );
          return undefined;
        }
      }
    }

    supported = ricoh.dapi.getSupport();
    if ( !supported || !supported.validateAccessToken ) {
      console.log( "Unsupported this function" );
      setTimeout( ricoh.dapi.internal.validateAccessTokenResult, 0, JSON.stringify( { "result":true, "accesstoken": accessToken } ), resultCallback );
      return undefined;
    }

    ricoh.dapi.internal.validateAccessTokenCache.requestToken = accessToken;
    ricoh.dapi.internal.validateAccessTokenCache.validateResult = undefined;
    ricoh.dapi.internal.validateAccessTokenResultListeners = ricoh.dapi.internal.addListElement( ricoh.dapi.internal.validateAccessTokenResultListeners, resultCallback );

    result = ricoh.dapi.internal.browserCall( ricoh_exjs + "ricoh.dapi.validateAccessToken", accessToken );

    return undefined;
  };

  /**
   * Callback of validateAccessToken
   *
   * @method validateAccessTokenResult
   * @param  {Object} result result of validation.
   */
  ricoh.dapi.validateAccessTokenResult = function() {
    // This JavaScript library user must override this function.
  };

  /**
   * Suspend validation.
   *
   * @method Suspend validation
   * @param  {Function} callback
   */
  ricoh.dapi.suspendValidation = function( resultCallback ) {
    var callback, supported;
    callback = ( typeof resultCallback === "function" ) ? ( resultCallback ) : ( null );
    supported = ricoh.dapi.getSupport();
    if ( !supported || !supported.validateAccessToken ) {
      if ( callback ) {
        setTimeout( callback, 0, { result : false, detail : "unsupported" } );
      }
    }
    else if ( ricoh.dapi.internal.validateAccessTokenCache.requestToken ||
      ricoh.dapi.internal.validateAccessTokenCache.validateResult ) {
      if ( callback ) {
        setTimeout( callback, 0, { result : true } );
      }
    }
    else {
      ricoh.dapi.internal.suspendValidationCallback = callback ? callback : function(){};
      ricoh.dapi.validateAccessToken( ricoh_exjs + "ricoh.dapi.suspendValidation" );
    }
  };

  /**
   * Return whether functions are supported.
   *
   * @method getSupport
   * @return {Object} support
   */
  ricoh.dapi.getSupport = function() {
    var browserVersionName, browserVersion,
      versionArray, majorVersion, minorVersion,
      browserCapability, browserCapabilityJSON,
      attributeName;
    
    if ( ricoh.dapi.support ) {
      return ricoh.dapi.support;
    }

    // get browser versionName.
    browserVersionName = ricoh.dapi.internal.browserCall( ricoh_exjs + "ricoh.dapi.internal.browserVersionName", "" );
    if ( typeof browserVersionName !== "string"  ) {
      console.log( "browser version is not string" );
      return undefined;
    }

    browserVersion = browserVersionName.split( "_" );
    if ( Object.prototype.toString.call( browserVersion ) !== "[object Array]" || browserVersion.length !== 2 || typeof browserVersion[1] !== "string" ) {
      console.log( "browser version split failed[" + browserVersionName + "]" );
      return undefined;
    }

    versionArray = browserVersion[1].split( "." );
    if ( Object.prototype.toString.call(versionArray) !== "[object Array]" ) {
      console.log( "browser version split failed[" + browserVersion[1] + "]" );
      return undefined;
    }

    majorVersion = parseInt( versionArray[0] );
    minorVersion = parseInt( versionArray[1] );
    console.log( "ricoh.dapi.js version[" + ricoh.dapi.navigator.appVersion + "]" );
    console.log( "browser version[" + majorVersion + "." + minorVersion + "]" );

    // Create support object
    ricoh.dapi.support = {
      validateAccessToken : false,
      addShortcut : false,
      displayProgressBar : false,
      billingCode : false,
      availableDapiCard : false,
      lockSystemReset : false,
      modifiedPrint : false,
      modifiedIntent : false,
      modifiedHeader : false,
      userCodeAuth : false,
      customHeaders : false,
      authenticator : false,
      broadcastIntent : false,
    };

    // For Before V1.01
    if ( !isNaN(majorVersion) && majorVersion <= 1 && !isNaN(minorVersion) && minorVersion <= 101 ) {
      console.log( "before v1.01[" + browserVersionName + "]" );
    }
    // For After V1.02
    else {
      // Get Browser Capability object
      browserCapability = ricoh.dapi.internal.browserCall( ricoh_exjs + "ricoh.dapi.internal.getBrowserCapability" );
      if ( typeof browserCapability !== "string" ) {
        console.log( "browser capability is not string." );
        return ricoh.dapi.support;
      }

      // parse object
      try {
        browserCapabilityJSON = JSON.parse( browserCapability );
      } catch( exception ) {
        console.log( "browser capability parse failed.", exception );
        return ricoh.dapi.support;
      }

      // Merge support property
      for( attributeName in ricoh.dapi.support ) {
        if ( ricoh.dapi.support.hasOwnProperty( attributeName ) &&
          browserCapabilityJSON[attributeName] ) {
          ricoh.dapi.support[attributeName] = browserCapabilityJSON[attributeName];
        }
      }
    }

    return ricoh.dapi.support;
  };

  /**
   * Add shortcut to the panel home.
   *
   * @method addShortcut
   * @param {Object} shortcutInfo
   */
  ricoh.dapi.addShortcut = function( shortcutInfo ) {
    var supported, param_json = {},
      result,
      json_string;
    supported = ricoh.dapi.getSupport();
    if ( !supported || !supported.addShortcut ) {
      result = {
        result:false,
        detail:"unsupported"
      };
      setTimeout( function() { ricoh.dapi.addShortcutResult( result ); } , 0 );
      return;
    }

    if ( shortcutInfo.url === undefined || shortcutInfo.name === undefined )  {
      result = {
        result:false,
        detail:"parameterLack"
      };
      setTimeout( function() { ricoh.dapi.addShortcutResult( result ); } , 0 );
      return;
    }

    param_json.URL  = shortcutInfo.url;
    param_json.NAME = shortcutInfo.name;
    param_json.ICON = shortcutInfo.iconResouce;
    
    json_string = JSON.stringify( param_json );

    ricoh.dapi.internal.browserCall( ricoh_exjs + "ricoh.dapi.addShortcut", json_string );
  };

  /**
   * Callback of addShortcut.
   *
   * @method addShortcutResult
   * @param  {Object} result
   */
  ricoh.dapi.addShortcutResult = function() {
    // This JavaScript library user must override this function.
  };

  /**
   * Display progress bar
   *
   * @method displayProgressBar
   */
  ricoh.dapi.displayProgressBar = function() {
    var supported = ricoh.dapi.getSupport();
    if ( !supported || !supported.displayProgressBar ) {
      console.log( "displayProgressBar unsupported" );
    }
    else {
      ricoh.dapi.internal.browserCall( ricoh_exjs + "ricoh.dapi.displayProgressBar", "" );
    }
  };

  /**
   * Hide progress bar
   *
   * @method hideProgressBar
   */
  ricoh.dapi.hideProgressBar = function() {
    var supported = ricoh.dapi.getSupport();
    if ( !supported || !supported.displayProgressBar ) {
      console.log( "hideProgressBar unsupported" );
    }
    else {
      ricoh.dapi.internal.browserCall( ricoh_exjs + "ricoh.dapi.hideProgressBar", "" );
    }
  };

  /**
   * Returns the custom headers of Web Application.
   *
   * @method getCustomHeaders
   * @return {Object} the custom headers
   */
  ricoh.dapi.getCustomHeaders = function() {
    var supported, json, result;
    supported = ricoh.dapi.getSupport();
    if ( !supported || !supported.customHeaders ) {
      console.log( "customHeaders unsupported" );
    }
    else {
      json = ricoh.dapi.internal.browserCall( "[[RICOH:EXJS]]" + "ricoh.dapi.internal.getCustomHeaders", "" );
      result = JSON.parse( json );
    }
    return result;
  };

  /**
   * Set the custom headers of Web Application.
   *
   * @method setCustomHeaders
   * @param {Array[Object]} list of the custom headers
   */
  ricoh.dapi.setCustomHeaders = function( list ) {
    var supported, result = false;
    supported = ricoh.dapi.getSupport();
    if ( !supported || !supported.customHeaders ) {
      console.log( "customHeaders unsupported" );
    }
    else {
      ricoh.dapi.internal.browserCall( "[[RICOH:EXJS]]" + "ricoh.dapi.internal.setCustomHeaders", JSON.stringify( list ) );
      result = true;
    }
    return result;
  };

  /**
   * Callback of setCustomHeaders
   *
   * @method setCustomHeadersResult
   * @param  {Object} result
   */
  ricoh.dapi.setCustomHeadersResult = function() {
    // This JavaScript library user must override this function.
  };

  /**
   * Reset the custom headers of Web Application.
   *
   * @method clearCustomHeaders
   */
  ricoh.dapi.clearCustomHeaders = function() {
    var supported, result = false;
    supported = ricoh.dapi.getSupport();
    if ( !supported || !supported.customHeaders ) {
      console.log( "customHeaders unsupported" );
    }
    else {
      ricoh.dapi.internal.browserCall( "[[RICOH:EXJS]]" + "ricoh.dapi.internal.clearCustomHeaders", arguments[0] ? JSON.stringify( arguments[0] ) : "" );
      result = true;
    }
    return result;
  };

  /**
   * Callback of clearCustomHeaders
   *
   * @method clearCustomHeadersResult
   * @param  {Object} result
   */
  ricoh.dapi.clearCustomHeadersResult = function() {
    // This JavaScript library user must override this function.
  };

  /**
   * Request to register a BroadcastReceiver.<br>
   *
   * @method registerReceiver
   * @param  {Object}        receiver
   * @param  {String}        receiver.id
   * @param  {Array[String]} receiver.actions
   * @param  {String}        receiver.permission
   */
  ricoh.dapi.registerReceiver = function( receiver ) {
    var supported, result = false;
    supported = ricoh.dapi.getSupport();
    if ( !supported || !(supported.broadcastIntent || supported.modifiedIntent)) {
      console.log( "broadcastIntent unsupported" );
    }
    else {
      receiver.broadcastIntent = true;
      result = ricoh.dapi.internal.browserCall( "[[RICOH:EXJS]]" + "ricoh.dapi.internal.registerReceiver", JSON.stringify( receiver ) );
    }
    return result;
  };

  /**
   * Request to unregister a BroadcastReceiver.<br>
   *
   * @method unregisterReceiver
   * @param  {Object}        receiver
   * @param  {String}        receiver.id
   */
  ricoh.dapi.unregisterReceiver = function( receiver ) {
    var supported, result = false;
    supported = ricoh.dapi.getSupport();
    if ( !supported || !(supported.broadcastIntent || supported.modifiedIntent)) {
      console.log( "broadcastIntent unsupported" );
    }
    else {
      result = ricoh.dapi.internal.browserCall( "[[RICOH:EXJS]]" + "ricoh.dapi.internal.unregisterReceiver", JSON.stringify( receiver ) );
    }
    return result;
  };

  /**
   * Broadcast the given intent to BroadcastReceivers.<br>
   *
   * @method sendBroadcast
   * @param  {Object}        intent
   * @param  {String}        intent.action
   * @param  {String}        intent.permission
   * @param  {Object}        intent.extras
   * @param  {String}        intent.packageName
   * @param  {String}        intent.resultReceiverId
   */
  ricoh.dapi.sendBroadcast = function( intent ) {
    var supported, result = false;
    supported = ricoh.dapi.getSupport();
    if ( !supported || !(supported.broadcastIntent || supported.modifiedIntent)) {
      console.log( "broadcastIntent unsupported" );
    }
    else {
      result = ricoh.dapi.internal.browserCall( "[[RICOH:EXJS]]" + "ricoh.dapi.internal.sendBroadcast", JSON.stringify( intent ) );
    }
    return result;
  };

  /**
   * Called when the BroadcastReceiver is receiving an Intent broadcast.<br>
   *
   * @method onReceive
   * @param  {Object}        intent
   * @param  {String}        intent.action
   * @param  {String}        intent.receiverId
   * @param  {Object}        intent.extras
   * @param  {Object}        intent.resultExtras
   */
  ricoh.dapi.onReceive = function() {
    // This JavaScript library user must override this function.
  };

  /**
   * Provides the functionality to download and upload file.
   * 
   * @namespace ricoh.dapi.net
   */
  ricoh.dapi.net = ricoh.dapi.net || {};
  ricoh.dapi.net.executingMaxNum = 1;	// This is the maximum number that a download can execute simultaneously.

  /**
   * Request to download file.<br>
   * When download state has changed, calls state change event handler.
   *
   * @method  donwload
   * @param   {String}  requestId - unique id
   * @param   {String}  url       - the path of file on server
   * @param   {Object}  options
   * @param   {Object}  options.params
   * @param   {String}  options.params.userName
   * @param   {String}  options.params.userPassword
   * @param   {Boolean} options.params.rangeRequest
   * @param   {Object}  options.headers
   * @param   {Object}  options.query
   */
  ricoh.dapi.net.download = function( requestId, url, options ) {
    var obj = {},
      json_string;
    
    if (typeof requestId === "string" && typeof url === "string" ) {
      obj.requestId = requestId;
      obj.url = url;
      obj.options = options;
      
      json_string = JSON.stringify( obj );
      
      ricoh.dapi.internal.downloadUpload( 0, requestId, json_string );	// 1st arg : 0:download
    }
    else {
      console.log( "download parameter error" );
      if ( typeof requestId === "string" ) {
        ricoh.dapi.net.onDownloadStateChange( requestId, "failure", undefined, 0, undefined, 0 );
      }
    }
  };

  /**
   * Download state change event handler.
   *
   * @method onDownloadStateChange
   * @param  {String} requestId    - request id
   * @param  {String} state        - download state
   * @param  {String} result       - the path of downloaded file
   * @param  {Number} status       - status code
   * @param  {String} error        - error message
   * @param  {Number} progress     - progress(0-100)
   */
  ricoh.dapi.net.onDownloadStateChange = function() {
    // This JavaScript library user must override this function.
  };

  /**
   * Request to upload file.<br>
   * When upload state has changed, calls state change event handler.
   *
   * @method upload
   * @param {String} requestId - unique id
   * @param {String} url       - the path of file or direcotry on server
   * @param {String} filePath  - the path of upload file
   * @param {Object} options
   *   @param {Object}  options.params
   *   @param {String}  options.params.userName
   *   @param {String}  options.params.userPassword
   *   @param {String}  options.params.filepartName
   *   @param {Boolean} options.params.chunkedStreaming
   *   @param {Object}  options.headers
   *   @param {Object}  options.body
   */
  ricoh.dapi.net.upload = function( requestId, url, filePath, options ) {
    var obj = {},
      json_string,
      key;
    
    if ( typeof requestId === "string" && typeof url === "string" && typeof filePath === "string" ) {
      if ( options && options.params ) {
        if ( options.params.chunkedStreaming === true ) {
          if ( options.headers ) {
            options.headers["Transfer-Encoding"] = "chunked";
          }
          else {
            options.headers = { "Transfer-Encoding" : "chunked" };
          }
        }
      }
      
      obj.requestId = requestId;
      obj.url = url;
      obj.filePath = filePath;
      obj.options = options;
      
      if ( options && options.body && typeof options.body === "object" ) {
        for( key in options.body ) {
          if ( options.body.hasOwnProperty( key ) && typeof options.body[key] !== "string" ) {
            console.log( "type not supported : " + key + "[" + typeof options.body[key] + "]"  );
            obj = null;
            break;
          }
        }
      }
      
      if ( obj ) {
        json_string = JSON.stringify( obj );
        ricoh.dapi.internal.downloadUpload( 1, requestId, json_string );	// 1st arg : 1:upload
      }
    }
    
    if( !json_string ) {
      console.log( "upload parameter error" );
      if ( typeof requestId === "string" ) {
        ricoh.dapi.net.onUploadStateChange( requestId, "failure", undefined, 0, undefined, 0 );
      }
    }
  };

  /**
   * Upload state change event handler.
   *
   * @method onUploadStateChange
   * @param  {String} requestId    - request id
   * @param  {String} state        - upload state
   * @param  {String} result       - the path of uploaded file
   * @param  {Number} status       - status code
   * @param  {String} error        - error message
   * @param  {Number} progress     - progress(0-100)
   * @param  {Object} responseBody - response body
   */
  ricoh.dapi.net.onUploadStateChange = function() {
    // This JavaScript library user must override this function.
  };

  /**
   * Abort downloading/uploading file.
   *
   * @method abort
   * @param  {String} requestId - request id
   */
  ricoh.dapi.net.abort = function( requestId ) {
    if ( typeof requestId === "string" || typeof requestId === "undefined" ) {
      ricoh.dapi.internal.abortDownloadUpload( requestId );
    }
    else {
      console.log( "parameter error" );
      return;
    }
  };

  /**
   * Delete file
   *
   * @method removeFile
   * @param  {String} filePath
   */
  ricoh.dapi.net.removeFile = function( filePath ) {
    ricoh.dapi.internal.browserCall( ricoh_exjs + "ricoh.dapi.net.removeFile", filePath );
  };

  /**
   * Provides the functionality of authentication.
   *
   * @namespace ricoh.dapi.auth
   */
  ricoh.dapi.auth = ricoh.dapi.auth || {};
  ricoh.dapi.auth.token;
  ricoh.dapi.auth.card;
  ricoh.dapi.auth.loginState;

  /**
   * Acquire the authentication state.
   *
   * @method getAuthState
   * @return {Object} authState
   */
  ricoh.dapi.auth.getAuthState = function() {
    var auth_state_json, auth_state;
    auth_state_json = ricoh.dapi.internal.browserCall( ricoh_exjs + "ricoh.dapi.auth.getAuthState", "" );
    
    if ( typeof auth_state_json !== "undefined" && auth_state_json !== null ) {
      auth_state = JSON.parse( auth_state_json );
      ricoh.dapi.auth.authState = auth_state;
    }
    return ricoh.dapi.auth.authState;
  };

  /**
   * Lock logout.
   *
   * @method lockLogout
   */
  ricoh.dapi.auth.lockLogout = function() {
    ricoh.dapi.internal.browserCall( ricoh_exjs + "ricoh.dapi.auth.lockLogout", "" );
  };

  /**
   * Event hander of lockLogout
   *
   * @method lockLogoutResult
   * @param  {Boolean} result
   */
  ricoh.dapi.auth.lockLogoutResult = function() {
    // This JavaScript library user must override this function.
  };

  /**
   * Unlock logout.
   *
   * @method unlockLogout
   */
  ricoh.dapi.auth.unlockLogout = function() {
    ricoh.dapi.internal.browserCall( ricoh_exjs + "ricoh.dapi.auth.unlockLogout", "" );
  };

  /**
   * Request to acquire authentication token.<br>
   * When auth token has been acquired, calls getTokenResult.
   *
   * @method getTokenRequest
   */
  ricoh.dapi.auth.getTokenRequest = function() {
    ricoh.dapi.internal.browserCall( ricoh_exjs + "ricoh.dapi.auth.getTokenRequest", "" );
  };

  /**
   * Authentication token acquisition event handler
   *
   * @method getTokenResult
   * @param  {Boolean} result
   * @param  {String}  token  auth token
   */
  ricoh.dapi.auth.getTokenResult = function() {
    // This JavaScript library user must override this function.
  };

  /**
   * Card detection event handler.
   *
   * @method detectCard
   * @param  {String} cardId
   */
  ricoh.dapi.auth.detectCard = function() {
    // This JavaScript library user must override this function.
  };

  /**
   * Acquire the serial number of IC card.
   *
   * @method getCardInfo
   * @return {String} serial number
   */
  ricoh.dapi.auth.getCardInfo = function() {
    return ricoh.dapi.internal.browserCall( ricoh_exjs + "ricoh.dapi.auth.getCardInfo", "" );
  };

  /**
   * Get loginState in userCodeAuth
   *
   * @method getLoginStateInUserCodeAuth
   * @return {Boolean} result
   */
  ricoh.dapi.auth.getLoginStateInUserCodeAuth = function() {
    var supported = ricoh.dapi.getSupport(), login_state_json;
    if ( !supported || !supported.userCodeAuth ) {
      console.log( "userCodeAuth unsupported" );
      return undefined;
    }
    if ( typeof ricoh.dapi.auth.loginState === "undefined" ) {
      login_state_json = ricoh.dapi.internal.browserCall( ricoh_exjs + "ricoh.dapi.auth.getLoginStateInUserCodeAuth", "" );
      ricoh.dapi.auth.loginState = JSON.parse( login_state_json ).result;
    }

    return ricoh.dapi.auth.loginState;
  };

  /**
   * Acquire billing code.
   *
   * @method getBillingCode
   */
  ricoh.dapi.auth.getBillingCode = function() {
    var supported = ricoh.dapi.getSupport();
    if ( !supported || !supported.billingCode ) {
      console.log( "billingCode unsupported" );
    }
    else {
      ricoh.dapi.internal.browserCall( ricoh_exjs+"ricoh.dapi.auth.getBillingCode", "");
    }
  };

  /**
   * BillingCode change or acquisition event handler
   *
   * @method onBillingCodeEvent
   * @param  {String}  billingCode
   * @param  {String}  billingCodeLabel
   */
  ricoh.dapi.auth.onBillingCodeEvent = function() {
   // This JavaScript library user must override this function.
  };

  /**
   * Returns the authentication information for the Adaptable Authentication API (AAA).
   *
   * @method getAuthenticatorInfo
   */
  ricoh.dapi.auth.getAuthenticatorInfo = function() {
    var supported, json, result;
    supported = ricoh.dapi.getSupport();
    if ( !supported || !supported.authenticator ) {
      console.log( "authenticator unsupported" );
      return { existsProvider : false };
    }
    else {
      json = ricoh.dapi.internal.browserCall( ricoh_exjs+"ricoh.dapi.auth.getAuthenticatorInfo", arguments[0] ? JSON.stringify( arguments[0] ) : "");
      try {
        result = JSON.parse( json );
      } catch( exception ) {
        console.log( json + ":parse failed.", exception );
      }
      return result;
    }
  };

  /**
   * Function to register auth event listener for the Adaptable Authentication API (AAA).
   *
   * @method addListener
   */
  ricoh.dapi.auth.addListener = function( listener ) {
    var supported, onLogin, onLogout, result = false;
    supported = ricoh.dapi.getSupport();
    if ( !supported || !supported.authenticator ) {
      console.log( "authenticator unsupported" );
    }
    else {
      if ( listener && listener.authenticator ) {
        onLogin  = listener.authenticator.onLogin;
        onLogout = listener.authenticator.onLogout;
        if ( onLogin && typeof onLogin === "function" ) {
          ricoh.dapi.internal.callbacks.onLogin = onLogin;
          result = true;
        }
        if ( onLogout && typeof onLogout === "function" ) {
          ricoh.dapi.internal.callbacks.onLogout = onLogout;
          result = true;
        }
      }
    }
    return result;
  };

  /**
   * Provides the alternate functionality of window.navigator.
   *
   * @namespace ricoh.dapi.navigator
   */
  ricoh.dapi.navigator = ricoh.dapi.navigator || {};
  ricoh.dapi.navigator.appVersion = "2.120.0";
  ricoh.dapi.navigator.userAgent  = "deviceBrowser";
  ricoh.dapi.navigator.language;
  ricoh.dapi.navigator.v_size;

  /**
   * Provides the functionality to change browser settings.
   *
   * @namespace ricoh.dapi.setting
   */
  ricoh.dapi.setting = ricoh.dapi.setting || {};

  /**
   * Get browser settinges.
   * It will call getSettingResult.
   *
   * @method getSettings
   */
  ricoh.dapi.setting.getSettings = function() {
    ricoh.dapi.internal.browserCall( ricoh_exjs + "ricoh.dapi.setting.getSettings", "" );
  };

  /**
   * Callback of getSettings
   *
   * @method getSettingsResult
   * @param  {Boolean} result
   * @param  {Object}  settings
   */
  ricoh.dapi.setting.getSettingsResult = function() {
    // This JavaScript library user must override this function.
  };

//
// --- ricoh.dapi.event ---
//
  ricoh.dapi.event = ricoh.dapi.event || {};
//
// --- ricoh.dapi.event.scanner ---
//
  ricoh.dapi.event.scanner = ricoh.dapi.event.scanner || {};
  
  ricoh.dapi.event.scanner.addEventListener = function() {
    if ( ricoh.dapi.event.scanner.listener === true ) {
      setTimeout( function() { ricoh.dapi.event.scanner.addEventListenerResult( true ); } , 0 );
    }
    else {
      ricoh.dapi.internal.browserCall( ricoh_exjs + "ricoh.dapi.event.scanner.addEventListener", "" );
    }
  };

  /**
   * ricoh.dapi.event.scanner.addEventListenerResult( result )
   */
  ricoh.dapi.event.scanner.addEventListenerResult = function() {
    // This JavaScript library user must override this function.
  };

  ricoh.dapi.event.scanner.removeEventListener = function() {
    ricoh.dapi.internal.browserCall( ricoh_exjs + "ricoh.dapi.event.scanner.removeEventListener", "" );
    ricoh.dapi.event.scanner.listener = false;
  };

  /**
   * ricoh.dapi.event.scanner.onEvent( event )
   */
  ricoh.dapi.event.scanner.onEvent = function() {
    // This JavaScript library user must override this function.
  };

//
// --- ricoh.dapi.event.scannerJob ---
//
  ricoh.dapi.event.scannerJob = ricoh.dapi.event.scannerJob || {};
  ricoh.dapi.event.scannerJob.subscriptionId;
  ricoh.dapi.event.scannerJob.listeners;

  ricoh.dapi.event.scannerJob.getSubscriptionId = function() {
    ricoh.dapi.event.scannerJob.subscriptionId = ricoh.dapi.internal.browserCall( ricoh_exjs + "ricoh.dapi.event.scannerJob.getSubscriptionId", "" );
    return ricoh.dapi.event.scannerJob.subscriptionId;
  };

  ricoh.dapi.event.scannerJob.removeSubscriptionId = function() {
    ricoh.dapi.event.scannerJob.subscriptionId = null;
    ricoh.dapi.internal.browserCall( ricoh_exjs + "ricoh.dapi.event.scannerJob.removeSubscriptionId", "" );
  };

  ricoh.dapi.event.scannerJob.addEventListener = function( jobId ) {
    ricoh.dapi.event.scannerJob.listeners = ricoh.dapi.internal.jobAddEventListener(
                  jobId,
                  ricoh.dapi.event.scannerJob.listeners,
                  "ricoh.dapi.event.scannerJob.addEventListener",
                  "ricoh.dapi.event.scannerJob.getSubscriptionId",
                  function() { ricoh.dapi.event.scannerJob.addEventListenerResult ( true, jobId ); },
                  function() { ricoh.dapi.event.scannerJob.addEventListenerResult ( false, jobId ); }
                  );

  };

  /**
   * ricoh.dapi.event.scannerJob.addEventListenerResult( result, jobId )
   */
  ricoh.dapi.event.scannerJob.addEventListenerResult = function() {
    // This JavaScript library user must override this function.
  };

  ricoh.dapi.event.scannerJob.removeEventListener = function( jobId ) {
    ricoh.dapi.internal.removeJobEventListener( jobId, ricoh.dapi.event.scannerJob.listeners, "ricoh.dapi.event.scannerJob.removeEventListener" );
  };

  /**
   * ricoh.dapi.event.scannerJob.onEvent( event )
   */
  ricoh.dapi.event.scannerJob.onEvent = function() {
    // This JavaScript library user must override this function.
  };

//
// --- ricoh.dapi.event.printer ---
//
  ricoh.dapi.event.printer = ricoh.dapi.event.printer || {};
  ricoh.dapi.event.printer.listener;
  
  ricoh.dapi.event.printer.addEventListener = function() {
    if ( ricoh.dapi.event.printer.listener === true ) {
      setTimeout( function() { ricoh.dapi.event.printer.addEventListenerResult( true ); }, 0 );
    }
    else {
      ricoh.dapi.internal.browserCall( ricoh_exjs + "ricoh.dapi.event.printer.addEventListener", "" );
    }
  };

  /**
   * ricoh.dapi.event.printer.addEventListenerResult( msg )
   */
  ricoh.dapi.event.printer.addEventListenerResult = function() {
    // This JavaScript library user must override this function.
  };

  ricoh.dapi.event.printer.removeEventListener = function() {
    ricoh.dapi.internal.browserCall( ricoh_exjs + "ricoh.dapi.event.printer.removeEventListener", "" );
    ricoh.dapi.event.printer.listener = false;
  };

  /**
   * ricoh.dapi.event.printer.onEvent( event )
   */
  ricoh.dapi.event.printer.onEvent = function() {
    // This JavaScript library user must override this function.
  };

//
// --- ricoh.dapi.event.printerJob ---
//
  ricoh.dapi.event.printerJob = ricoh.dapi.event.printerJob || {};
  ricoh.dapi.event.printerJob.subscriptionId;
  ricoh.dapi.event.printerJob.listeners;

  ricoh.dapi.event.printerJob.getSubscriptionId = function() {
    ricoh.dapi.event.printerJob.subscriptionId = ricoh.dapi.internal.browserCall( ricoh_exjs + "ricoh.dapi.event.printerJob.getSubscriptionId", "" );
    return ricoh.dapi.event.printerJob.subscriptionId;
  };

  ricoh.dapi.event.printerJob.removeSubscriptionId = function() {
    ricoh.dapi.event.printerJob.subscriptionId = null;
    ricoh.dapi.internal.browserCall( ricoh_exjs + "ricoh.dapi.event.printerJob.removeSubscriptionId", "" );
  };

  ricoh.dapi.event.printerJob.addEventListener = function( jobId ) {
    ricoh.dapi.event.printerJob.listeners = ricoh.dapi.internal.jobAddEventListener(
                  jobId,
                  ricoh.dapi.event.printerJob.listeners,
                  "ricoh.dapi.event.printerJob.addEventListener",
                  "ricoh.dapi.event.printerJob.getSubscriptionId",
                  function() { ricoh.dapi.event.printerJob.addEventListenerResult( true, jobId ); },
                  function() { ricoh.dapi.event.printerJob.addEventListenerResult( false, jobId ); }
                  );

  };

  /**
   * ricoh.dapi.event.printerJob.addEventListenerResult( result, jobId )
   */
  ricoh.dapi.event.printerJob.addEventListenerResult = function() {
    // This JavaScript library user must override this function.
  };

  ricoh.dapi.event.printerJob.removeEventListener = function( jobId ) {
    ricoh.dapi.internal.removeJobEventListener( jobId, ricoh.dapi.event.printerJob.listeners, "ricoh.dapi.event.printerJob.removeEventListener" );
  };

  /**
   * ricoh.dapi.event.printerJob.onEvent( event )
   */
  ricoh.dapi.event.printerJob.onEvent = function() {
    // This JavaScript library user must override this function.
  };

//
// --- ricoh.dapi.event.copy ---
//
  ricoh.dapi.event.copy = ricoh.dapi.event.copy || {};
  ricoh.dapi.event.copy.listener;

  ricoh.dapi.event.copy.addEventListener = function() {
    if ( ricoh.dapi.event.copy.listener === true ) {
      setTimeout( function() { ricoh.dapi.event.copy.addEventListenerResult( true ); }, 0 );
    }
    else {
      ricoh.dapi.internal.browserCall( ricoh_exjs + "ricoh.dapi.event.copy.addEventListener", "" );
    }
  };

  /**
   * ricoh.dapi.event.copy.addEventListenerResult( msg )
   */
  ricoh.dapi.event.copy.addEventListenerResult = function() {
    // This JavaScript library user must override this function.
  };

  ricoh.dapi.event.copy.removeEventListener = function() {
    ricoh.dapi.internal.browserCall( ricoh_exjs + "ricoh.dapi.event.copy.removeEventListener", "" );
    ricoh.dapi.event.copy.listener = false;
  };

  /**
   * ricoh.dapi.event.copy.onEvent( event )
   */
  ricoh.dapi.event.copy.onEvent = function() {
    // This JavaScript library user must override this function.
  };

//
// --- ricoh.dapi.event.copyJob ---
//
  ricoh.dapi.event.copyJob = ricoh.dapi.event.copyJob || {};
  ricoh.dapi.event.copyJob.subscriptionId;
  ricoh.dapi.event.copyJob.listeners;

  ricoh.dapi.event.copyJob.getSubscriptionId = function() {
    ricoh.dapi.event.copyJob.subscriptionId = ricoh.dapi.internal.browserCall( ricoh_exjs + "ricoh.dapi.event.copyJob.getSubscriptionId", "" );
    return ricoh.dapi.event.copyJob.subscriptionId;
  };

  ricoh.dapi.event.copyJob.removeSubscriptionId = function() {
    ricoh.dapi.event.copyJob.subscriptionId = null;
    ricoh.dapi.internal.browserCall( ricoh_exjs + "ricoh.dapi.event.copyJob.removeSubscriptionId", "" );
  };

  ricoh.dapi.event.copyJob.addEventListener = function( jobId ) {
    ricoh.dapi.event.copyJob.listeners = ricoh.dapi.internal.jobAddEventListener(
                  jobId,
                  ricoh.dapi.event.copyJob.listeners,
                  "ricoh.dapi.event.copyJob.addEventListener",
                  "ricoh.dapi.event.copyJob.getSubscriptionId",
                  function() { ricoh.dapi.event.copyJob.addEventListenerResult( true, jobId ); },
                  function() { ricoh.dapi.event.copyJob.addEventListenerResult( false, jobId ); }
                  );

  };

  /**
   * ricoh.dapi.event.copyJob.addEventListenerResult( result, jobId )
   */
  ricoh.dapi.event.copyJob.addEventListenerResult = function() {
    // This JavaScript library user must override this function.
  };

  ricoh.dapi.event.copyJob.removeEventListener = function( jobId ) {
    ricoh.dapi.internal.removeJobEventListener( jobId, ricoh.dapi.event.copyJob.listeners, "ricoh.dapi.event.copyJob.removeEventListener" );
  };

  /**
   * ricoh.dapi.event.copyJob.onEvent( event )
   */
  ricoh.dapi.event.copyJob.onEvent = function() {
    // This JavaScript library user must override this function.
  };

//
// --- ricoh.dapi.event.fax ---
//
  ricoh.dapi.event.fax = ricoh.dapi.event.fax || {};
  ricoh.dapi.event.fax.listener;

  ricoh.dapi.event.fax.addEventListener = function() {
    if ( ricoh.dapi.event.fax.listener === true ) {
      setTimeout( function() { ricoh.dapi.event.fax.addEventListenerResult( true ); }, 0 );
    }
    else {
      ricoh.dapi.internal.browserCall( ricoh_exjs + "ricoh.dapi.event.fax.addEventListener", "" );
    }
  };

  /**
   * ricoh.dapi.event.fax.addEventListenerResult( msg )
   */
  ricoh.dapi.event.fax.addEventListenerResult= function() {
    // This JavaScript library user must override this function.
  };

  ricoh.dapi.event.fax.removeEventListener = function() {
    ricoh.dapi.internal.browserCall( ricoh_exjs + "ricoh.dapi.event.fax.removeEventListener", "" );
    ricoh.dapi.event.fax.listener = false;
  };

  /**
   * ricoh.dapi.event.fax.onEvent( event )
   */
  ricoh.dapi.event.fax.onEvent = function() {
    // This JavaScript library user must override this function.
  };

//
// --- ricoh.dapi.event.faxJob ---
//
  ricoh.dapi.event.faxJob = ricoh.dapi.event.faxJob || {};
  ricoh.dapi.event.faxJob.subscriptionId;
  ricoh.dapi.event.faxJob.listeners;

  ricoh.dapi.event.faxJob.getSubscriptionId = function() {
    ricoh.dapi.event.faxJob.subscriptionId = ricoh.dapi.internal.browserCall( ricoh_exjs + "ricoh.dapi.event.faxJob.getSubscriptionId", "" );
    return ricoh.dapi.event.faxJob.subscriptionId;
  };

  ricoh.dapi.event.faxJob.removeSubscriptionId = function() {
    ricoh.dapi.event.faxJob.subscriptionId = null;
    ricoh.dapi.internal.browserCall( ricoh_exjs + "ricoh.dapi.event.faxJob.removeSubscriptionId", "" );
  };

  ricoh.dapi.event.faxJob.addEventListener = function( jobId ) {
    ricoh.dapi.event.faxJob.listeners = ricoh.dapi.internal.jobAddEventListener(
                  jobId,
                  ricoh.dapi.event.faxJob.listeners,
                  "ricoh.dapi.event.faxJob.addEventListener",
                  "ricoh.dapi.event.faxJob.getSubscriptionId",
                  function() { ricoh.dapi.event.faxJob.addEventListenerResult( true, jobId ); },
                  function() { ricoh.dapi.event.faxJob.addEventListenerResult( false, jobId ); }
                  );

  };

  /**
   * ricoh.dapi.event.faxJob.addEventListenerResult( result, jobId )
   */
  ricoh.dapi.event.faxJob.addEventListenerResult = function() {
    // This JavaScript library user must override this function.
  };

  ricoh.dapi.event.faxJob.removeEventListener = function( jobId ) {
    ricoh.dapi.internal.removeJobEventListener( jobId, ricoh.dapi.event.faxJob.listeners, "ricoh.dapi.event.faxJob.removeEventListener" );
  };

  /**
   * ricoh.dapi.event.faxJob.onEvent( event )
   */
  ricoh.dapi.event.faxJob.onEvent = function() {
    // This JavaScript library user must override this function.
  };

//
// --- ricoh.dapi.card ---
//
  ricoh.dapi.card = ricoh.dapi.card || {};
  ricoh.dapi.card.useFunction;

  ricoh.dapi.card.registerCard = function( callbacks ) {
    var supported,
        result,
      register = "";

    supported = ricoh.dapi.getSupport();
    if ( !supported || !supported.availableDapiCard ) {
      return false;
    }
    ricoh.dapi.card.useFunction = true;

    if ( callbacks ) {
      if ( callbacks.onAttached && typeof callbacks.onAttached === "function" ) {
        ricoh.dapi.internal.callbacks.onAttached = callbacks.onAttached;
        register += "onAttached,";
      }
      if ( callbacks.onDetached && typeof callbacks.onDetached === "function" ) {
        ricoh.dapi.internal.callbacks.onDetached = callbacks.onDetached;
        register += "onDetached,";
      }
      if ( callbacks.onRequestPinCode && typeof callbacks.onRequestPinCode === "function" ) {
        ricoh.dapi.internal.callbacks.onRequestPinCode = callbacks.onRequestPinCode;
        register += "onRequestPinCode,";
      }
    }

    result = ricoh.dapi.internal.browserCall( ricoh_exjs + "ricoh.dapi.card.registerCard", register );
    if ( "ricoh.dapi.card.registerCard" !== result ) {
      ricoh.dapi.internal.callbacks = {};
      ricoh.dapi.card.useFunction = false;
      return false;
    }
    return true;
  };

  ricoh.dapi.card.getCardInfo = function() {
    var card_info, card_info_json;
    
    if ( ricoh.dapi.card.useFunction ) {
      card_info_json = ricoh.dapi.internal.browserCall( ricoh_exjs + "ricoh.dapi.card.getCardInfo", "" );
      try {
        card_info = JSON.parse( card_info_json );
      }
      catch( err ) {
        console.log( err );
      }
    }
    return card_info;
  };

  ricoh.dapi.card.requestCardPinCode = function( pinInfo ) {
    var obj;
    if ( ricoh.dapi.card.useFunction && ricoh.dapi.internal.callbacks.onRequestPinCode ) {
      if ( pinInfo && pinInfo.requestId && ricoh.dapi.internal.pinRequestIds[pinInfo.requestId] ) {
        obj = {
          REQUEST_ID : pinInfo.requestId,
          PIN_CODE : pinInfo.pinCode,
          IS_CANCELLED : ( !pinInfo.pinCode || pinInfo.isCancelled === true ) ? ( true ) : ( false ),
        };
        if( ricoh.dapi.internal.browserCall( ricoh_exjs + "ricoh.dapi.card.requestCardPinCode", JSON.stringify( obj ) ) ) {
          return true;
        }
      }
    }
    return false;
  };

  ricoh.dapi.card.lockCardInfo = function( cardInfo ) {
    var obj;
    if ( ricoh.dapi.card.useFunction && ricoh.dapi.internal.callbacks.onAttached ) {
      if ( cardInfo && cardInfo.cardIdBinary && cardInfo.supportType && cardInfo.cardType ) {
        obj = {
          SUPPORT_TYPE : cardInfo.supportType,
          CARD_TYPE : cardInfo.cardType,
          CARD_ID : cardInfo.cardIdBinary,
        };
        if( ricoh.dapi.internal.browserCall( ricoh_exjs + "ricoh.dapi.card.lockCardInfo", JSON.stringify( obj ) ) ) {
          return true;
        }
      }
    }
    return false;
  };

  ricoh.dapi.card.unlockCardInfo = function( lockInfo ) {
    if ( ricoh.dapi.card.useFunction && ricoh.dapi.internal.callbacks.onAttached ) {
      if ( lockInfo && lockInfo.lockToken && lockInfo.lockToken === ricoh.dapi.internal.lockToken ) {
        if( ricoh.dapi.internal.browserCall( ricoh_exjs + "ricoh.dapi.card.unlockCardInfo", JSON.stringify( { ACCESS_TOKEN : lockInfo.lockToken } ) ) ) {
          return true;
        }
      }
    }
    return false;
  };

  ricoh.dapi.card.requestCardDetailInfo = function( cardInfo ) {
    var obj;
    if ( ricoh.dapi.card.useFunction && ricoh.dapi.internal.callbacks.onAttached ) {
      if ( cardInfo && cardInfo.lockToken && cardInfo.lockToken === ricoh.dapi.internal.lockToken && cardInfo.cardInfoType ) {
        obj = {
          ACCESS_TOKEN : cardInfo.lockToken,
          INFO_TYPE : cardInfo.cardInfoType,
        };
        if( ricoh.dapi.internal.browserCall( ricoh_exjs + "ricoh.dapi.card.requestCardDetailInfo", JSON.stringify( obj ) ) ) {
          return true;
        }
      }
    }
    return false;
  };

  /**
   * ricoh.dapi.card.onCardPinCodeResult( pinInfo, result )
   */
  ricoh.dapi.card.onCardPinCodeResult = function() {
    // This JavaScript library user must override this function.
  };

  /**
   * ricoh.dapi.card.onCardLockStateChange( state )
   */
  ricoh.dapi.card.onCardLockStateChange = function() {
    // This JavaScript library user must override this function.
  };

  /**
   * ricoh.dapi.card.onCardDetailInfoResult( cardInfo, result )
   */
  ricoh.dapi.card.onCardDetailInfoResult = function() {
    // This JavaScript library user must override this function.
  };

//
// --- ricoh.dapi.internal ---
//
  ricoh.dapi.internal = ricoh.dapi.internal || {};
  ricoh.dapi.internal.xhr;
  
  ricoh.dapi.internal.browserCall = function( f, p ) {
    return ricoh_exjs ? window.prompt( f, p ) : "";
  };
  
  ricoh.dapi.internal.auth_onreadystatechange = function() {
    var res, r;
    
    if ( ricoh.dapi.internal.xhr.readyState === 4 ) {
      if ( ricoh.dapi.internal.xhr.status === 200 ) {
        // success
        res = ricoh.dapi.internal.xhr.responseText;
        try {
          r = JSON.parse( res );
          ricoh.dapi.auth.getTokenResult( true, r.token );
        }
        catch( err ) {
          console.log( err );
          ricoh.dapi.auth.getTokenResult( false, undefined );
        }
      }
      else {
        // failure
        ricoh.dapi.auth.getTokenResult( false, undefined );
      }
    }
  };


  ricoh.dapi.internal.scannerJob_onEvent = function( event ) {
    if ( typeof ricoh.dapi.event.scannerJob.subscriptionId !== "undefined" && ricoh.dapi.event.scannerJob.subscriptionId !== null ) {
      var js_event = JSON.parse( event );
      
      if ( ricoh.dapi.internal.containList( ricoh.dapi.event.scannerJob.listeners, js_event.data.jobId ) === true ) {	// detect Job ID !
        ricoh.dapi.event.scannerJob.onEvent( event );
      }
    }
  };
  
  ricoh.dapi.internal.printerJob_onEvent = function( event ) {
    if ( typeof ricoh.dapi.event.printerJob.subscriptionId !== "undefined" && ricoh.dapi.event.printerJob.subscriptionId !== null ) {
      var js_event = JSON.parse( event );
      
      if ( ricoh.dapi.internal.containList( ricoh.dapi.event.printerJob.listeners, js_event.data.jobId ) === true ) {	// detect Job ID !
        ricoh.dapi.event.printerJob.onEvent( event );
      }
    }
  };
  
  ricoh.dapi.internal.copyJob_onEvent = function( event ) {
    if ( typeof ricoh.dapi.event.copyJob.subscriptionId !== "undefined" && ricoh.dapi.event.copyJob.subscriptionId !== null ) {
      var js_event = JSON.parse( event );
      
      if ( ricoh.dapi.internal.containList( ricoh.dapi.event.copyJob.listeners, js_event.data.jobId ) === true ) {	// detect Job ID !
        ricoh.dapi.event.copyJob.onEvent( event );
      }
    }
  };
  
  ricoh.dapi.internal.faxJob_onEvent = function( event ) {
    if ( typeof ricoh.dapi.event.faxJob.subscriptionId !== "undefined" && ricoh.dapi.event.faxJob.subscriptionId !== null ) {
      var js_event = JSON.parse( event );
      
      if ( ricoh.dapi.internal.containList( ricoh.dapi.event.faxJob.listeners, js_event.data.jobId ) === true ) {	// detect Job ID !
        ricoh.dapi.event.faxJob.onEvent( event );
      }
    }
  };
  
  ricoh.dapi.internal.jobAddEventListener = function( jobId, listeners, event_string, get_subscriptionId_string, func_ok, func_ng ) {
    if ( typeof jobId === "string" ) {
      if ( ricoh.dapi.internal.containList( listeners, jobId ) === true ) {	// return true in a case already registered
        setTimeout( func_ok , 0 );
        console.log( "duplicate Job ID..." );
      }
      else {
        var subscriptionId = ricoh.dapi.internal.browserCall( ricoh_exjs + get_subscriptionId_string, "" );
        if ( subscriptionId !== null ) {
          listeners = ricoh.dapi.internal.addListElement( listeners, jobId );
          setTimeout( func_ok , 0 );
        }
        else {
          // no subscriptionId
          console.log( "can't add jobEventListener :no subscriptionId..." );
          setTimeout( func_ng , 0 );
        }
      }
    }
    else {
      console.log( "parameter error" );
      setTimeout( func_ng , 0 );
    }
    
    return listeners;
  };
  
  ricoh.dapi.internal.removeJobEventListener = function( jobId, listeners, event_string ) {
    if ( typeof jobId === "string" ) {
      if ( ricoh.dapi.internal.containList( listeners, jobId ) === true ) {	// return true in a case already registered
        listeners = ricoh.dapi.internal.removeListElement( listeners, jobId );
      }
    }
    else {
      console.log( event_string + ":parameter error" );
    }
    
    return listeners;
  };

  ricoh.dapi.internal.billingCodeChanged = function() {
    ricoh.dapi.auth.getBillingCode();
  };

  ricoh.dapi.internal.setCustomHeadersResult = function( param ) {
    var result = JSON.parse( param );
    ricoh.dapi.setCustomHeadersResult( result );
  };

  ricoh.dapi.internal.clearCustomHeadersResult = function( param ) {
    var result = JSON.parse( param );
    ricoh.dapi.clearCustomHeadersResult( result );
  };

  ricoh.dapi.internal.notifyLoginAuthenticator = function() {
    if( ricoh.dapi.internal.callbacks.onLogin ) {
      ricoh.dapi.internal.callbacks.onLogin();
    }
  };

  ricoh.dapi.internal.notifyLogoutAuthenticator = function() {
    if( ricoh.dapi.internal.callbacks.onLogout ) {
      ricoh.dapi.internal.callbacks.onLogout();
    }
  };

  ricoh.dapi.internal.onReceive = function( param ) {
    var intent = JSON.parse( param );
    ricoh.dapi.onReceive( intent );
  };
  
  ricoh.dapi.internal.onReceiveIntent = function ( param ) {
    var intent = decodeURIComponent( param ) ;
    ricoh.dapi.internal.onReceive(intent);
  }

  // wait queue for Download/Upload
  ricoh.dapi.internal.downloadUploadQueue;
  // executing list for Download/Upload (element:requestId)
  ricoh.dapi.internal.downloadUploadExecuting = new Array(0);
  
  ricoh.dapi.internal.downloadUpload = function( kind, requestId, param ) {
    var duLoad = {
      kind : kind,
      requestId : requestId,
      param : param
    };
    
    ricoh.dapi.internal.downloadUploadQueue = ricoh.dapi.internal.addListElement( ricoh.dapi.internal.downloadUploadQueue, duLoad );
    if ( duLoad.kind === 0 ) {
      ricoh.dapi.net.onDownloadStateChange( duLoad.requestId, "uninitialized", undefined, 0, undefined, 0 );
    }
    else {
      ricoh.dapi.net.onUploadStateChange( duLoad.requestId, "uninitialized", undefined, 0, undefined, 0 );
    }
    
    if ( ricoh.dapi.internal.downloadUploadExecuting.length < ricoh.dapi.net.executingMaxNum &&
      ricoh.dapi.internal.downloadUploadQueue.length === 1 ) {
      ricoh.dapi.internal.executeDownloadUpload( duLoad );
    }
  };
  
  ricoh.dapi.internal.executeDownloadUpload = function( duLoad ) {
    var result;
    if ( duLoad.kind === 0 ) {
      result = ricoh.dapi.internal.browserCall( ricoh_exjs + "ricoh.dapi.net.download", duLoad.param );
      if ( result !== null ) {
        ricoh.dapi.internal.downloadUploadExecuting = ricoh.dapi.internal.addListElement( ricoh.dapi.internal.downloadUploadExecuting, duLoad.requestId );
        ricoh.dapi.internal.downloadUploadQueue = ricoh.dapi.internal.removeListElement( ricoh.dapi.internal.downloadUploadQueue, duLoad );
      }
    }
    else {
      result = ricoh.dapi.internal.browserCall( ricoh_exjs + "ricoh.dapi.net.upload", duLoad.param );
      if ( result!==null ) {
        ricoh.dapi.internal.downloadUploadExecuting = ricoh.dapi.internal.addListElement( ricoh.dapi.internal.downloadUploadExecuting, duLoad.requestId );
        ricoh.dapi.internal.downloadUploadQueue = ricoh.dapi.internal.removeListElement( ricoh.dapi.internal.downloadUploadQueue, duLoad );
      }
    }
  };
  
  ricoh.dapi.internal.onDownloadStateChange = function( msg ) {
    var res, nextDownloadUpload;
    res = JSON.parse(msg);
    ricoh.dapi.net.onDownloadStateChange( res.requestId, res.state, res.result, res.status, res.error, res.progress );
    if ( res.state === "success" || res.state === "failure" ) {
      ricoh.dapi.internal.downloadUploadExecuting = ricoh.dapi.internal.removeListElement( ricoh.dapi.internal.downloadUploadExecuting, res.requestId );
      nextDownloadUpload = ricoh.dapi.internal.getListElement( ricoh.dapi.internal.downloadUploadQueue );
      if ( nextDownloadUpload !== null ) {
        ricoh.dapi.internal.executeDownloadUpload( nextDownloadUpload );
      }
    }
  };
  
  ricoh.dapi.internal.onUploadStateChange = function( msg ) {
    var res, nextDownloadUpload;
    res = JSON.parse(msg);
    if ( typeof res.responseBody !== "undefined" ) {
      try {
        res.responseBody = decodeURIComponent( res.responseBody );
      } catch( err ) {
        console.log( err );
      }
    }
    ricoh.dapi.net.onUploadStateChange( res.requestId, res.state, res.result, res.status, res.error, res.progress, res.responseBody );
    if ( res.state === "success" || res.state === "failure" ) {
      ricoh.dapi.internal.downloadUploadExecuting = ricoh.dapi.internal.removeListElement( ricoh.dapi.internal.downloadUploadExecuting, res.requestId );
      nextDownloadUpload = ricoh.dapi.internal.getListElement( ricoh.dapi.internal.downloadUploadQueue );
      if ( nextDownloadUpload !== null ) {
        ricoh.dapi.internal.executeDownloadUpload( nextDownloadUpload );
      }
    }
  };
  
  ricoh.dapi.internal.notifyDownloadUploadFinish = function() {
  };

  ricoh.dapi.internal.abortDownloadUpload = function( requestId ) {
    var queue, list,
      i;
    queue = ricoh.dapi.internal.downloadUploadQueue;
    list = ricoh.dapi.internal.downloadUploadExecuting;
    if ( typeof queue !== "undefined" ) {
      for ( i = 0; i < queue.length; ) {
        if ( queue[i].requestId === requestId || typeof requestId !== "string" ) {
          // remove
          if ( queue[i].kind === 0 ) {
            ricoh.dapi.net.onDownloadStateChange( queue[i].requestId, "failure", undefined, 0, "UserAborted", 0 );
          }
          else {
            ricoh.dapi.net.onUploadStateChange( queue[i].requestId, "failure", undefined, 0, "UserAborted", 0 );
          }
          delete queue[i];
          queue.splice( i, 1 );
        }
        else {
          i++;
        }
      }
    }

    if ( typeof requestId === "string" ) {
      ricoh.dapi.internal.browserCall( ricoh_exjs + "ricoh.dapi.net.abort", requestId );
    }
    else {
      for( i = 0; i < list.length ; i++ ) {
        ricoh.dapi.internal.browserCall( ricoh_exjs + "ricoh.dapi.net.abort", list[i] );
      }
      ricoh.dapi.internal.browserCall( ricoh_exjs + "ricoh.dapi.net.abort", "" );
    }
  };
  
  // Add List Element
  ricoh.dapi.internal.addListElement = function( arrayList, element ) {
    var listener_num,
      i;
    if ( typeof arrayList === "undefined" ) {
      arrayList = new Array(1);
      arrayList[0] = element;
    }
    else {
      listener_num = arrayList.length;
      
      for ( i = 0; i < listener_num; i++ ) {
        if ( arrayList[i] === element ) {
          return arrayList;
        }
      }
      arrayList[listener_num] = element;
    }
    return arrayList;
  };

  // Remove List Element
  ricoh.dapi.internal.removeListElement = function( arrayList, element ) {
    var i;
    for( i = 0; i < arrayList.length; i++ ) {
      if ( arrayList[i] === element ) {
        arrayList.splice( i, 1 );
      }
    }
    
    return arrayList;
  };

  // Get List Element
  ricoh.dapi.internal.getListElement = function( arrayList ) {
    var element = null,
      listener_num;
    if ( typeof arrayList !== "undefined" ) {
      listener_num = arrayList.length;
      
      if ( listener_num > 0 ) {
        element = arrayList[0];	// get
      }
    }
    return element;
  };

  ricoh.dapi.internal.containList = function( arrayList, element ) {
    var i;
    if ( typeof arrayList !== "undefined" ) {
      for( i = 0; i < arrayList.length; i++ ) {
        if ( arrayList[i] === element ) {
          return true;
        }
      }
    }
    
    return false;
  };

  ricoh.dapi.internal.serialNumber = undefined;
  ricoh.dapi.internal.getSerialNumber = function() {
    var xhr, adrs, uri, port, query,
      res, r;
    if ( !ricoh_exjs ) {
      return undefined;
    }
    if ( typeof ricoh.dapi.internal.serialNumber !== "undefined" ) {
      return ricoh.dapi.internal.serialNumber;
    }
    xhr = new XMLHttpRequest();
    adrs = ricoh.dapi.getAddress();
    port = ricoh.dapi.getPort();
    uri = "http://" + adrs + ":" + port.http + "/rws/property/deviceInfo";
    query = "_=" + ricoh.dapi.internal.createRandomString();
    uri += "?" + query;
    xhr.open( "GET", uri, false );
    xhr.setRequestHeader( "Accept", "application/json" );
    xhr.send( null );

    if ( xhr.status === 200 ) {
      res = xhr.responseText;
      try {
        r = JSON.parse( res );
        ricoh.dapi.internal.serialNumber = r.deviceDescription.serialNumber;
        return ricoh.dapi.internal.serialNumber;
      } catch( err ) {
        console.log( err );
        return undefined;
      }
    } else {
      console.log( "status : " + xhr.status );
    }

    return undefined;
  };
  ricoh.dapi.internal.getSerialNumberAsync = function() {
    var xhr, adrs, uri, port;
    if ( !ricoh_exjs ) {
      return false;
    }
    xhr = new XMLHttpRequest();
    adrs = ricoh.dapi.getAddress();
    port = ricoh.dapi.getPort();
    uri = "https://" + adrs + ":" + port.https + "/rws/property/deviceInfo";
    xhr.open( "GET", uri, true );
    xhr.setRequestHeader( "Accept", "application/json" );
    xhr.send( null );

    return true;
  };

  ricoh.dapi.internal.createRandomString = function( len ) {
    var result,
      i,
      alphabets;

    result = "",
    alphabets = "123456789abcdefghijklmnopqrstuvxwyzABCDEFGHIJKLMNOPQRSTUVXWYZ";
    if ( !len ) {
      len = 8;
    }
    
    for ( i = 0; i < len; i++ ) {
      result += alphabets.charAt( Math.floor( Math.random() * alphabets.length ) + 1 );
    }
    return result;
  };


  //Queuing validate callback
  ricoh.dapi.internal.validateAccessTokenResultListeners;
  ricoh.dapi.internal.suspendValidationCallback;

  //Caching validate result
  ricoh.dapi.internal.validateAccessTokenCache = {
    "requestToken" : undefined,
    "validateResult" : undefined
  };

  //validate callback from browser native.
  ricoh.dapi.internal.validateAccessTokenResult = function( result, callback ) {
    var resultObject,
      listeners,
      listeners_length,
      i;

    try {
      resultObject = JSON.parse( result );
      if ( resultObject.result ) {
        delete resultObject.detail;
      }

      // Caching
      ricoh.dapi.internal.validateAccessTokenCache.validateResult = resultObject;

      // Callback
      if ( typeof callback === "function" ) {
        callback( resultObject );
      } else {
        listeners = ricoh.dapi.internal.validateAccessTokenResultListeners;
        if ( listeners ) {
          listeners_length = listeners.length;
          for( i = 0; i < listeners_length; i++ ) {
            if ( typeof listeners[i] === "function" ) {
              listeners[i]( resultObject );
            }
          }
          // initialize
          ricoh.dapi.internal.validateAccessTokenResultListeners = undefined;
        }
      }

      // call event listener
      if ( ricoh.dapi.internal.suspendValidationCallback ) {
        ricoh.dapi.internal.suspendValidationCallback( { result : true } );
        ricoh.dapi.internal.suspendValidationCallback = null;
      }
      else {
        ricoh.dapi.validateAccessTokenResult( resultObject );
      }
    } catch( e ) {
      console.log( e );
    }
  };
  
  ricoh.dapi.internal.pinRequestIds = {};
  ricoh.dapi.internal.lockToken;
  ricoh.dapi.internal.callbacks = {};

  ricoh.dapi.internal.getAppType = function( appType ) {
    var result = appType;
    switch ( appType ) {
      case "scanner":
        result = "SCANNER";
        break;
      case "printer":
        result = "PRINTER";
        break;
      case "copy":
        result = "COPIER";
        break;
      case "fax":
        result = "FAX";
        break;
      default:
        break;
    }
    return result;
  };

  ricoh.dapi.internal.onAttached = function( cardInfo ) {
    var cardInfoObj = JSON.parse( cardInfo );
    
    if ( ricoh.dapi.internal.callbacks.onAttached ) {
      ricoh.dapi.internal.callbacks.onAttached( cardInfoObj );
    }
    ricoh.dapi.auth.detectCard( cardInfoObj.cardIdString );
  };
  
  ricoh.dapi.internal.onDetached = function( cardInfo ) {
    var cardInfoObj;
    
    if ( ricoh.dapi.internal.callbacks.onDetached ) {
      cardInfoObj = JSON.parse( cardInfo );
      ricoh.dapi.internal.callbacks.onDetached( cardInfoObj );
    }
  };
  
  ricoh.dapi.internal.onRequestPinCode = function( pinInfoJson ) {
    var pinInfo = JSON.parse( pinInfoJson );
    
    if( pinInfo && pinInfo.requestId ) {
      if ( ricoh.dapi.internal.callbacks.onRequestPinCode ) {
        ricoh.dapi.internal.pinRequestIds[pinInfo.requestId] = true;
        ricoh.dapi.internal.callbacks.onRequestPinCode( pinInfo );
      }
      else {
        ricoh.dapi.internal.browserCall( ricoh_exjs + "ricoh.dapi.card.requestCardPinCode", JSON.stringify( {
          requestId : pinInfo.requestId,
          isCancelled : false,
        } ) );
      }
    }
  };
  
  ricoh.dapi.internal.onCardPinCodeResult = function( pinResultJson ) {
    var result, pinInfo, obj;

    if ( ricoh.dapi.card.useFunction && ricoh.dapi.internal.callbacks.onRequestPinCode ) {
      if ( pinResultJson ) {
        obj = JSON.parse( pinResultJson );
        pinInfo = {
          requestId : obj.requestId,
          pinCode : obj.pinCode,
          isCancelled : obj.isCancelled,
        };
        result = {
          result : obj.result
        };
        switch ( obj.errorCode ) {
          case 0:
            break;
          case 1:
            result.error = "Parameter";
            break;
          case 2:
            result.error = "IncorrectPinCode";
            break;
          case 3:
            result.error = "NotAcceess";
            break;
          case 4:
            result.error = "Lockout";
            break;
          default:
            result.error = "Other";
            break;
        }
      }

      if ( result && pinInfo && pinInfo.requestId &&
        ricoh.dapi.internal.pinRequestIds[pinInfo.requestId] ) {
        ricoh.dapi.internal.pinRequestIds[pinInfo.requestId] = null;
        ricoh.dapi.card.onCardPinCodeResult( pinInfo, result );
      }
    }
  };
  
  ricoh.dapi.internal.onCardLockStateChange = function( stateJson ) {
    var state;

    if ( ricoh.dapi.card.useFunction && ricoh.dapi.internal.callbacks.onAttached ) {
      state = JSON.parse( stateJson );
      switch ( state.errorCode ) {
        case 0:
          break;
        case 1:
          state.error = "Parameter";
          break;
        case 2:
          state.error = "Attached";
          break;
        case 3:
          state.error = "Detached";
          break;
        case 4:
          state.error = "Timeout";
          break;
        default:
          state.error = "Other";
          break;
      }
      delete state.errorCode;
      if ( state.isLocked && state.lockToken ) {
        ricoh.dapi.internal.lockToken = state.lockToken;
      }
      ricoh.dapi.card.onCardLockStateChange( state );
    }
  };
  
  ricoh.dapi.internal.onCardDetailInfoResult = function( resultJson ) {
    var cardInfo, result, obj;
    
    if ( ricoh.dapi.card.useFunction ) {
      obj = JSON.parse( resultJson );
      if( obj && obj.lockToken && obj.lockToken === ricoh.dapi.internal.lockToken ) {
        cardInfo = {
          lockToken : obj.lockToken,
          cardInfoType : obj.cardInfoType,
        };
        result = {
          result : obj.result,
          info : obj.info,
        };
        switch ( obj.error_code ) {
          case 0:
            break;
          case 1:
            result.error = "Parameter";
            break;
          case 2:
            result.error = "InvalidLockToken";
            break;
          case 3:
            result.error = "UnsupportedInfo";
            break;
          default:
            result.error = "Other";
            break;
        }
        ricoh.dapi.card.onCardDetailInfoResult( cardInfo, result );
      }
    }
  };

  ssdkSSLAccept = false;
  completedResult = ricoh.dapi.internal.browserCall( ricoh_exjs + "ricoh.dapi.completed", "" );
  if ( completedResult && completedResult !== "" ) {
    completedResultObject = JSON.parse( completedResult );
    if ( completedResultObject.address ) {
      ricoh.dapi.address = completedResultObject.address;
    }
    if ( completedResultObject.port ) {
      ricoh.dapi.port = completedResultObject.port;
    }
    if ( completedResultObject.language ) {
      ricoh.dapi.navigator.language = completedResultObject.language;
    }
    if ( completedResultObject.ssdkSSLAccept === true ) {
      ssdkSSLAccept = completedResultObject.ssdkSSLAccept;
    }
  }

  // Compatible with old version.
  if ( !ricoh.dapi.navigator.language ) {
    ricoh.dapi.navigator.language = ricoh.dapi.internal.browserCall( ricoh_exjs + "ricoh.dapi.intarnal.getLanguage", "" );
  }
  if ( !ssdkSSLAccept ) {
    ricoh.dapi.internal.getSerialNumberAsync();
  }
}).call( this );


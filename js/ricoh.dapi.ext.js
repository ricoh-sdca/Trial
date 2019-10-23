/**
 * @copyright Copyright 2013-2015 Ricoh Company, Ltd. All Rights Reserved.
 * @license Released under the MIT license
 * 
 * Copyright (c) 2013-2014 Ricoh Company, Ltd. All Rights Reserved.
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
 * This ricoh.dapi.ext.js supports SmartSdk Version : 2.00
 */

/**
 * Provides the webapi wrapper classes which enable developers to create applications connected to each device API.
 * @module ricoh.dapi
 */
(function() {
  "use strict";
  var ricoh, dapi,
      HttpClient, ApiClient,
      Logger, ConsoleAppender, RemoteAppender,
      util,
      root = this;

  /**
   * Error object.<br />
   *
   * @typedef  {Object}  ErrorObject
   * @property {Array}   errors - array of error descriptions<br />
   *                              Basically api response is set to this property, but in case of empty response body or network error,<br />
   *                              client original messages is set.
   * @property {Integer} code - HTTP Status or 0
   * @see      javascript library API reference.
   */

  /**
   * @namespace ricoh
   */
  ricoh = root.ricoh = root.ricoh || {};
  
  /**
   * @namespace ricoh.dapi
   */
  dapi = ricoh.dapi = ricoh.dapi || {};

  /**
   * @private
   *
   * @property   httpClient
   * @type       {HttpClient}
   */

  /**
   * @constructor HttpClient
   */
  HttpClient = dapi.httpClient = ( function() {
    /**
     * @callback HttpClient~xhrCallback
     * @param   {XMLHttpRequest} xhr
     */

    /**
     * @typedef HttpClient~HttpConfig
     * @property  {String}  url
     * @property  {String}  method - HTTP Method(GET|POST|PUT|DELETE). Default is GET.
     * @property  {Boolean} async - Default is true
     * @property  {Boolean} withoutRandomQuery - not using _=?xxx Defailt is false.
     * @property  {Object}  params - query parameters
     * @property  {String|Object} body
     * @property  {HttpClient~xhrCallback} onload
     * @property  {HttpClient~xhrCallback} onerror
     */

    /**
     * Send a http request to  API
     *
     * @method request
     * @param {HttpClient~HttpConfig} options
     */
    var _request = function( _options ) {

      var prop,
          xhr,
          url,
          contentType,
          method = "",
          query = "",
          queries = [],
          options = util.clone( _options ),
          request = {},
          defaults = {};

      //Deep copy at first.
      if ( !options ) {
        options = {};
      }
      
      // default options
      defaults = {
        method: "GET",
        dataType: "json",
        async: true
      };

      for( prop in defaults ) {
        if( !options.hasOwnProperty( prop ) ) {
          options[ prop ] = defaults[ prop ];
        }
      }

      if( options.params ) {
        if( typeof( options.params ) === "string" ) {
          query = options.params;
        } else {
          for( prop in options.params ) {
            if( options.params[ prop ] ) {
              queries.push( prop + "=" + options.params[prop] );
            }
          }
          query = queries.join("&");
        }
      }

      url = options.url;
      
      method = options.method.toUpperCase();
      if ( ! ( method === "POST" ||
               method === "GET" ||
               method === "PUT" ||
               method === "DELETE" )
         ) {
        method = "GET";
      }

      // To avoid errors caused by webview cache
      if ( method === "GET" && options.withoutRandomQuery !== true ) {
        if ( query !== "" ) {
          query += "&_=" + util.createRandomString();
        } else {
          query = "_=" + util.createRandomString();
        }
      }

      if( query !== "" ) {
        if( url.match( /\?/ ) ) {
          url += "&" + query;
        } else {
          url += "?" + query;
        }
      }

      // generate request
      request = {
        url: url,
        method: method,
        dataType: ( options.dataType === "binary" && window.Blob && window.Blob.name ) ? "blob" : "text",
        async: options.async
      };

      if ( options.body ) {
        if (typeof( options.body ) === "string" ) {
          contentType = "application/x-www-form-urlencoded";
          request.data = options.body;
          if ( Logger.isDebug() ) {
            ( function() {
              var message = options.body.substring( 0, 1000 );
              if ( options.body.length > 1000 ) {
                message += "...";
              }
              Logger.debug( "body: " + message );
            })();
          }
        } else {
          contentType = "application/json; charset=utf-8";
          request.data = JSON.stringify( options.body );
          if ( Logger.isDebug() ) {
            Logger.debug( "body: " + request.data );
          }
        }
      }

      // send request
      xhr = new XMLHttpRequest();



      xhr.open( request.method, request.url, request.async );
      
      // ResponseType can be set only on G2( blob is supported ) and for asynchoronus request.
      // Otherwise it is set to ''( means text response )
      // @see http://www.w3.org/TR/XMLHttpRequest/#the-responsetype-attribute
      if( request.async && window.Blob && window.Blob.name ) {
        xhr.responseType = request.dataType;
      }
      
      if( options.headers ) {
        for( prop in options.headers ) {
          if ( options.headers.hasOwnProperty( prop ) ) {
            if( Logger.isDebug() ) {
              Logger.debug( "add header " + prop + " => " + options.headers[prop] );
            }
            xhr.setRequestHeader( prop, options.headers[prop] );
          }
        }
      }

      if( options.onload ) {
        xhr.onload = function() {
          Logger.trace( "onload" );
          if( Logger.isDebug() ) {
            if( xhr.response && xhr.response.constructor.name === "Blob" ) {
              Logger.debug( "[" + xhr.status + "] " + xhr.response.type + ":" + xhr.response.size + "b" );
            } else {
              Logger.debug( "[" + xhr.status + "] '" + xhr.responseText + "'" );
            }
          }
          options.onload( xhr );
        };
      }

      if( options.onerror ) {
        xhr.onerror = function() {
          Logger.trace( "onerror" );
          if( Logger.isDebug() ) {
            if( xhr.response && xhr.response.constructor.name === "Blob" ) {
              Logger.debug( "[" + xhr.status + "] " + xhr.response.type + ":" + xhr.response.size + "b" );
            } else {
              Logger.debug( "[" + xhr.status + "] '" + xhr.responseText + "'");
            }
          }
          options.onerror( xhr );
        };
      }

      if( Logger.isDebug() ) {
        Logger.debug(request.method + " " + request.url);
      }
      if( contentType ) {
        xhr.setRequestHeader("Content-Type", contentType );
      }
      xhr.send( request.data );
    };

    return {
      request: _request
    };
    
  } )();

  /**
   *
   * @property   apiClient
   * @type       {ApiClient}
   */
  
  /**
   * @class       ApiClient
   * @constructor
   */
  ApiClient = dapi.apiClient = ( function() {

    /**
     *
     * @method setSSL
     * @param    {Boolean} ssl
     */
    var _setSSL = function( ssl ) {
      var port, matches;
      if( dapi.getPort ) {
        port = dapi.getPort();
      }
      
      if( ssl ) {
        _endpoint = _endpoint.replace( /^http:/, "https:" );
        if( port && port.https ) {
          matches = _endpoint.match( /^https:\/\/([^\/]+?)(:\d+)?\// );
          if( matches ) {
            _endpoint = _endpoint.replace( /^https:\/\/[^\/]+\//, "https://" + matches[1] + ":" + port.https + "/" );
          }
        }
      } else {
        _endpoint = _endpoint.replace( /^https/, "http" );
        if( port && port.http ) {
          matches = _endpoint.match( /^http:\/\/([^\/]+?)(:\d+)?\// );
          if( matches ) {
            _endpoint = _endpoint.replace( /^http:\/\/[^\/]+\//, "http://" + matches[1] + ":" + port.http + "/" );
          }
        }
      }
    },

    /**
     *
     * @method   getSSL
     * @return   {Boolean}
     */
    _getSSL = function() {
      if( _endpoint.match(/^https/) ) {
        return true;
      } else {
        return false;
      }
    },


    /**
     *
     * @method  setEndpoint
     * @param   {String} endpoint
     */
    _setEndpoint = function( endpoint ) {
      _endpoint = endpoint;
    },

    /**
     *
     * @method   getEndpoint
     * @return   {String} endpoint
     */
    _getEndpoint = function() {
      return _endpoint;
    },

    /**
     * @callback ApiClient~ApiCallback
     * @param {Object} response - parsed api response object
     * @param {XMLHttpRequest} xhr - raw xmlhttprequest
     */
    
    /**
     * @typedef ApiClient~ApiConfig
     * @property {String} path
     * @property {String} method - HTTP method(GET|POST|PUT|DELETE). Default is GET.
     * @property {Boolean} ssl - Using SSL
     * @property {String}  transactionId - transaction id
     * @property {Boolean} async - Default is true
     * @property {Object}  params - query parameters
     * @property {String|Object}  body - request body
     * @property {String} dataType - binary or json
     */
       
    /**
     * Send a http request to API
     *
     * @method  request
     * @param   {ApiClient~ApiConfig}    options
     * @param   {ApiClient~ApiCallback}  callback 
     */
    _request = function( options, callback ) {

      var request = {},
          matches,
          port,
          response; //retunred object on sync = false

      //Deep copy first
      request = util.clone( options );
      if ( !request ) {
        request = {};
      }
      
      if( request.async === undefined || request.async === null ) {
        request.async = true;
      }
      
      if( request.path === undefined || request.path === null ) {
        Logger.error( "path_required" );
        response = {};
        response.errors = [
          {
            "message_id": "error.dapi.client_error",
            "message": "path_required"
          }
        ];
        if( Logger.isDebug() ) {
          Logger.debug( JSON.stringify( response ) );
        }
        response.code = 0;
        if( !request.async ) {
          return response;
        } else {
          if( callback ) {
            callback( response, null );
          }
          return undefined;
        }
      }

      //synchronous request could not return blob
      //@see http://www.w3.org/TR/XMLHttpRequest/#the-responsetype-attribute
      if( request.async === false && request.dataType === "binary" ) {
        return {
          errors: [
            {
              message_id: "error.dapi.client_error",
              message: "synchronous_binary_request"
            }
          ],
          code: 0
        };
      }

      if( request.path.match( /^http/ ) ) {
        request.url = request.path;
      } else {
        if( request.transactionId ) {
          request.url = _endpoint + "/transaction/" + request.transactionId + request.path;
        } else {
          request.url = _endpoint + request.path;
        }
        // if ssl option has value
        if( request.hasOwnProperty( "ssl" ) ) {
          if( dapi.getPort ) {
            port = dapi.getPort();
          }
          if( request.ssl ) {
            request.url = request.url.replace( /^http:/, "https:" );
            if( port && port.https ) {
              matches = request.url.match( /^https:\/\/([^\/]+?)(:\d+)?\// );
              if( matches ) {
                request.url = request.url.replace( /^https:\/\/[^\/]+\//, "https://" + matches[1] + ":" + port.https + "/" );
                
              }
            }
          } else {
            request.url = request.url.replace( /^https/, "http" );
            if( port && port.https ) {
              matches = request.url.match( /^http:\/\/([^\/]+?)(:\d+)?\// );
              if( matches ) {
                request.url = request.url.replace( /^http:\/\/[^\/]+\//, "http://" + matches[1] + ":" + port.http + "/" );
              }
            }
          }
        }
      }

      request.onload = function( xhr ) {
        // depend on whether a xhr returns response(Text) 
        if( request.dataType === "binary" && ( xhr.response || xhr.responseText ) ) {
          Logger.debug( "binary response" );
          if( xhr.status === 200 ) {
            if( xhr.response ) {
              response = xhr.response;
            } else { //On a browser where Blob is not supported, 'binary' means raw response text.
              Logger.debug( "binary text" );
              response = xhr.responseText;
            }
          } else {
            response = {
              code: xhr.status,
              errors: [
                {
                  message_id: "error.dapi.get_binary_data",
                  message: ""
                }
              ]
            };
          }
        } else if( request.dataType !== "binary" && xhr.responseText && xhr.responseText.match(/^\s*$/) === null ) {
          //For json
          try {
            response = JSON.parse( xhr.responseText );
          }catch( e ) {
            Logger.error( "failed to parse response json" );
            response = {};
            response.errors = [
              {
                "message_id": "error.dapi.client_error",
                "message": "invalid_json"
              }
            ];
            response.code = xhr.status;
          }
          if( xhr.status < 200 || xhr.status >= 400 ) {
            response.code = xhr.status;
          }
        } else {
          //no response body on request getting text or blob
          Logger.debug( "no response body" );
          response = {};
          /* jshint indent: false */
          switch ( xhr.status ) {
          case 200:
          case 201:
          case 202: /* nothing todo */ break;
          case 400: response.errors = [ { message_id: "error.dapi.bad_request", message: "too_long_uri" } ]; response.code = 400; break;
          case 404: response.errors = [ { message_id: "error.dapi.not_found", message: "resource_not_found" } ]; response.code = 404; break;
          case 500: response.errors = [ { message_id: "error.dapi.internal_server_error", message: "unknown_error" } ]; response.code = 500; break;
          case 503: response.errors = [ { message_id: "error.dapi.temporary_unavailable", message: "system_busy" } ]; response.code = 503; break;
          default:  response.errors = [ { message_id: "error.dapi.unexpected_response", message: "unknown_status" } ]; response.code = xhr.status; break;
          }
        }
        
        if( Logger.isDebug() && request.dataType !== "binary" && response.code ) {
          Logger.debug( JSON.stringify( response ) );
        }
        
        if ( callback ) {
          callback( response, xhr );
        }
      };

      request.onerror = function( xhr ) {
        response = {};
        response.errors = [
          {
            "message_id": "error.dapi.client_error",
            "message": "network_error"
          }
        ];
        response.code = xhr.status;
        
        if( Logger.isDebug() ) {
          Logger.debug( JSON.stringify( response ) );
        }
          
        if ( callback ) {
          callback( response, xhr );
        }
      };
      HttpClient.request( request );
      return response;
    },

    /**
     * @private
     *
     * @property   _endpoint
     * @type       {String}
     */
    _endpoint = "http://localhost:80/rws",
    port;
    if ( dapi.getPort ) {
      port = dapi.getPort();
      _endpoint = "http://" + dapi.getAddress() + ":" + port.http + "/rws";
    }

    return {
      request: _request,
      setEndpoint: _setEndpoint,
      getEndpoint: _getEndpoint,
      getSSL: _getSSL,
      setSSL: _setSSL
    };

  })();

  /**
   * Console Appender (default)
   * @inner
   */
  ConsoleAppender = {
    log: function( level, msg, stack ) {
      var stackMsg = "";
      if( msg === undefined || msg === null ) {
        msg = "";
      }
      if( stack ) {
        stackMsg = " at " + stack.functionName + " (" + stack.fileName + ":" + stack.lineNumber + ")";
      }
      console.log( "[" + Logger.getLevelName( level ) + "][" + util.getTimestamp() + "]" + msg + stackMsg );
    }
  };

  /**
   * Remote Appender
   * @inner
   */
  RemoteAppender = {
    log: function( level, msg, stack ) {
      var stackMsg = "";
      if( msg === undefined || msg === null ) {
        msg = "";
      }
      if( stack ) {
        stackMsg = " at " + stack.functionName + " (" + stack.fileName + ":" + stack.lineNumber + ")";
      }
    }
  };


  /**
   * Logger
   *
   * @class logger
   */
  Logger = ( function() {
    var _level = 3, // default INFO
    _appender = ConsoleAppender,

    _originalPrepareStackTrace = Error.prepareStackTrace,

    /**
     * Output Log.
     *
     * @private
     * @method   log
     * @param    {Number} level
     * @param    {String} msg
     */
    _log = function( level, msg ) {
      if( level >= _level ) {
        var context = {};
        if( level <= Logger.DEBUG ) {
          if( Error && Error.captureStackTrace ) {
            Error.prepareStackTrace = function( e, stack ) {
              if( stack.length > 1 ) {
                return {
                  functionName: ( stack[1].getFunctionName() === null ) ? "<anonymous>" : stack[1].getFunctionName(),
                  lineNumber: stack[1].getLineNumber(),
                  fileName: stack[1].getFileName()
                };
              } else {
                return {
                  functionName: null,
                  lineNumber: null
                };
              }
            };
            Error.captureStackTrace( context, _log );
          }
        }
        if( typeof( msg ) !== "string" ) {
          msg = JSON.stringify( msg );
        }
        _appender.log( level, msg, context.stack );
        if( level <= Logger.DEBUG  && Error ) {
          Error.prepareStackTrace = _originalPrepareStackTrace;
        }
      }
    };

    return {
      log: function( level, msg ) {
        _log( level, msg );
      },
      /**
       *
       * @private
       * @method   isMode
       * @param    {Integer} level
       * @return   {Boolean}
       */
      isMode: function( level ) {
        return level >= _level;
      },
      /**
       *
       * @private
       * @method   isTrace
       * @return   {Boolean}
       */
      isTrace: function() {
        return Logger.isMode( Logger.TRACE );
      },
      /**
       *
       * @private
       * @method   trace
       * @param    {String} msg
       */
      trace: function( msg ) {
        _log( Logger.TRACE, msg );
      },
      /**
       *
       * @private
       * @method   isDebug
       * @return   {Boolean}
       */
      isDebug: function() {
        return Logger.isMode( Logger.DEBUG );
      },
      /**
       *
       * @private
       * @method   debug
       * @param    {String} msg
       */
      debug: function( msg ) {
        _log( Logger.DEBUG, msg );
      },
      /**
       *
       * @private
       * @method   isInfo
       * @return   {Boolean}
       */
      isInfo: function() {
        return Logger.isMode( Logger.INFO );
      },
      /**
       *
       * @private
       * @method   info
       * @param    {String} msg
       */
      info: function( msg ) {
        _log( Logger.INFO, msg );
      },
      /**
       *
       * @private
       * @method   isWarn
       * @return   {Boolean}
       */
      isWarn: function() {
        return Logger.isMode( Logger.WARN );
      },
      /**
       *
       * @private
       * @method   warn
       * @param    {String} msg
       */
      warn: function( msg ) {
        _log( Logger.WARN, msg );
      },
      /**
       *
       * @private
       * @method   isError
       * @return   {Boolean}
       */
      isError: function() {
        return Logger.isMode( Logger.ERROR );
      },
      /**
       *
       * @private
       * @method   error
       * @param    {String} msg
       */
      error: function( msg ) {
        _log( Logger.ERROR, msg );
      },
      /**
       *
       * @private
       * @method   setAppender
       * @param    {Appender} appender
       */
      setAppender: function( appender ) {
        _appender = appender;
      },
      /**
       *
       * @private
       * @method   setLevel
       * @param    {Integer} level
       */
      setLevel: function( level ) {
        _level = level;
      },
      /**
       *
       * @method   getLevel
       * @return   {Integer}
       */
      getLevel: function() {
        return _level;
      },
      /**
       *
       * @private
       * @method   getLevelName
       * @param    {Integer} level
       * @return   {String}  name
       */
      getLevelName: function( level ) {
        switch( level ) {
        /* jshint indent: false */
        case Logger.TRACE: return "TRACE";
        case Logger.DEBUG: return "DEBUG";
        case Logger.INFO:  return "INFO ";
        case Logger.WARN:  return "WARN ";
        case Logger.ERROR:  return "ERROR";
        default: return "OTHER";
        }
      },
      TRACE: 1,
      DEBUG: 2,
      INFO: 3,
      WARN: 4,
      ERROR: 5
    };
    
  } )();

  /**
   * Logger
   *
   */
  dapi._logger = {
    trace: function( msg ) {
      Logger.trace( msg );
    },
    debug: function( msg ) {
      Logger.debug( msg );
    },
    info: function( msg ) {
      Logger.info( msg );
    },
    warn: function( msg ) {
      Logger.warn( msg );
    },
    error: function( msg ) {
      Logger.error( msg );
    }
  },

  dapi.logger = {
    /**
     *
     * @method   setLevel
     * @param    {Integer} level
     */
    setLevel: function( level ) {
      Logger.setLevel( level );
    },
    /**
     *
     * @property  TRACE
     * @type      {Integer}
     */
    TRACE: Logger.TRACE,
    /**
     *
     * @property  DEBUG
     * @type      {Integer}
     */
    DEBUG: Logger.DEBUG,
    /**
     *
     * @property  INFO
     * @type      {Integer}
     */
    INFO:  Logger.INFO,
    /**
     *
     * @property  WARN
     * @type      {Integer}
     */
    WARN:  Logger.WARN,
    /**
     *
     * @property  ERROR
     * @type      {Integer}
     */
    ERROR: Logger.ERROR
  };

  dapi._util = util = {
    /**
     * Get a value from a nested json.
     *
     * @private
     * @method   getJsonValue
     * @param {Object}        json
     * @param {Array(String)} key - strings array from root to the leaf node.<br />[ "scanningInfo", "jobSatus" ]
     *
     */
    getJsonValue: function( json, paths ) {
      if ( paths === undefined || paths === null || paths.length === 0 ) {
        return null;
      }
      var value = null,
          key = paths[0],
          rest = paths.slice(1);
      
      if ( json && json.hasOwnProperty( key ) ) {
        value = json[key];
      } else {
        return null;
      }
      
      if ( rest.length > 0 ) {
        return util.getJsonValue( value, rest );
      } else {
        return value;
      }
    },

    /**
     * Compare two value.
     *
     * @private
     * @method  compareValue
     * @param   {Any} val1
     * @param   {Any} val2
     * @return  {Boolean} returns true if val1 equals val2
     */
    compareValue: function( val1, val2 ) {
      if ( val1 && val1.length !== undefined && val2 && val2.length !== undefined ) {
        // for array
        return util.compareArray( val1, val2 );
      }

      return val1 === val2;
    },

    /**
     * Compare two arrays.
     *
     * @private
     * @method  compareArray
     * @param   {Any} val1
     * @param   {Any} val2
     * @return  {Boolean} returns true if val1 equals val2
     */
    compareArray: function( ary1, ary2 ) {
      var i,j,
          count = 0;
      
      if ( ary1.length !== ary2.length ) {
        return false;
      }

      //Assume that there is no duplicated values in ary
      for( i = 0; i < ary1.length; i++ ) {
        for( j = 0; j < ary2.length; j++ ) {
          if ( ary1[i] === ary2[j] ) {
            count += 1;
            break;
          }
        }
      }

      return ary1.length === count;
    },

    createRandomString: function( len ) {
      var i = 0,
          result = "",
          alphabets = "123456789abcdefghijklmnopqrstuvxwyzABCDEFGHIJKLMNOPQRSTUVXWYZ";

      if ( !len ) {
        len = 8;
      }
      
      for ( i = 0; i < len; i++ ) {
        result += alphabets.charAt( Math.floor( Math.random() * alphabets.length ) + 1 );
      }

      return result;
    },

    clone: function( orig ) {
      var p, obj;

      if ( !orig ) { //null or undefined
        return orig;
      }
      
      if ( typeof orig === "object" ) {
        if ( orig instanceof Array ) {
          obj = [];
          for( p = 0; p < orig.length; p++ ) {
            obj.push( util.clone( orig[p] ) );
          }
        } else {
          obj = {};
          for( p in orig ) {
            if ( orig.hasOwnProperty( p ) ) {
              obj[p] = util.clone( orig[p] );
            }
          }
        }
      } else {
        obj = orig;
      }
      return obj;
    },

    zeroPadding: function( num, length ) {
      return ( ( new Array( length ) ).join( "0" ) + num ).slice( -Math.max( String( num ).length, length ) );
    },

    getTimestamp: function() {
      var now = new Date(),
          months = [ "Jan",  "Feb",  "Mar",  "Apr",  "May",  "Jun",  "Jul",  "Aug",  "Sep",  "Oct", "Nov", "Dec" ],
          year = now.getFullYear(),
          month = months[ now.getMonth() ],
          date = util.zeroPadding( now.getDate(), 2 ),
          hour = util.zeroPadding( now.getHours(), 2 ),
          minute = util.zeroPadding( now.getMinutes(), 2 ),
          second = util.zeroPadding( now.getSeconds(), 2 );
      return month + " " + date + " " + year + " " + hour + ":" + minute + ":" + second;
    },
    type: function( src ) {
      return Object.prototype.toString.call( src ).slice( 8, -1 );
    },
    is: function( src, srcType ) {
      return src !== undefined && src !== null && util.type( src ) === srcType;
    }
  };

}).call( this );

/**
 * @copyright Copyright 2013-2014 Ricoh Company, Ltd. All Rights Reserved.
 * @license Released under the MIT license
 * 
 * Copyright (c) 2013-2014 Ricoh Company, Ltd. All Rights Reserved.
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
 * This ricoh.dapi.ext.js supports SmartSdk Version : 1.04
 */

/**
 * Provides the webapi wrapper classes which enable developers to create applications connected to each device API.
 * @module ricoh.dapi
 */
(function() {
  "use strict";
  var ricoh, dapi,
      Device, Job,
      Scanner, ScannerJob,
      Printer, PrinterJob,
      Fax, FaxJob,
      Copy, CopyJob,
      logger, apiClient, util,
      root = this;

  /**
   * Error object.<br />
   *
   * @typedef  {Object}  ErrorObject
   * @property {Array}   errors - array of error descriptions<br />
   *                              Basically api response is set to this property, but in case of empty response body or network error,<br />
   *                              client original messages is set.
   * @property {Integer} code - HTTP Status or 0
   * @see      javascript library API reference.
   */

  /**
   * @namespace ricoh
   */
  ricoh = root.ricoh = root.ricoh || {};

  /**
   * @namespace ricoh.dapi
   */
  dapi = ricoh.dapi = ricoh.dapi || {};

  apiClient = dapi.apiClient;
  logger = dapi._logger;
  util = dapi._util;

  /**
   * Base device class.
   *
   * @private
   * @class   Device
   * @constructor
   */
  Device = function() {

    /**
     * Current app status( updated on event ).
     *
     * @property  status
     * @type      {Object}
     * @default   undefined
     */
    this.status = undefined;

    /**
     * Current app capability( cache ).
     *
     * @protected
     * @property  _capability
     * @type      {Object}
     * @default   undefined
     */
    this._capability = undefined;

    /**
     * Subscription Id
     *
     * @protected
     * @property  _subscriptionId
     * @type      {String}
     * @default   undefined
     */
    this._subscriptionId = undefined;
    
    /**
     * Jobs processed by this device.<br />
     * jobId:integer => job:Job
     *
     * @property  jobs
     * @type      {Object}
     * @default   {}
     */
    this.jobs = {};

    /**
     * Event que.<br />
     * jobId:integer => [job:Job]
     *
     * @protected
     * @property  _eventQue
     * @type      {Object}
     * @default   {} 
     */
    this._eventQue = {};
  };

  /**
   * Device Status is changed to 'idle'.
   *
   * @method onIdle
   */
  Device.prototype.onIdle = function() {};

  /**
   * Device status is changed to 'processing'.
   *
   * @method onProcessing
   */
  Device.prototype.onProcessing = function() {};

  /**
   * Device status is changed to 'stopped'.
   *
   * @method onStopped
   */
  Device.prototype.onStopped = function() {};

  /**
   * Device status is changed to 'maintenance'.
   *
   * @method onMaintanance
   */
  Device.prototype.onMaintenance = function() {};

  /**
   * Device status is changed to 'unknown'.
   *
   * @method onUnknown
   */
  Device.prototype.onUnknown = function() {};

  /**
   * Service name used to create a request uri.
   *
   * @protected   
   * @property _service
   * @type     {String}
   * @default  ""
   */
  Device.prototype._service = "";
  
  /**
   * Job constructor used to create a job
   *
   * @protected   
   * @property  _jobInterface
   * @type      {Function}
   * @default   null
   */
  Device.prototype._jobInterface = null;
  
  /**
   * Function to register a device event listener.
   *
   * @protected
   * @property  _deviceAddEventListener
   * @type      {Function}
   * @default   null
   */
  Device.prototype._deviceAddEventListener = null;
  
  /**
   * Function to unregister a device event listener.
   *
   * @protected
   * @property  _deviceRemoveEvemtListener
   * @type      {Function}
   * @default   null
   */
  Device.prototype._deviceRemoveEventListener = null;
  /**
   * Function to get a subscription id.
   *
   * @protected
   * @property  _getSubscriptionId
   * @type      {Function}
   * @default   null
   */
  Device.prototype._getSubscriptionId = null;
  /**
   * Function to get a subscription id.
   *
   * @protected
   * @property  _accessToken
   * @type      {String}
   * @default   null
   */
  Device.prototype._accessToken = null;
  /**
   * Initialize a device and start to capture device events.
   *
   * @method init
   * @param   {Object} _config
   */
  Device.prototype.init = function( _config ) {
    if( _config && _config.accessToken ){
      this._accessToken = _config.accessToken;
      //Execute other thread. because, executed by "validate result" thread when retry.
      setTimeout( ricoh.dapi.validateAccessToken, 0, this._accessToken, this._validateResult() );
    } else {
      //AccessToken failed
      setTimeout( this.onInitResult, 0, false, {
        errors : [
          {
            message_id:"error.validate_failure",
            message: ""
          }
        ]
      });
    }
  };

  /**
   * AccessToken validate result callback
   */
  Device.prototype._validateResult = function() {
    var target = this;
    return function(result){
      if( result ) {
        if( result.result ) {
          //successfull validate.
          if( target._deviceAddEventListener ) {
            target._deviceAddEventListener();
          }
        } else {
          //failed validate.
          if( "busy" === result.detail ) {
            //retry error
            ricoh.dapi.validateAccessToken( target._accessToken, target._validateResult );
          } else {
            //other error. return failed
            target.onInitResult( result.result,
            {
              errors : [
                {
                  message_id:"error.validate_failure",
                  message: ""
                }
              ]
            }
            );
          }
        }
      }
    };
  };

  /**
   * Create a uninitilized job.
   *
   * @method createJob
   * @return {Job} created by this._jobInterface()
   */
  Device.prototype.createJob = function() {
    var job = new this._jobInterface();
    job._getServiceInterface = ( function( _interface ) {
      // To avoid circullar reference.
      // job -> scanner -> scanner.jobs -> job
      return function() { return _interface; };
    })( this );
    return job;
  };
  
  /**
   * Fired when the getStatus request finished.
   *
   * @typedef  getStatusCallback
   * @property {Object} status - null if failed
   * @property {ErrorObject} error - undefined if succeeded
   */
  
  /**
   * Get latest app status.
   * 
   * @method getStatus
   * @param  {Device.getStatusCallback} callback - A callback function<br />
   *                                               The "this" when callback is called is Window object.
   */
  Device.prototype.getStatus = function( callback ) {
    var _this = this;

    apiClient.request({
      path: "/service/" + _this._service + "/status"
    }, function( response ) {
      if( response.errors ) {
        if ( callback ) {
          callback( null, response );
        }
      } else {
        if ( callback ) {
          callback( response );
        }
      }
    });
  };

  Device.prototype._onStatusChange = function() {
    var target = this;

    /**
     * Body of onStatusChange function created by _onStatusChange method.
     * This function is called directry by browser, so in that context 'this' is not 
     * the device object. To make it clear what type of device this is, we set the device
     * object to 'target' variable in closure.
     * 
     * @private
     * @event   _onStatusChange
     * @param   {String} eventStr json string
     * @see     dapi.xxx.onEvent
     */
    return function( eventStr ) {
      logger.debug( eventStr );
      
      var event = JSON.parse( eventStr );
      logger.debug( "eventId:" + event.id );
      target.status = event.data;
      target.onStatusChange();

      logger.debug( target._service + "Status is " + target.status[target._service + "Status"] );
      switch ( target.status[target._service + "Status"] ) {
      case "idle":
        target.onIdle();
        break;
      case "maintenance":
        target.onMaintenance();
        break;
      case "processing":
        target.onProcessing();
        break;
      case "stopped":
        target.onStopped();
        break;
      case "unknown":
        target.onUnknown();
        break;
      default:
        logger.debug( "undefined event" );
      }
    };
  };

  Device.prototype._onJobStatusChange = function() {
    // bind this device jobs.
    var jobs = this.jobs,
    eventQue = this._eventQue;
    /**
     * Body of onJobStatusChange function generated by _onJobStatusChange method.<br />
     * Get a job event and delegates event handling to each job.
     *
     * @private
     * @event   _onJobStatusChange
     * @param   {String} eventStr json string
     * @see     dapi.event.xxxJob.onEvent
     */
    return function( eventStr ) {
      logger.debug( eventStr );

      var i,
          job,
          event = JSON.parse( eventStr ),
          jobId = event.data.jobId;
      logger.debug( "eventId:" + event.id );
      
      if( jobs.hasOwnProperty( jobId ) ) {
        logger.debug( jobId + " is found" );
        job = jobs[jobId];
        if( eventQue.hasOwnProperty( jobId ) ) {
          // trigger qued events
          for( i = 0; i < eventQue[jobId].length; i++ ) {
            job._onStatusChange( eventQue[jobId][i] );
          }
          delete eventQue[jobId];
        }
        job._onStatusChange( event );
      } else {
        logger.debug( jobId + " is not found." );
        if( eventQue.hasOwnProperty( jobId ) ){
          eventQue[jobId].push( event );
        } else {
          eventQue[jobId] = [event];
        }
      }
    };
  };

  /**
   * Catch a addEventListenerResult and call the each device onInitResult.
   *
   * @private
   * @event   _onInitResult
   * @see     Device.onInitResult
   */
  Device.prototype._onInitResult = function() {
    var target = this;
    return function( result ) {
      logger.debug( "Initialize " + target._service + ":" + result );
      var error;
      if( !result ) {
        error = { errors:[{
          message_id:"error.init_failure",
          message: ""
        }]};
      }
      target.onInitResult( result, error );
    };
  };

  /**
   * @typedef   {Object} Device.addJobEventListenerResultObject
   * @property  {Boolean} result
   * @property  {String}  jobId
   */

  /**
   * Catch addEventListenerResult and call the each job onListenResult
   *
   * @private
   * @see     Job.onListenResult
   */
  Device.prototype._onJobListenResult = function() {
    // bind this device jobs.
    var jobs = this.jobs;
    /**
     * Return dapi.event.scannerJob.addEventListenerResult
     *
     * @private
     * @method   _onJobListenResult
     * @param    {Boolean} result
     * @param    {String}  jobId
     * @return   {Function} callback function
     * @see      ricoh.dapi.event.scannerJob.addEventListenerResult
     */
    return function( result, jobId ) {
      var job;
      logger.debug( "Adding listener for " + jobId + ":" + result );
      if( jobs.hasOwnProperty( jobId ) ) {
        logger.debug( jobId + " is found" );
        job = jobs[jobId];
        job.onListenResult( result );
      } else {
        logger.debug( jobId + " is not found" );
      }
    };
  };

  /**
   * @typedef   capabilityCallback
   * @property  {Object} capability - null if failed
   * @property  {ErrorObject} error - undefined if succeeded
   */

  /**
   * Get a device capability.
   *
   * @method capability
   * @param  {Device.capabilityCallback} callback - A callback function<br />
   *                                                The "this" when callback is called is Window object.
   * @param  {Boolean}  cache whether using cache
   */
  Device.prototype.capability = function( callback, cache ) {
    var _this = this;

    if ( !cache || _this._capability === undefined || _this._capability === null ) {
      logger.debug( "get capability" );
      apiClient.request({
        path: "/service/" + _this._service + "/capability"
      }, function( response ) {
        if( response.errors ) {
          if ( callback ) {
            callback( null, response );
          }
        } else {
          _this._capability = response;
          if ( callback ) {
            callback( response );
          }
        }
      });
    } else {
      logger.debug( "using cached capability" );
      if ( callback ) {
        callback( _this._capability );
      }
    }
  };

  /**
   * @typedef   Device.validateCallback
   * @property  {Boolean} result - true of false
   * @property  {ErrorObject} error - undefined if succeeded
   */

  /**
   * Validates job settings.
   *
   * @method   validate
   * @param    {Object} options
   * @param    {Device.validateCallback} callback - A callback function<br />
   *                                                The "this" when callback is called is Window object.
   */
  Device.prototype.validate = function( options, callback ) {

    var prop,
        _options = {},
        _this = this,
        _headers,
        authState;

    for( prop in options ) {
      if( prop !== "validateOnly" ) {
        _options[prop] = options[prop];
      }
    }
    _options.validateOnly = true;
    
    if ( ricoh.dapi.auth.getLoginStateInUserCodeAuth() ) {
      authState = ricoh.dapi.auth.getAuthState();
      if ( authState && authState.userId ) {
        _headers = {};
        _headers["X-Authorization-UserCode"] = authState.userId;
      }
    }
    
    apiClient.request({
      path: "/service/" + _this._service + "/jobs",
      method: "POST",
      headers: _headers,
      body: _options
    }, function( response ) {
      if ( response.errors ) {
        if ( callback ) {
          callback( false, response );
        }
      } else {
        if ( callback ) {
          callback( true );
        }
      }
    });
  };

  /**
   * Device status is changed.
   *
   * @event   onStatusChange
   */
  Device.prototype.onStatusChange = function() {};

  /**
   * Triggered when the 'init' method has completed
   *
   * @event   onInitResult
   * @param   {Boolean} result - true: success, false: failed( you can not get device events )
   */
  /* jshint unused: false */
  Device.prototype.onInitResult = function( result ) {};

  /**
   * Scanner Device
   *
   * @class       Scanner
   * @extends     ricoh.dapi.Device
   * @constructor
   */
  Scanner = function() {

    Device.apply( this );
        
  };

  // Extends Device Object
  Scanner.prototype = Object.create( Device.prototype );
  Scanner.prototype.constructor = Scanner;
  Scanner.prototype._service = "scanner";
  // Wrap browser I/F to the library name space.  
  if( dapi.event ) {
    Scanner.prototype._deviceAddEventListener = dapi.event.scanner.addEventListener;
    Scanner.prototype._deviceRemoveEventListener = dapi.event.scanner.removeEventListener;
  }

  /**
   * Printer Device
   *
   * @class       Printer
   * @extends     ricoh.dapi.Device
   * @constructor
   */
  Printer = function() {
    
    Device.apply( this );

    /**
     * Cached pdls
     *
     * @private
     * @property  _pdls
     * @type      {Array}
     * @default   undefined
     */
    this._pdls = undefined;

  };

  // Extends Device Object
  Printer.prototype = Object.create(Device.prototype);
  Printer.prototype.constructor = Printer;
  Printer.prototype._service = "printer";
  // Wrap browser I/F to the library name space.  
  if( dapi.event ) {
    Printer.prototype._deviceAddEventListener = dapi.event.printer.addEventListener;
    Printer.prototype._deviceRemoveEventListener = dapi.event.printer.removeEventListener;
  }

  /**
   * Get priner capability.
   *
   * @method   capability
   * @param    {String} pdl
   * @param    {Device.capabilityCallback} callback - A callback function<br />
   *                                                  The "this" when callback is called is Window object.
   * @param    {Boolean} cache whether using cache
   */
  Printer.prototype.capability = function( pdl, callback, cache ) {
    var _this = this;

    if ( !cache || _this._capability === undefined || _this._capability === null ) {
      logger.debug( "get capability" );
      apiClient.request({
        path: "/service/" + _this._service + "/capability",
        params: { pdl : pdl }
      }, function( response ) {
        if( response.errors ) {
          if ( callback ) {
            callback( null, response );
          }
        } else {
          _this._capability = response;
          if ( callback ) {
            callback( response );
          }
        }
      });
    } else {
      logger.debug( "using cached capability" );
      if ( callback ) {
        callback( _this._capability );
      }
    }
  };

  /**
   * @callback Printer.pdlsCallback
   * @param    {Array} pdls - null if failed
   * @param    {ErrorObject} error - undefined if succeeded
   */

  /**
   * Get supported PDLs.
   *
   * @method  supportedPDL
   * @param   {Printer.pdlsCallback} callback - A callback function<br />
   *                                            The "this" when callback is called is Window object.
   * @param   {Boolean} cache whether using cache    
   */
  Printer.prototype.supportedPDL = function( callback, cache ) {
    var _this = this;
    if( !cache || _this._pdls === undefined || _this._pdls === null ) {
      logger.debug( "get supportedPDL" );
      apiClient.request( {
        path: "/service/" + _this._service + "/supportedPDL"
      }, function( response ) {
        if( callback ) {
          if( response.errors ) {
            callback( null, response );
          } else {
            _this._pdls = response.pdl;
            callback( response.pdl );
          }
        }
      } );
    } else {
      logger.debug( "using cached pdls" );
      if ( callback ) {
        callback( _this._pdls );
      }
    }
  };
  
  /**
   * Fax Device
   *
   * @class       Fax
   * @extends     ricoh.dapi.Device
   * @constructor
   */
  Fax = function() {

    Device.apply( this );
    
  };

  // Extends Device Object
  Fax.prototype = Object.create(Device.prototype);
  Fax.prototype.constructor = Fax;
  Fax.prototype._service = "fax";
  // Wrap browser I/F to the library name space.    
  if( dapi.event ) {
    Fax.prototype._deviceAddEventListener = dapi.event.fax.addEventListener;
    Fax.prototype._deviceRemoveEventListener = dapi.event.fax.removeEventListener;
  }

  /**
   * Copy Device
   *
   * @class       Copy
   * @extends     ricoh.dapi.Device
   * @constructor
   */
  Copy = function() {

    Device.apply( this );

  };

  // Extends Device Object
  Copy.prototype = Object.create(Device.prototype);
  Copy.prototype.constructor = Copy;
  Copy.prototype._service = "copy";
  // Wrap browser I/F to the library name space.  
  if( dapi.event ) {
    Copy.prototype._deviceAddEventListener = dapi.event.copy.addEventListener;
    Copy.prototype._deviceRemoveEventListener = dapi.event.copy.removeEventListener;
  }
  
  /**
   * Base job Class
   *
   * @private
   * @class       Job
   * @constructor
   */
  Job = function( id ) {

    /**
     * Job Id
     *
     * @property id
     * @type     {String}
     * @default  undefined
     */
    this.id = id;

    /**
     * Latest job status
     *
     * @property status
     * @type     {Object}
     * @default  undefined
     */
    this.status = undefined;

    /**
     * Last job status
     *
     * @property  lastStatus
     * @type     {Object}
     * @default  undefined
     */
    this.lastStatus = undefined;

    /**
     * Whether this job is already started
     *
     * @private
     * @property _alreadyRun
     * @type     {Boolean}
     * @default  false
     */
    this._alreadyRun = false;

    /**
     * Options job is started
     *
     * @private
     * @property _options
     * @type     {Object}
     * @default  undefined
     */
    this._options = undefined;

  };

  /**
   * Service name used to create a request uri
   *
   * @protected   
   * @property   _service
   * @type      {String}
   * @default   ""
   */
  Job.prototype._service = "";
  /**
   * Get Service Interface creating this job.
   *
   * @protected   
   * @property  _getServiceInterface
   * @type      {Function}
   * @default   null
   */
  Job.prototype._getServiceInterface = null;
  
  /**
   * Function to get subscripion ID
   *
   * @protected
   * @property  _getSubscriptionId
   * @type      {Function}
   * @default   null
   * @see       dapi.event.xxxJob.getSubscriptionId
   */
  Job.prototype._getSubscriptionId = null;

  /**
   * Function to add a job event listener
   *
   * @protected
   * @property  _addEventListener
   * @type      {Function}
   * @default   null
   * @see       dapi.event.xxxJob.addEventListener
   */
  Job.prototype._addEventListener = null;

  /**
   * Function to delete job event listeners
   *
   * @protected
   * @property  _removeEventListener
   * @type      {Function}
   * @default   null
   * @see       dapi.event.xxxJob.removeEventListener
   */
  Job.prototype._removeEventListener = null;

  /**
   * @callback Job.commonCallback
   * @param    {ErrorObject} error - undefined if succeeded
   */
  
  /**
   * Start a Job.
   *
   * @method start
   * @param  {Object} options - job settings
   * @param  {Job.commonCallback} callback - A callback function<br />
   *                                         The "this" when callback is called is Window object.
   */
  Job.prototype.start = function( options, callback ) {
    var prop,
        subscriptionId,
        _body = {},
        _headers = {},
        body,
        headers,
        authState,
        _this = this;

    if( this._alreadyRun && callback ) {
      callback( {
        code: 0,
        errors: [
          {
            message_id: "error.dapi.client_error",
            message: "job_has_already_run"
          }
        ]
      } );
      return;
    }

    if( this._getSubscriptionId ) {
      subscriptionId = this._getSubscriptionId();
      logger.debug( "subscriptionId:" + subscriptionId );
      
      if( subscriptionId === undefined || subscriptionId === null ){
        logger.debug( "subscriptionId is not defined" );
        if( callback ) {
          callback( {
            code: 0,
            errors: [
              {
                message_id: "error.dapi.browser_error",
                message: "undefined_subscriptionid"
              }
            ]
          } );
        }
        return;
      }
    }
    
    logger.debug( "job.start is called with " + JSON.stringify( options ) );

    if ( util.is( options, "Array" ) ) {
      body = options[0];
      headers = options[1];
    }
    else {
      body = options;
    }
    for( prop in body ) {
      if ( body.hasOwnProperty( prop ) ) {
        _body[prop] = body[prop];
      }
    }
    for( prop in headers ) {
      if ( headers.hasOwnProperty( prop ) ) {
        _headers[prop] = headers[prop];
      }
    }
    _headers["X-Subscription-Id"] = subscriptionId;
    authState = ricoh.dapi.auth.getAuthState();

    if ( ricoh.dapi.auth.getLoginStateInUserCodeAuth() ) {
      if ( authState && authState.userId ) {
        if ( this._service !== "printer" ) {
          _headers["X-Authorization-UserCode"] = authState.userId;
        } else {
          _body.userCode = authState.userId;
        }
      }
    }

    this._alreadyRun = true;
    this._options = _body;
    apiClient.request({
      path: "/service/" + this._service + "/jobs",
      method: "POST",
      headers: _headers,
      body: _body
    }, function( response ) {
      if( response.errors ) {
        _this.alreadyRun = false;
        
        if ( callback ) {
          callback( response );
        }
      } else {
        var job = _this;
        logger.debug( "created job id:" + response.jobId );
        job._setId( response.jobId );
        job._getServiceInterface().jobs[job.id] = job;
        if( _this._addEventListener ) {
          _this._addEventListener( job.id );
        }

        if ( callback ) {
          callback();
        }
      }
    });
  };

  /**
   * Set job id
   *
   * @private
   * @method  _setId
   * @param   {String} id - Job id
   */
  Job.prototype._setId = function( id ) {
    if( this.id === undefined || this.id === null ) {
      this.id = id;
    }
  };

  /**
   * Proceed a Job.
   *
   * @method proceed
   * @param  {Object}   options -  job settings
   * @param  {Job.commonCallback} callback - A callback function<br />
   *                                         The "this" when callback is called is Window object.
   */
  Job.prototype.proceed = function( options, callback ) {
    var prop,
        _options = {},
        _this = this;

    if( typeof( options ) === "function" ) {
      callback = options;
    } else {
      if( options ) {
        for( prop in options ) {
          if( prop !== "jobStatus" ) {
            _options[prop] = options[prop];
          }
        }
      }
    }
    _options.jobStatus = "processing";

    _this._put( _options, callback );

  };

  /**
   * Put request to Job.
   *
   * @private
   * @method _put
   * @param  {Object} requestBody - request body
   * @param  {Job.commonCallback} callback - A callback function<br />
   *                                         The "this" when callback is called is Window object.
   */
  Job.prototype._put = function( requestBody, callback ) {
    var _this = this;
    
    apiClient.request({
      path: "/service/" + _this._service + "/jobs/" + _this.id,
      method: "PUT",
      body: requestBody
    }, function( response ) {
      if( response.errors ) {
        if ( callback ) {
          callback( response );
        }
      } else {
        if ( callback ) {
          callback();
        }
      }
    });
  };
  
  /**
   * Cancel a Job.
   *
   * @method cancel
   * @param  {Job.commonCallback} callback - A callback function<br />
   *                                         The "this" when callback is called is Window object.
   */
  Job.prototype.cancel = function( callback ) {
    var _this = this, authState, _options = { jobStatus: "canceled" };
    
    if ( ricoh.dapi.auth.getLoginStateInUserCodeAuth() ) {
      authState = ricoh.dapi.auth.getAuthState();
      if ( authState && authState.userId ) {
        if ( this._service === "printer" ) {
          _options.userCode = authState.userId;
        }
      }
    }
    _this._put( _options, callback );
  };

  /**
   * @typedef Job.getStatusCallback
   * @param   {Object} status - null if failed
   * @param   {ErrorObject} error - undefind if succeeded
   */
  
  /**
   * Get current job status.
   *
   * @method getStatus
   * @param  {Job.getStatusCallback} callback - A callback function<br />
   *                                            The "this" when callback is called is Window object.
   */
  Job.prototype.getStatus = function( callback ) {
    var _this = this;

    return apiClient.request({
      path: "/service/" + _this._service + "/jobs/" + _this.id
    }, function( response ) {
      if( response.errors ) {
        if( callback ) {
          callback( null, response );
        }
      } else {
        if( callback ) {
          callback( response );
        }
      }
    });
  };

  /**
   * Called from browser when a job status is changed.<br />
   * Trigger wrapped events such as onProcessing, onAborted ...
   *
   * @private
   * @method  _onStatusChange
   * @param   {Object}
   */
  Job.prototype._onStatusChange = function( event ) {
    var isJobStatusChanged;

    logger.debug( "eventId:" + event.id );

    this.lastStatus = this.status;
    this.status = event.data;
    this.onStatusChange();

    isJobStatusChanged = this._isStatusChanged( "jobStatus" );

    if ( isJobStatusChanged ) {
      switch ( this.status.jobStatus ) {
      case "pending":
        this.onPending();
        break;

      case "processing":
        this.onProcessing();
        break;

      default:
        break;
      }
    }

    if ( this.status.scanningInfo ) {
      if ( this._isStatusChanged( "scanningInfo.scannedCount" ) ) {
        this.onPageScanned( this.status.scanningInfo.scannedCount );
      }
    }

    if ( this.status.sendingInfo ) {
      if ( this._isStatusChanged( "sendingInfo.sentDestinationCount" ) ) {
        this.onSent( this.status.sendingInfo.sentDestinationCount );
      }
    }

    if ( this.status.printingInfo ) {
      if ( this._isStatusChanged( "printingInfo.printedCount" ) ) {
        this.onPagePrinted( this.status.printingInfo.printedCount );
      }
      if ( this._isStatusChanged( "printingInfo.printedCopies" ) ) {
        this.onCopyPrinted( this.status.printingInfo.printedCopies );
      }
      if ( this._isStatusChanged( "printingInfo.fileReadCompleted" ) &&
           this.status.printingInfo.fileReadCompleted === true ) {
        this.onFileReadCompleted();
      }
    }

    if ( isJobStatusChanged ) {
      switch ( this.status.jobStatus ) {
      case "processing_stopped":
        this.onProcessingStopped( this._isAutoStart( this.status ) );
        break;

      case "completed":
        this._onFinished();
        this.onCompleted();
        break;

      case "aborted":
        this._onFinished();
        this.onAborted();
        break;

      case "canceled":
        this._onFinished();
        this.onCanceled();
        break;

      default:
        break;
      }
    } else {
      if ( this.status.jobStatus === "processing_stopped" &&
           this._isStatusChanged( "jobStatusReasons" ) ) {
        this.onProcessingStopped( this._isAutoStart( this.status ) );
      }
    }
  };

  /**
   * Return whether the value which the sprcified key changed.
   *
   * @private
   * @method _isStatusChanged
   * @param  {String}  key key of status object
   * @return {Boolean} true, if the value which the specified key changed
   */
  Job.prototype._isStatusChanged = function( key ) {
    var paths = key.split( "." ),
        value = util.getJsonValue( this.status, paths ),
        lastValue = util.getJsonValue( this.lastStatus, paths );

    // for scannedCount, sentDestinationCount and so on...
    if ( value === 0 ) {
      return false;
    }

    return !util.compareValue( value, lastValue );
  };

  /**
   * Return whether job starts automatically.
   *
   * @private
   * @method _isAutoStart
   * @param  {Object}
   * @return {Boolean} true, if job starts automatically 
   */
  Job.prototype._isAutoStart = function( status ) {
    var reasons = status ? status.jobStatusReasons : undefined,
        i,
        autoStart = true;

    if ( !reasons ) {
      return false;
    }

    for ( i = 0; i < reasons.length; i++ ) {
      switch ( reasons[i] ) {
      case "wait_for_next_original_and_continue":
      case "exceeded_max_email_size":
      case "exceeded_max_page_count":
      case "cannot_detect_original_size":
      case "exceeded_max_data_capacity":
      case "not_suitable_original_orientation":
      case "too_small_scan_size":
      case "too_large_scan_size":
        autoStart = false;
        break;
      default:
        break;
      }
    }

    return autoStart;
  };

  /**
   * AddEventListener has done.
   *
   * @method onListenResult
   * @param  {Boolean} result
   */
  /* jshint unused: false */
  Job.prototype.onListenResult = function( result ) {};

  /**
   * Job status is changed.
   *
   * @method onStatusChange
   */
  Job.prototype.onStatusChange = function() {};

  /**
   * Job status is changed to 'pending'.
   *
   * @method onPending
   */
  Job.prototype.onPending = function() {};

  /**
   * Job status is changed to 'processing'.
   *
   * @method onProcessing
   */
  Job.prototype.onProcessing = function() {};

  /**
   * Job status is changed to 'processing_stopped'.
   *
   * @method onProcessingStopped
   * @param  {Boolean} autoStart
   */
  Job.prototype.onProcessingStopped = function( autoStart ) {};

  /**
   * Job status is changed to 'canceled'.
   *
   * @method onCanceled
   */
  Job.prototype.onCanceled = function() {};

  /**
   * Job status is changed to 'aborted'.
   *
   * @method onAborted
   */
  Job.prototype.onAborted = function() {};

  /**
   * Job status is changed to 'completed'.
   *
   * @method onCompleted
   */
  Job.prototype.onCompleted = function() {};

  Job.prototype._onFinished = function() {
    if ( this._removeEventListener ) {
      this._removeEventListener( this.id );
    }
    if ( this._getServiceInterface().jobs[ this.id ] ) {
      delete this._getServiceInterface().jobs[ this.id ];
    }
  };

  /**
   * Scanned count is updated.
   *
   * @method onPageScanned
   */
  Job.prototype.onPageScanned = function() {};

  /**
   * Sent destination count is updated.
   *
   * @method onSent
   */
  Job.prototype.onSent = function() {};

  /**
   * File read is completed.
   *
   * @method  onFileReadCompleted
   */
  Job.prototype.onFileReadCompleted = function() {};

  /**
   * Printed count is updated.
   *
   * @method onPagePrinted
   */
  Job.prototype.onPagePrinted = function() {};

  /**
   * Printed copies count is updated.
   *
   * @method onCopyPrinted
   */
  Job.prototype.onCopyPrinted = function() {};

  /**
   * ScannerJob Class
   *
   * @class       ScannerJob
   * @constructor
   * @extends     ricoh.dapi.Job
   */
  ScannerJob = function( id ) {

    Job.apply( this, [id] );

  };

  // Extends Job Object
  Scanner.prototype._jobInterface = ScannerJob;
  ScannerJob.prototype = Object.create( Job.prototype );
  ScannerJob.prototype.constructor = ScannerJob;
  ScannerJob.prototype._service = "scanner";
  // Wrap browser I/F to the library name space.
  if( dapi.event ) {
    ScannerJob.prototype._addEventListener = dapi.event.scannerJob.addEventListener;
    ScannerJob.prototype._removeEventListener = dapi.event.scannerJob.removeEventListener;
    ScannerJob.prototype._getSubscriptionId = dapi.event.scannerJob.getSubscriptionId;
  }

  /**
   * Proceed a Job.
   *
   * @method proceed
   * @param  {Object}   options -  job settings
   * @param  {Job.commonCallback} callback - A callback function<br />
   *                                         The "this" when callback is called is Window object.
   */
  ScannerJob.prototype.proceed = function( options, callback ) {
    var _options = {},
        _this = this;
    if( typeof( options ) === "function" ) {
      callback = options;
    } else {
      _options = util.clone( options );
      if ( !_options ) {
        _options = {};
      }
    }

    if ( !_options.scanningInfo ) {
      _options.scanningInfo = {};
    }
    _options.scanningInfo.jobStatus = "processing";

    Job.prototype.proceed.apply( _this, [_options, callback] );

  };

  /**
   * Finish a scannning process.
   *
   * @method   finishScanning
   * @param    {Job.commonCallback} callback
   */
  ScannerJob.prototype.finishScanning = function( callback ) {
    var _this = this;

    Job.prototype.proceed.apply( _this, [{ scanningInfo: { jobStatus: "completed" } }, callback ] );
  };

  /**
   * Stop a scannning process.
   *
   * @method   stopScanning
   * @param    {Job.commonCallback} callback
   */
  ScannerJob.prototype.stopScanning = function( callback ) {
    var _this = this;

    Job.prototype._put.apply( _this, [{ scanningInfo: { jobStatus: "processing_stopped" } }, callback ] );
  };

  /**
   * Get a file uri
   *
   * @method   fileUri
   * @param    {Number} page - 1 if page is not a number.
   */
  ScannerJob.prototype.fileUri = function( page ) {
    var _page;
    if( page === undefined ) {
      return apiClient.getEndpoint() + "/service/" + this._service + "/jobs/" + this.id + "/file?getMethod=direct";
    } else {
      if( typeof( page ) !== "number" || page < 1  || !page.toString().match(/^\d+$/) ) {
        _page = 1;
      } else {
        _page = page;
      }
      return apiClient.getEndpoint() + "/service/" + this._service + "/jobs/" + this.id + "/file?pageNo=" + _page + "&getMethod=direct";
    }
  };

  /**
   * @typedef   Job.fileResult
   * @property  {String|Object} result - filePath or Blob
   * @property  {String} contentType
   * @property  {Integer} rotate
   */
  /**
   * @typedef   Job.ocrResult
   * @property  {String|Blob} filePath or text or Blob
   */
  
  /**
   * @callback Job.fileCallback
   * @param    {Job.fileResult} result - null if failed
   * @param    {ErrorObject} error - undefined if succeeded
   */

  /**
   * @callback Job.ocrCallback
   * @param    {Job.ocrResult} result - null if failed
   * @param    {ErrorObject}   error  - undefined if succeeded
   */
  
  /**
   * Get a file.
   *
   * @method   file
   * @param    {Number}   page     - 1 if page is not a number
   * @param    {String}   method   direct or filePath
   * @param    {Job.fileCallback} callback - A callback function<br />
   *                                         The "this" when callback is called is Window object.
   */
  ScannerJob.prototype.file = function( page, method, callback ) {
    // for file( method, callback )
    if( typeof( page ) === "string" && typeof( method ) === "function" ) {
      callback = method;
      method = page;
      page = undefined;
    }
    
    apiClient.request({
      path: "/service/" + this._service + "/jobs/" + this.id + "/file",
      params: {
        pageNo: ( page ? (( typeof( page ) === "number" && page > 0 && page.toString().match(/^\d+$/) ) ? page : 1) : undefined),
        getMethod: ( window.Blob && window.Blob.name && method === "direct" ) ? "direct" : "filePath"
      },
      dataType: ( window.Blob && window.Blob.name && method === "direct" ) ? "binary" : "json"
    }, function( response, xhr ) {
      var rotate;
      if( response.errors ) {
        if ( callback ) {
          callback( null, response );
        }
      } else {
        if( callback ) {
          rotate = ( window.Blob && window.Blob.name && method === "direct" ) ? parseInt( xhr.getResponseHeader( "X-Rotate" ), 10 ) : parseInt( response.rotate, 10 );
          callback( {
            "result": ( method === "direct" ) ? response : response.filePath,
            "contentType": xhr.getResponseHeader( "Content-Type" ),
            "rotate": rotate
          } );
        }
      }
    });
  };

  /**
   * Delete a file.
   *
   * @method   fileDelete
   * @param    {Job.commonCallback} callback - A callback function<br />
   *                                           The "this" when callback is called is Window object.
   */
  ScannerJob.prototype.fileDelete = function( callback ) {
    if ( this.id === undefined ) {
      return;
    }
    apiClient.request( {
      path: "/service/" + this._service + "/jobs/" + this.id + "/file",
      method: "DELETE"
    }, function( response ) {
      if ( callback ) {
        if( response.errors ) {
          callback( response );
        } else {
          callback();
        }
      }
    });
  };
  
  /**
   * Get a thumbnail uri
   *
   * @method   thumbnailUri
   * @param    {Number}  page - 1 if page is not a number
   */
  ScannerJob.prototype.thumbnailUri = function( page ) {
    if( typeof(this._options.jobSetting.originalPreview) === "undefined" || this._options.jobSetting.originalPreview === false ) {
      return null;
    } else {
      if( typeof( page ) !== "number" || page < 1  || !page.toString().match(/^\d+$/) ) {
        page = 1;
      }
      return apiClient.getEndpoint() + "/service/" + this._service + "/jobs/" + this.id + "/thumbnail?pageNo=" + page + "&getMethod=direct";
    }
  };
  
  /**
   * Get a thumbnail
   *
   * @method   thumbnail
   * @param    {Number}   page     1 if page is not a number
   * @param    {String}   method   filePath or direct
   * @param    {Job.fileCallback} callback callback function
   */
  ScannerJob.prototype.thumbnail = function( page, method, callback ) {
    apiClient.request({
      path: "/service/" + this._service + "/jobs/" + this.id + "/thumbnail",
      params: {
        pageNo: ( typeof( page ) === "number" && page > 0 && page.toString().match(/^\d+$/) ) ? page : 1,
        getMethod: ( window.Blob && window.Blob.name && method === "direct" ) ? "direct" : "filePath"
      },
      dataType: ( window.Blob && window.Blob.name && method === "direct" ) ? "binary" : "json"
    }, function( response, xhr ) {
      var rotate;
      if( response.errors ) {
        if( callback ) {
          callback( null, response );
        }
      } else {
        if( callback ) {
          rotate = ( window.Blob && window.Blob.name && method === "direct" ) ? parseInt( xhr.getResponseHeader( "X-Rotate" ), 10 ) : parseInt( response.rotate, 10 );
          callback( {
            "result": ( method === "direct" && window.Blob && window.Blob.name) ? response : response.filePath,
            "contentType": xhr.getResponseHeader( "Content-Type" ),
            "rotate": rotate
          } );
        }
      }
    });
  };


  /**
   * Get a ocr result
   *
   * @method   ocr
   * @param    {Number}   page     1 if page is not a number
   * @param    {Job.ocrCallback} callback c
   */
  ScannerJob.prototype.ocr = function( page, callback ) {
    var params = {};

    params = {
      pageNo: ( typeof( page ) === "number" && page > 0 && page.toString().match(/^\d+$/) ) ? page : 1,
    };

    apiClient.request({
      path: "/service/" + this._service + "/jobs/" + this.id + "/ocrdata",
      params: params
    }, function( response ) {
      if( response.errors ) {
        if( callback ) {
          callback( null, response );
        }
      } else {
        if( callback ) {
          callback( response );
        }
      }
    });
  };

  /**
   * Printer Job
   *
   * @class       PrinterJob
   * @extends     ricoh.dapi.Job
   * @constructor 
   */
  PrinterJob = function( id ) {

    Job.apply( this, [id] );
    
  };
  //Extends Job Object
  Printer.prototype._jobInterface = PrinterJob;
  PrinterJob.prototype = Object.create( Job.prototype );
  PrinterJob.prototype.constructor = PrinterJob;
  PrinterJob.prototype._service = "printer";
  // Wrap browser I/F to the library name space.
  if( dapi.event ) {
    PrinterJob.prototype._addEventListener = dapi.event.printerJob.addEventListener;
    PrinterJob.prototype._removeEventListener = dapi.event.printerJob.removeEventListener;
    PrinterJob.prototype._getSubscriptionId = dapi.event.printerJob.getSubscriptionId;
  }

  /**
   * Fax Job
   *
   * @class       FaxJob
   * @extends     ricoh.dapi.Job
   * @constructor
   */
  FaxJob = function( id ) {

    Job.apply( this, [id] );

  };
  // Extends Job Object
  Fax.prototype._jobInterface = FaxJob;
  FaxJob.prototype = Object.create( Job.prototype );
  FaxJob.prototype.constructor = FaxJob;
  FaxJob.prototype._service = "fax";
  // Wrap browser I/F to the library name space.
  if( dapi.event ) {
    FaxJob.prototype._addEventListener = dapi.event.faxJob.addEventListener;
    FaxJob.prototype._removeEventListener = dapi.event.faxJob.removeEventListener;
    FaxJob.prototype._getSubscriptionId = dapi.event.faxJob.getSubscriptionId;
  }

  /**
   * Finish a scanning process.
   *
   * @method   finishScanning
   * @param    {Job.commonCallback} callback - A callback function<br />
   *                                           The "this" when callback is called is Window object.
   */
  FaxJob.prototype.finishScanning = function( callback ) {
    var _this = this;
    
    apiClient.request( {
      path: "/service/" + _this._service + "/jobs/" + _this.id,
      method: "PUT",
      body: { jobStatus: "completed" }
    }, function( response ) {
      if ( callback ) {
        if ( response.errors ) {
          callback( response );
        } else {
          callback();
        }
      }
    } );
  };

  /**
   * Get a thumbnail uri
   *
   * @method   thumbnailUri
   * @param    {Number}  page - 1 if page is not a number
   */
  FaxJob.prototype.thumbnailUri = ScannerJob.prototype.thumbnailUri;

  /**
   * Get a thubmanil
   *
   * @method   thumbnail
   * @param    {Number}   page     1 if page is not a number
   * @param    {String}   method   filePath or direct
   * @param    {Job.fileCallback} callback callback function
   */
  FaxJob.prototype.thumbnail = ScannerJob.prototype.thumbnail;
  
  /**
   * Copy Job
   *
   * @class       CopyJob
   * @extends     ricoh.dapi.Job
   * @constructor
   */
  CopyJob = function( id ) {

    Job.apply( this, [id] );

  };
  // Extends Job Object
  Copy.prototype._jobInterface = CopyJob;
  CopyJob.prototype = Object.create( Job.prototype );
  CopyJob.prototype.constructor = CopyJob;
  CopyJob.prototype._service = "copy";
  // Wrap browser I/F to the library name space.
  if( dapi.event ) {
    CopyJob.prototype._addEventListener = dapi.event.copyJob.addEventListener;
    CopyJob.prototype._removeEventListener = dapi.event.copyJob.removeEventListener;
    CopyJob.prototype._getSubscriptionId = dapi.event.copyJob.getSubscriptionId;
  }

  /**
   * Finish a scanning process.
   *
   * @method   finishScanning
   * @param    {Job.commonCallback} callback
   */
  CopyJob.prototype.finishScanning = ScannerJob.prototype.finishScanning;
  
  /**
   *
   * @property   scanner
   * @type       {ricoh.dapi.Scanner}
   */
  dapi.scanner = new Scanner();
  if( dapi.event ) {
    dapi.event.scanner.addEventListenerResult = dapi.scanner._onInitResult();
    dapi.event.scanner.onEvent = dapi.scanner._onStatusChange();
    dapi.event.scannerJob.addEventListenerResult = dapi.scanner._onJobListenResult();
    dapi.event.scannerJob.onEvent = dapi.scanner._onJobStatusChange();
  }
  
  /**
   *
   * @property   printer
   * @type       {ricoh.dapi.Printer}
   */
  dapi.printer = new Printer();
  if( dapi.event ) {
    dapi.event.printer.addEventListenerResult = dapi.printer._onInitResult();
    dapi.event.printer.onEvent = dapi.printer._onStatusChange();
    dapi.event.printerJob.addEventListenerResult = dapi.printer._onJobListenResult();
    dapi.event.printerJob.onEvent = dapi.printer._onJobStatusChange();
  }
  
  /**
   *
   * @property   fax
   * @type       {ricoh.dapi.Fax}
   */
  dapi.fax = new Fax();
  if( dapi.event ) {
    dapi.event.fax.addEventListenerResult = dapi.fax._onInitResult();
    dapi.event.fax.onEvent = dapi.fax._onStatusChange();
    dapi.event.faxJob.addEventListenerResult = dapi.fax._onJobListenResult();
    dapi.event.faxJob.onEvent = dapi.fax._onJobStatusChange();
  }
  
  /**
   *
   * @property   copy
   * @type       {ricoh.dapi.Copy}
   */
  dapi.copy = new Copy();
  if( dapi.event ) {
    dapi.event.copy.addEventListenerResult = dapi.copy._onInitResult();
    dapi.event.copy.onEvent = dapi.copy._onStatusChange();
    dapi.event.copyJob.addEventListenerResult = dapi.copy._onJobListenResult();
    dapi.event.copyJob.onEvent = dapi.copy._onJobStatusChange();
  }

}).call( this );

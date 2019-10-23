/**
 * @copyright Copyright 2013 Ricoh Americas Corporation. All Rights Reserved.
 * 
 * Copyright (c) 2013 Ricoh Americas Corporation. All Rights Reserved.
 * 
 * @fileOverview This library provides a simple print/scan APIs mainly for ice
 *               SaaS applications.
 * @author Ricoh Americas Corporation.
 */
(function( root ) {	
	"use strict";

   var Logger, ConsoleAppender, RemoteAppender,
  /**
	 * Console Appender (default)
	 * 
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
      console.log( "[" + Logger.getLevelName( level ) + "]" + msg + stackMsg );
    }
  };

  /**
	 * Remote Appender
	 * 
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
	 * @private
	 * @ignore
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
	 * @method log
	 * @param {Number}
	 *            level
	 * @param {String}
	 *            msg
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
		 * @method isMode
		 * @param {Integer}
		 *            level
		 * @return {Boolean}
		 */
      isMode: function( level ) {
        return level >= _level;
      },
      /**
		 * 
		 * @private
		 * @method isTrace
		 * @return {Boolean}
		 */
      isTrace: function() {
        return Logger.isMode( Logger.TRACE );
      },
      /**
		 * 
		 * @private
		 * @method trace
		 * @param {String}
		 *            msg
		 */
      trace: function( msg ) {
        _log( Logger.TRACE, msg );
      },
      /**
		 * 
		 * @private
		 * @method isDebug
		 * @return {Boolean}
		 */
      isDebug: function() {
        return Logger.isMode( Logger.DEBUG );
      },
      /**
		 * 
		 * @private
		 * @method debug
		 * @param {String}
		 *            msg
		 */
      debug: function( msg ) {
        _log( Logger.DEBUG, msg );
      },
      /**
		 * 
		 * @private
		 * @method isInfo
		 * @return {Boolean}
		 */
      isInfo: function() {
        return Logger.isMode( Logger.INFO );
      },
      /**
		 * 
		 * @private
		 * @method info
		 * @param {String}
		 *            msg
		 */
      info: function( msg ) {
        _log( Logger.INFO, msg );
      },
      /**
		 * 
		 * @private
		 * @method isWarn
		 * @return {Boolean}
		 */
      isWarn: function() {
        return Logger.isMode( Logger.WARN );
      },
      /**
		 * 
		 * @private
		 * @method warn
		 * @param {String}
		 *            msg
		 */
      warn: function( msg ) {
        _log( Logger.WARN, msg );
      },
      /**
		 * 
		 * @private
		 * @method isError
		 * @return {Boolean}
		 */
      isError: function() {
        return Logger.isMode( Logger.ERROR );
      },
      /**
		 * 
		 * @private
		 * @method error
		 * @param {String}
		 *            msg
		 */
      error: function( msg ) {
        _log( Logger.ERROR, msg );
      },
      /**
		 * 
		 * @private
		 * @method setAppender
		 * @param {Appender}
		 *            appender
		 */
      setAppender: function( appender ) {
        _appender = appender;
      },
      /**
		 * 
		 * @private
		 * @method setLevel
		 * @param {Integer}
		 *            level
		 */
      setLevel: function( level ) {
        _level = level;
      },
      /**
		 * 
		 * @method getLevel
		 * @return {Integer}
		 */
      getLevel: function() {
        return _level;
      },
      /**
		 * 
		 * @private
		 * @method getLevelName
		 * @param {Integer}
		 *            level
		 * @return {String} name
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
	
	var ricoh,
		ICE_I18N_NAMESPACE = "dapi";
	
	if (typeof root.ricoh === "undefined" || root.ricoh === null) {
		ricoh = root.ricoh = {};
	} else {
		ricoh = root.ricoh;
	}
	
	var ice = ricoh.ice = ricoh.ice || {};
	
	ice.controller = ricoh.ice.controller || {};

	ice.model = ricoh.ice.model || {};

	ice.view = ricoh.ice.view || {};

	ice.util = ricoh.ice.util || {};
	
    /**
	 * Scanner controller class
	 * 
	 * @class ice scanner controller
	 */
    ice.controller.scanner = {
    		/**
			 * Initialize the scanner controller
			 * 
			 * @return {undefined}
			 * @method
			 */
    		init : function(){
    		    // Define i18next options.
    		    var i18nOptions =  {

    		      lng: ricoh.dapi.navigator.language,

    		      // Set file path. 'js/locales/dapi.en.json' and 'js/locales/dapi.ja.json' will be loaded.
    		      resGetPath: "locales/__ns__.__lng__.json",
    		      fallbackLng: 'en',
    		      // Namespace for SmartSDK Application JS is 'dapi'.
    		      ns: "dapi"
    		    };

    		    // ricoh.dapi.app.scanner.init() and following functions requires i18next.
    		    i18n.init( i18nOptions , function() {
    		    	// 1. initialize the scan app
    		    	Logger.debug("[ICE#Scan] Initialize scanner dapi-app.js");
    		    	
    		    	// 2. Security Token integration
    		    	var token = ice.util.security.getToken();
    		    	
    		    	// 3. initialize the scanner logic
        			ricoh.dapi.app.scanner.init({ "setBackMenu": false, "accessToken": token } );
    		    } );
    		},
    		
    		/**
    		 * Attach callback listeners
    		 * @private 
    		 */
    		attachCallbacks: function(){
    			// 2. preparing the scan job callback function from here
    			ricoh.dapi.app.scanner.onAlert = function(message,details){
    				var eventId = details.id;	
    				Logger.debug("[ICE#Scan#onAlert] ["+eventId+"]"+ message);    
    				ice.view.util.simpleDialog.show(message);
    			};
    			    
    			ricoh.dapi.app.scanner.onProcessing = function( message, details ) {     
    				var eventId = details.id;     
    				Logger.debug("[ICE#Scan#onProcessing] ["+eventId+"]"+ message+ "  [scan stop flag]" +details.stop);

					if( details.stop === false ){
						ice.view.util.scanStopDialog.hide();
					} else {
    					var iceUIMsg = "";
						ice.view.util.scanStopDialog.show(iceUIMsg, details);
					}
     
    				if( eventId === "scanner.processing.start" ||
        				eventId === "scanner.processing.scanning"  ){
    					var iceUIMsg = ice.util.api.getMessage("scanner.processing.scanning");
   						ice.view.util.mask.show(iceUIMsg);
    				} 
    			};    
    			
    			ricoh.dapi.app.scanner.onProcessingUpdate = function( message, details ) {     
    				var eventId = details.id;     
    				Logger.debug("[ICE#Scan#onProcessingUpdate] ["+eventId+"]"+ message);
    				if( eventId.indexOf("scanner.processing.scanning") === 0 ){
        				ice.view.util.mask.show(message);
        			}      
    				if( eventId.indexOf("scanner.pending.scanning") === 0 ){   	    
    					ice.view.util.mask.show(message);
    				}
    			}; 
  
    			ricoh.dapi.app.scanner.onNotify = function( message, details ) {     
    				var eventId = details.id;     
    				Logger.debug("[ICE#Scan#onNotify] ["+eventId+"]"+ message);
     
    				if( eventId.indexOf("scanner.completed.scanning") === 0 ||
    					eventId.indexOf("scanner.completed.filing") === 0 ){   	  
    					ice.view.util.scanStopDialog.hide();
    					ice.view.util.operationDialog.hide();
    					var iceUIMsg = ice.util.api.getMessage("scanner.processing.uploading");
    					ice.view.util.mask.show(iceUIMsg);
    				}
    			};
    			
    			ricoh.dapi.app.scanner.onStopped = function(message, details) {     
    				var eventId = details.id;
    				Logger.debug("[ICE#Scan#onStopped] ["+eventId+"]"+ message);
    				
    				ice.view.util.scanStopDialog.hide();
     
    				// Event filtering by scan related event
    				if( eventId.indexOf("scanner.processing_stopped.scanning") != 0 ){
    					Logger.warn("ignore the event :"+eventId);
    					return;
    				}
    				ice.view.util.operationDialog.show(message,details);
    			};
  
    			ricoh.dapi.app.scanner.onStoppedUpdate = function(message, details) {     
    				var eventId = details.id;
    				Logger.debug("[ICE#Scan#onStoppedUpdate] ["+eventId+"]"+ message);
     
    				// Event filtering by scan related event
    				ice.view.util.operationDialog.update(message,details);
    			};

    			ricoh.dapi.app.scanner.onAborted = function(message, details) {     
    				var eventId = details.id;
    				Logger.debug("[ICE#Scan#onAborted] ["+eventId+"]"+ message);
    				
    				ice.view.util.mask.hide();
    				ice.view.util.operationDialog.hide();
    				ice.view.util.scanStopDialog.hide();
    				ice.view.util.simpleDialog.show(message);
    				// for timer reset.
    				ice.view.util.scanJobObserver.onDone(); 
    				
    			};
  
    			ricoh.dapi.app.scanner.onCompleted = function(message,details){
    				var eventId = details.id;	
    				Logger.debug("[ICE#Scan#onCompleted] ["+eventId+"]"+ message);
       						
    				ice.view.util.mask.hide();
    				ice.view.util.operationDialog.hide();
    				ice.view.util.scanStopDialog.hide();
    				// for timer reset
    				ice.view.util.scanJobObserver.onDone(); 
    			};    	
    		}, 
	
    		/**
    		 * Start scan with the specified options.
    		 * 
    		 * @return {undefined}
    		 * @param scanAppOption
    		 *            {ricoh.ice.model.scanAppOption} the scan and upload settings
    		 */
    		doScan : function(scanAppOption){
    			Logger.debug("[ICE#Scan#doScan] ");
       
    			// 1. prepare the parameters
    			var scanJobSetting = scanAppOption.getScanOptionJson();
    			var uploadOption = scanAppOption.getUploadOptionJson();

    			// 2. attach callbacks listeners
    			this.attachCallbacks();
    			
    			// 3. preparing mask
    			var iceUIMsg = ice.util.api.getMessage("scanner.processing.start");
				ice.view.util.mask.show(iceUIMsg);
				
    			// 4. start scan.
    			var scanJob = ricoh.dapi.app.scanner;
    			scanJob.start(scanJobSetting, uploadOption);	
    		},
    		
    		/**
    		 * Judge if the device support scanner feature or not.
    		 * 
    		 * @return null : when failed to retrieve the device info via Web API
    		 *         true : when this device supports scanner feature
    		 *         false: when this device does not support scanner feature 
    		 *
    		 * @param scanAppOption
    		 *            {ricoh.ice.model.scanAppOption} the scan and upload settings
    		 */    		
    		isSupported : function(){
    			var deviceInfo = ricoh.dapi.apiClient.request({
          			path: "/property/deviceInfo",
          			async: false,
        		});
        		if( deviceInfo ){
        			if( deviceInfo.scanner ){
        				return true;
        			} else {
        				return false;
        			}
        		} else {
        			//return null;
        			return false;
        		}
    		}
    };	
	
	/**
	 * Scan application data model class
	 * 
	 * @class scanAppOption
	 * @constructor
	 */
    ice.model.scanAppOption = function() {
    	// cap object
    	this.capability = null;
    	    
    	
		ricoh.dapi.scanner.capability( function( c, error ) { 
			if ( error ) {
				Logger.error("[ICE#Scan#capability] fails to get scanner capability information");
				this.capability = null;				 
			} else {
				this.capability = c; 
			}
		});		
		
		          	
    	// scan options
    	this.scanDevice = 'auto';
    	this.jobMode = 'scan_and_store_temporary';
    	this.scanResolution = '200';
    	this.scanColor='color_text_photo';
    	this.scanMethod='normal';
    	this.fileFormat='pdf';
    	this.originalSide='one_sided';
    	this.originalSize='mixed';
    	this.fileName = '';
    	this.originalOrientation = 'readable';
    	
    	// ice ocr options
    	this.useOcr = false;
    	this.ocrFileformat = "";
    	this.sendOriginal = false;
    	    	
    	// ice upload options
    	this.uploadUrl = "";
    	this.headers   = "";
    };

	/**
	 * set color value helper
	 * 
	 * @param {boolean}
	 *            flg true: color , false: monochrome
	 */		
	ice.model.scanAppOption.prototype.setColor = function(color){	        
		    this.scanColor = color;		   
	};
	
	/**
	 * set scan method value helper
	 * 
	 * @param {string}
	 *            normal, batch
	 */		
	ice.model.scanAppOption.prototype.setScanMethod = function(scanMethod){	        
		    this.scanMethod = scanMethod;		   
	};
		
	/**
	 * set file format
	 * 
	 * @param {String}
	 *            format "pdf" or "jpeg" is acceptable options.
	 */		
	ice.model.scanAppOption.prototype.setFileFormat = function(format){
		if(format == "pdf" || format =="jpeg" ){
			this.fileFormat = format;
		} else {
			Logger.error( "[ICE#Scan#setFileFormat] Illegal argument: format should be pdf or jpeg.");
		}
	};
	
	/**
	 * get file format
	 */		
	ice.model.scanAppOption.prototype.getFileFormat = function(){
		return this.fileFormat;
	};
	
	/**
	 * set duplex
	 * 
	 * @param {boolean}
	 *            flg true: on , false: off (none)
	 */	
	ice.model.scanAppOption.prototype.setDuplex = function(flg){
		if(!flg){
			this.originalSide = 'one_sided';
		} else {
			this.originalSide ='top_to_top';
		}
	};

	/**
	 * get duplex
	 * 
	 * @returns {boolean} true: duplex on, false: duplex off
	 */	
	ice.model.scanAppOption.prototype.getDuplex = function(){		
		return this.originalSide === 'top_to_top';		
	};
	
	/**
	 * get getOriginalOrientation
	 * 
	 * @returns {boolean} true: originalOrientation readable, false: originalOrientation unreadable
	 */	
	ice.model.scanAppOption.prototype.getOriginalOrientation = function(){		
		return this.originalOrientation === 'readable';		
	};
	
	/**
	 * set originalOrientation
	 * 
	 * @param {String}
	 *            this.originalOrientation = orgOrientation;
	 */	
	ice.model.scanAppOption.prototype.setOriginalOrientation = function(orgOrientation){
		this.originalOrientation = orgOrientation;
	};
	
	/**
	 * set paper size
	 * 
	 * @param {string}
	 *            size "auto" or "11x17" or "letter" is acceptable options.
	 */
	ice.model.scanAppOption.prototype.setPaperSize = function(size) {
		if (size === "Auto") {
			this.originalSize = 'mixed';
		} else if (size === "11x17T") {
			this.originalSize = 'size_11x17_landscape';
		} else if (size === "Letter") {
			this.originalSize = 'na_letter';
		} else if (size === "LetterT" || size === "Letter_Landscape") {
			this.originalSize = 'na_letter_landscape';
		} else if (size === "A4") {
			this.originalSize = 'iso_a4';
		} else if (size === "A4T") {
			this.originalSize = 'iso_a4_landscape';
		} else if (size === "LegalT") {
			this.originalSize = 'na_legal_landscape';
		} else if (size === "A3T") {
			this.originalSize = 'iso_a3_landscape';
		} else {
			Logger.error("[ICE#Scan#setPaperSize] paper size ["+size+"] is not supported");
		}
	};
	/**
	 * Get paper size
	 * 
	 * @returns {string} paper size "auto" or "11x17" or "letter".
	 */		
	ice.model.scanAppOption.prototype.getPaperSize = function(){
		if( this.originalSize === 'auto'){
			return 'auto';
		} else if( this.originalSize === 'size_11x17_landscape'){
			return "11x17T";					
		} else if( this.originalSize === 'na_letter' ){
			return "letter";							
		} else {
			Logger.error("[ice.model.scanAppOption] paper size ["+size+"] is not supported");
			return "error";
		}
	};
	
	
	/**
	 * set filename
	 * 
	 * @param {string}
	 *            filename the file name
	 */		
	ice.model.scanAppOption.prototype.setFileName = function(filename){
		this.fileName = filename;
	};	

	/**
	 * Get filename
	 * 
	 * @returns {string} filename the file name
	 */		
	ice.model.scanAppOption.prototype.getFileName = function(){
		return this.fileName;
	};	

	
	/**
	 * set Resolution
	 * 
	 * @param {string}
	 *            acceptable values are "150", "200","300", "600"
	 */	
	ice.model.scanAppOption.prototype.setResolution = function(res){
		if( res === "150" || res === "200" || res === "300" || res === "400" || res === "600" ){
			this.scanResolution = res;			
		}
		else {
			Logger.error("[ICE#Scan#setResolution] resolution ["+res+"] is not supported");
		}
	};
	/**
	 * Get Resolution
	 * 
	 * @returns {string} acceptable values are "150", "200","300", "600"
	 */	
	ice.model.scanAppOption.prototype.getResolution = function(){
		return this.scanResolution;
	};	
	
	/**
	 * set OCR
	 * 
	 * @param {boolean}
	 *            flg whether use Ocr or not.
	 */		
	ice.model.scanAppOption.prototype.setOCR = function(flg){
		if(!flg){
			this.useOcr = true;
		} else {
			this.useOcr = false;
		}
	};

	/**
	 * Get OCR
	 * 
	 * @returns {boolean} flg whether use Ocr or not.
	 */		
	ice.model.scanAppOption.prototype.getOCR = function(){
		return this.useOcr;
	};

	/**
	 * send original data
	 * 
	 * @param {boolean}
	 *            flg whether send original data or not
	 */		
	ice.model.scanAppOption.prototype.setSendOriginal = function(flg){
		if(!flg){
			this.sendOriginal = true;
		} else {
			this.sendOriginal = false;
		}
	};
	
	/**
	 * Get send original data flag
	 * 
	 * @returns {boolean} flg whether send original data or not
	 */		
	ice.model.scanAppOption.prototype.getSendOriginal = function(){
		return this.sendOriginal;
	};
			
	/**
	 * set OCR target file format
	 * 
	 * @param {string}
	 *            format "word" or "excel" or "" is acceptable options.
	 */		
	ice.model.scanAppOption.prototype.setOCRFileformat = function(format){
		if( format === "word" ){
			this.ocrFileformat = "word";
		} else if( format === "excel" ){
			this.ocrFileformat = "excel";			
		} else if( format === "pdf"){
			this.ocrFileformat = "pdf";					
		} else if( format === "text"){
			this.ocrFileformat = "text";
		} else {
			Logger.error("[ICE#Scan#setOCRFileFormat]The specified format ["+format + "] does not supported.");
		}
	};
	
	/**
	 * Get OCR target file format
	 * 
	 * @returns {string} format "word" or "excel" or "".
	 */		
	ice.model.scanAppOption.prototype.getOCRFileformat = function(){
		return this.ocrFileformat;		
	};
	
   	/**
	 * set upload url
	 * 
	 * @param {string}
	 *            url the upload url.
	 */		
	ice.model.scanAppOption.prototype.setUrl = function(url){
		this.uploadUrl = url;	
	};
	
   	/**
	 * Get upload url
	 * 
	 * @returns {string} url the upload url.
	 */		
	ice.model.scanAppOption.prototype.getUrl = function(){
		return this.uploadUrl;	
	};	
	
	/**
	 * set upload headers
	 * 
	 * @param {string}
	 *            headers the header value
	 */		
	ice.model.scanAppOption.prototype.setHeader = function(headers){
		this.headers = headers;	
	};
	
	/**
	 * Get upload headers
	 * 
	 * @param {string}
	 *            headers the header value
	 */		
	ice.model.scanAppOption.prototype.getHeader = function(){
		return this.headers;	
	};
    
    
    /**
	 * 
	 * Returns `true` if the scanner has capability of color image scanning
	 * 
	 * @return `true` if the scanner has capability of color image scanning
	 */
	ice.model.scanAppOption.prototype.isColorSupported = function(){
		if( !this.capability ){
			Logger.info("[ICE#Scan] isColorSupported method uses default value");
			return true;
		}
		return ice.util.api.contains(this.capability.jobSettingCapability.scanColorList,'color_text_photo');
	};
	
	
    /**
	 * 
	 * Returns `true` if the scanner has capability of auto papaer detection
	 * 
	 * @return `true` if the scanner has capability of auto papaer detection
	 */
	ice.model.scanAppOption.prototype.isAutoPaperDetectionSupported = function(){				
		if( !this.capability ){
			Logger.info("[ICE#Scan] isAutoPaperDetectionSupported method uses default value");
			return true;
		}
		return ice.util.api.contains(this.capability.jobSettingCapability.originalSizeList,'auto');      	
	};

    /**
	 * Returns `true` if the scanner has capability of letter size paper
	 * scanning
	 * 
	 * @return `true` if the scanner has capability of letter size paper
	 *         scanning
	 */
	ice.model.scanAppOption.prototype.isLetterPaperSupported = function(){		
		if( !this.capability ){
			Logger.info("[ICE#Scan] isLetterPaperSupported method uses default value");
			return true;
		}
		return ice.util.api.contains(this.capability.jobSettingCapability.originalSizeList,'na_letter') || 
			   ice.util.api.contains(this.capability.jobSettingCapability.originalSizeList,'na_letter_landscape');      	      	
	};
	
	/**
	 * Returns `true` if the scanner has capability of 11*17 paper scanning
	 * 
	 * @return `true` if the scanner has capability of 11*17 paper scanning
	 */
	ice.model.scanAppOption.prototype.is11_17PaperSupported = function(){		
		if( !this.capability ){
			Logger.info("[ICE#Scan] is11_17PaperSupported method uses default value");
			return true;
		}	
		return ice.util.api.contains(this.capability.jobSettingCapability.originalSizeList,'size_11x17') || 
			   ice.util.api.contains(this.capability.jobSettingCapability.originalSizeList,'size_11x17_landscape');      	      	
	};
	
    /**
	 * Returns `true` if the scanner has capability of duplex scanning
	 * 
	 * @return `true` if the scanner has capability of duplex scanning
	 */	
	ice.model.scanAppOption.prototype.isDuplexSupported = function(){
		if( !this.capability ){
			Logger.info("[ICE#Scan] isDuplexSupported method uses default value");
			return true;
		}		
		return ice.util.api.contains(this.capability.jobSettingCapability.originalSideList,'top_to_top');
	};

   	
	/**
	 * Get Json object for this scan job options.
	 * 
	 * @return {Object} the object to integrate
	 */	
	ice.model.scanAppOption.prototype.getScanOptionJson = function(){
		var scanOptions = {
            "jobSetting":{
           	  "scanDevice":this.scanDevice,
           	  "jobMode": this.jobMode,
           	  "originalSide": this.originalSide,
           	  "scanResolution": this.scanResolution,
           	  "scanColor": this.scanColor,
           	  "scanMethod": this.scanMethod,
           	  "originalSize": this.originalSize,
           	  "originalOrientation" : this.originalOrientation,
           	  "fileSetting": {}
        	}
        };
        

        var fileFormat = this.fileFormat;        
        if( fileFormat == "pdf" ){
	   		scanOptions.jobSetting.fileSetting.fileFormat = "pdf";
	   		scanOptions.jobSetting.fileSetting.multiPageFormat = true;
	   	} else if( fileFormat == "jpeg" ){
	   		scanOptions.jobSetting.fileSetting.fileFormat = "tiff_jpeg";
	   		scanOptions.jobSetting.fileSetting.compressionMethod = "jpeg";
	   		scanOptions.jobSetting.fileSetting.multiPageFormat = false;
	   		if( scanOptions.jobSetting.scanColor == "monochrome_text") {
	   			Logger.info("scan color param is changed.");
	   			scanOptions.jobSetting.scanColor = "grayscale";
	   		}
	   	}        
        return scanOptions;	
	};
	
	/**
	 * Get Key Value String for Upload Options.
	 * 
	 * @return {Object} the object to integrate
	 */	
	ice.model.scanAppOption.prototype.getUploadOptionJson = function(){
		var uploadOptions = {
	            "url": this.uploadUrl,
			    "headers": this.headers,
     	  		"params": {}
	        };
		
        if( this.fileName != ''){
            if( this.fileFormat == "pdf" ){
            	uploadOptions.params.fileName = this.fileName+".pdf";
            } else if( this.fileFormat == "jpeg" ){
            	uploadOptions.params.fileName = this.fileName+"-%3p.jpeg";
            }
        }
        
        uploadOptions.params.chunkedStreaming = true;
        
	    return uploadOptions;
	};
	

    /**
	 * Printer controller class
	 * 
	 * @class printer
	 * @constructor
	 */
    ice.controller.printer = {
    
    		/**
    		 * Initialize the printer controller
    		 * @method
    		 * @return {undefined}
    		 */
    		init : function(){
    		    // Define i18next options.
    		    var i18nOptions =  {
    		      lng: ricoh.dapi.navigator.language,
    		      // Set file path. 'js/locales/dapi.en.json' and 'js/locales/dapi.ja.json' will be loaded.
    		      resGetPath: "locales/__ns__.__lng__.json",
    		      fallbackLng: 'en',
    		      // Namespace for SmartSDK Application JS is 'dapi'.
    		      ns: "dapi"
    		    };

    		    // ricoh.dapi.app.scanner.init() and following functions requires i18next.
    		    i18n.init( i18nOptions , function() {
        			Logger.debug("[ICE#Print] init() is called.");
        			// 1. security token integration (Cheetah v1.0.2)
        			var token = ice.util.security.getToken();
        			
        			// 2. initialize the printer logic
       				ricoh.dapi.app.printer.init({ "setBackMenu": false, "accessToken": token } );
    		    } );
    		},
    		
    		/**
    		 * Attach callback listeners
    		 * @private 
    		 */
    		attachCallbacks: function(fileURL){
    			Logger.debug("[ICE#Printr#attachCallbacks()] is called.");
    			// preparing the scan job callback function from here
    			var printJob = ricoh.dapi.app.printer;

    			printJob.onProcessing = function(message,details){
    				var eventId = details.id;
    				Logger.debug("[ICE#Print#onProcessing] ["+eventId+"]"+ message);    			
       				    				    				    			
    				if( eventId === "printer.processing.downloading"){    					
           				ice.view.util.mask.show(message);
    				}
    			};
    			
    			printJob.onNotify = function(message,details){
    				var eventId = details.id;
    				Logger.debug("[ICE#Print#onNotify] ["+eventId+"]"+ message);    			
       				
    				if( eventId === "printer.completed.downloading" ){
    					ice.view.util.mask.show(message);
    					ice.view.util.printJobObserver.onDownloadCompleted(fileURL);
    					
    					setTimeout(function(){  
    						ice.view.util.mask.hide();
    						deleteFileAPI(fileURL);
    				    }, 1000);
        			} 
    				if( eventId === "printer.completed.printing" ){
    					ice.view.util.mask.hide();
        			} 
    				
    			};
    			
    			printJob.onProcessingUpdate = function(message,details){
    				var eventId = details.id;
    				Logger.debug("[ICE#Print#onProcessingUpdate] ["+eventId+"]"+ message);
    				    				
    				if( eventId === "printer.processing.downloading"){    					
           				ice.view.util.mask.show(message);
    				}
    				if( eventId === "printer.processing.start"){    
    				}
    				if( eventId === "printer.processing.printing"){    
    				}
    			};

    			printJob.onAlert = function(message,details){
    				var eventId = details.id;
    				Logger.debug("[ICE#Print#onAlert] ["+eventId+"]"+ message);
          
    				ice.view.util.simpleDialog.show(message);
    				ice.view.util.mask.hide();
    			};
  
    			printJob.onAborted = function(message,details){
    				var eventId = details.id;
    				ice.view.util.printJobObserver.onDownloadCompleted(fileURL);
    				if( eventId === "printer.aborted.downloading" ){
    					Logger.info("[ICE#Print#onAborted] ["+eventId+"]"+ message);
    					ice.view.util.simpleDialog.show(message);
    					ice.view.util.mask.hide();
    				}
    			};
  
    			printJob.onCompleted = function(message,details){
    			    var eventId = details.id;
    				Logger.debug("[ICE#Print#onCompleted] ["+eventId+"]"+ message);
    				ice.view.util.printJobObserver.onDownloadCompleted(fileURL);
    				ice.view.util.mask.hide();
    			};    			
    		},
    		
    		/**
    		 * Start download and print
    		 * @method
    		 * @param {ricoh.ice.model.printAppOption} printAppOption the download & print options
    		 * @return {undefined}
    		 */    
    		doPrint: function(printAppOption){
    			// 0. Log
    			//Logger.debug("[ice.controller.printer#doPrint] "+ printAppOption.getPrintOptionJson());
    			Logger.info("[ICE#Print#doPrint] "+ printAppOption.getPrintOptionJson());
    	
    			// 1. prepare options
    			var printJob = ricoh.dapi.app.printer;    	
    			var fileURL = printAppOption.getUrl();
    			var printJobOptions = printAppOption.getPrintOptionJson();
        
    			// 2. validate parameters
    			if( ice.util.logger.getLevel() < Logger.INFO ){
    				ricoh.dapi.printer.validate( 
    						printJobOptions,
    						function( result, error ) {
    							if ( result === false ) {
    								//Logger.error("[ICE#Print] The specified print options are not valid.");
    								//Logger.error("[ICE#Print] options : "+ printJobOptions);
    								return;
    							}
    						});
    			}

    			// 3. attach callback listeners
    			this.attachCallbacks(fileURL);
        
    			// 4. preparing mask
    			//the below mask is not required. we display masks during callbacks.
    			//ice.view.util.mask.show("Preparing");
    			
    			// 5. start print job
    			printJob.start( fileURL, printJobOptions);
    		},
    		
    		/**
    		 * Check the Passthrow print capability
    		 * @method
    		 * @return {boolean} true
    		 */ 
    		isPassthroughSupported: function(){
    			var passthroughFlg = ricoh.dapi.getSupport();
    			//alert("dump passthroughFlg : "+passthroughFlg);
    			if ( !passthroughFlg || !passthroughFlg.modifiedPrint ) {
    			    return false;
    			} else {
        			return true;
    			}
    		},
    		
    		/**
    		 * Check if the Passthrow print is used
    		 * @method
    		 * @return {boolean} true
    		 */ 
    		isPassthroughUsed: function(){    		    
    		    if( ricoh.dapi.app.printer._onPrivatePrintResult ){
    		    	return true;
    		    } else {
    		    	return false;
    		    }
    		}
    };
    /**
	 * @class the print application data model class
	 * @constructor
	 */
    ice.model.printAppOption = function() {
    	/**
		 * Print capability object
		 * 
		 * @type object
		 * @private
		 */
    	this.printCap = null;
    	
    	/**
		 * @ignore
		 * @private
		 */    	
    	//Commenting this out since Print Capability is already used in the App and 
    	//this.printCap = c throws out error in Cheetah G2.
    	/*ricoh.dapi.printer.capability(
    		"pdf",
    	    function( c, error ) {
    	     	if ( error ) {        
    	     		Logger.error("[ICE#Print] fails to get the printer capability information");
    	     		this.printCap = null;
		     	} else {
		     		this.printCap = c;
		     	}
		     },
    		 true);*/
    	
    	/**
		 * Number of copies
		 * 
		 * @type number
		 * @private
		 */
    	this.copies = 1;
    	/**
		 * Staple option
		 * 
		 * @type string
		 * @private
		 */
    	this.staple = 'none';
    	/**
		 * Combine option
		 * 
		 * @type string
		 * @private
		 */    	
    	this.combine = 'none';
    	/**
		 * Duplex option
		 * 
		 * @type string
		 * @private
		 */    	    	
    	this.printSide='one_sided';
    	/**
		 * Duplex option
		 * 
		 * @type string
		 * @private
		 */
    	this.printColor='color';
    	
    	/**
		 * Upload Url
		 * 
		 * @type string
		 * @private
		 */    	
    	this.downloadUrl = "";    	
    	
    	/**
		 * JsonPrintOption field for Karachi printing
		 * 
		 * @type json object
		 * @private
		 */    	
    	this.jsonPrintOptions = null;    	
    };
    
    /**
	 * Set Print capability object
	 * @private
	 * @ignore
	 * @param {object} Print capability object
	 */	 
	ice.model.printAppOption.prototype.setPrintCap = function(printCap){
		this.printCap = printCap;
	};
    
    /**
	 * Set print options by Json (for Karachi SaaS App)
	 * @private
	 * @ignore
	 * @param {object} Print option json object
	 */	 
	ice.model.printAppOption.prototype.setPrintOptionJson = function(printOption){
		this.jsonPrintOptions = printOption;
	};
    
	/**
	 * Set number of copies
	 * 
	 * @param {Number}
	 *            num the number of copies (1 <= num && num <= 999)
	 */	 
	ice.model.printAppOption.prototype.setCopies = function(num){
		if( 1 <= num && num <= 999){		
			this.copies = num;
		} else {
		    Logger.log( "[ICE#Print] Illegal argument: num should be 1 <= num && num <= 999");
		}
	};
    /**
	 * Get number of copies
	 * 
	 * @returns {Number} the specified number of copies
	 */	 
	ice.model.printAppOption.prototype.getCopies = function(){
		return this.copies;
	};	

	/**
	 * Set Duplex
	 * 
	 * @param {Boolean}
	 *            flg (true: on, false: off none)
	 */
	ice.model.printAppOption.prototype.setDuplex =  function(duplex){
			this.printSide = duplex;
	};
	
	/**
	 * Get Duplex
	 * 
	 * @returns {boolean} the duplex setting (true: on, false: off)
	 */
	ice.model.printAppOption.prototype.getDuplex =  function(){		
		return	this.printSide;
	};
	
	/**
	 * Set Layout
	 * 
	 * @param {Number}
	 *            num the number pages per sheet (options: 1,2,4,9,16) [depends on machine capability]
	 */
	ice.model.printAppOption.prototype.setLayout = function(num){
		if(num === 1 || num === 'none'){
			this.combine ='none';
		} else if(num === 2 || num === '2in1'){
			this.combine = '2in1';
		} else if(num === 4 || num === '4in1'){
			this.combine ='4in1';
		} else if(num === 9 || num === '9in1'){
			this.combine = '9in1';
		}  else if(num === 16 || num === '16in1'){
			this.combine = '16in1';
		} else {
       		Logger.error("error occurs in setlayout error"+num);
		}		
	};

	/**
	 * Get the number of pages per sheet
	 * 
	 * @return {Number} the number of pages per sheet (options: 1,2,4,9,16)
	 */
	ice.model.printAppOption.prototype.getLayout = function(){
		if(this.combine === 'none'){
			return 1;
		} else if(this.combine === '2in1'){
			return 2;
		} else if(this.combine ==='4in1'){
			return 4;
		} else if(this.combine === '8in1'){
			return 8;
		} else if(this.combine === '16in1'){
			return 16;
		} else {
       		Logger.error("error occurs in getlayout error");
		}		
	};
	/**
	 * Set color
	 * 
	 * @param {Boolean}
	 *            isColor true: color, false: monochrome
	 */	
	ice.model.printAppOption.prototype.setColor = function(isColor){
		if(isColor === "true"){
			this.printColor ='color';
		} else {
			this.printColor = 'monochrome';
		}
	};
	
	/**
	 * Get color mode
	 * 
	 * @returns {Boolean} the specified color setting (true: color, false:
	 *          monochrome)
	 */	
	ice.model.printAppOption.prototype.getColor = function(){
		return (this.printColor ==='color');		
	};
	
	/**
	 * Set staple
	 * 
	 * @param {Boolean}
	 *            flg (true: on, false: off none)
	 */
	ice.model.printAppOption.prototype.setStaple =  function(flg){
		if(flg === true){
			this.staple ='top_left';			
		} else {
			this.staple = 'none';
		} 
	};
	
	/**
	 * Get staple
	 * 
	 * @returns {Boolean} the specified staple setting (true: on, false: off
	 *          none)
	 */
	ice.model.printAppOption.prototype.getStaple =  function(){
		return (this.staple ==='top_left');			
	};
	
	/**
	 * Set pdf file url
	 * 
	 * @param {string}
	 *            url the pdf file url
	 */	
	ice.model.printAppOption.prototype.setUrl = function(url){
		this.downloadUrl = url;
	};
	/**
	 * Get pdf file url
	 * 
	 * @returns {string} file url
	 */	
	ice.model.printAppOption.prototype.getUrl = function(){
		return this.downloadUrl;
	};

	
	/**
	 * Capability check method for duplex printing.
	 * 
	 * @return `true` if the printer has capability of duplex printing.
	 */
	ice.model.printAppOption.prototype.isDuplexSupported = function(){
		if( this.printCap === null ){
			//return true;
			return "error";
		}
		
		return ice.util.api.contains(this.printCap.jobSettingCapability.printSideList,'top_to_top');
	};
	
	/**
	 * Capability check method for staple
	 * 
	 * @return `true` if the printer has capability to staple.
	 */
	ice.model.printAppOption.prototype.isStapleSupported = function(){
		if( this.printCap === null ){
			//return false;
			return "error";
		}
		return ice.util.api.contains(this.printCap.jobSettingCapability.stapleList,'top_left');
	};
	
	/**
	 * Capability check method for color printing
	 * 
	 * @return `true` if the printer has capability to color printing.
	 */
	ice.model.printAppOption.prototype.isColorSupported = function(){
		if( this.printCap === null ){
			//return true; // as default
			return "error";
		}
		return ice.util.api.contains(this.printCap.jobSettingCapability.printColorList,'color');
	};
	
	/**
	 * Get Json object for this print job options.
	 * 
	 * @return {Object} Json object for this print job setting
	 * @private
	 */	
	ice.model.printAppOption.prototype.getPrintOptionJson = function(){ 
		// if print options are specified by json object, use that.  (ICE PCL printing)
		if( this.jsonPrintOptions != null ){
			return this.jsonPrintOptions;
		}
		
		// PDF printing case
	   	var pdl = "pdf";
	   	var jobSetting = {
       		"copies": this.copies,
       		"printSide": this.printSide,
	        "combine": this.combine,
       		"staple": this.staple,
       		"printColor": this.printColor
	   	};
	    
	   	var printOptions = {    		
	    	"pdl": pdl,
    		"jobSetting": jobSetting
    	};
    	
    	return printOptions;
	};

	/**
	 * This is a reserved namespace for UI plugin class
	 * @ignore
	 */
	ice.view.plugin = function(){};
	
	
	/**
	 * This is a namespace for view utility callback I/F.
	 * @ignore
	 */
	ice.view.util = function(){};
	
	/**
	 * Mask string I/F class. This class should be overriden by application.
	 * @class mask
	 */
	ice.view.util.mask = function(){};

	/**
	 * show the masked message
	 * @param message message
	 * @return {undefined} 
	 */
	ice.view.util.mask.prototype.show = function(message){Logger.log("[ICE#Mask] Show Mask @Original"+message); };
	
	/**
	 * hide the mask
	 * @method
	 * @return {undefined}
	 */
	ice.view.util.mask.prototype.hide = function(){Logger.log("[ICE#Mask] Hide Mask @Original");};
		
	
	/**
	 * Simple Dialog I/F class. This class should be overriden by application.
	 * @class simple dialog
	 */
	ice.view.util.simpleDialog = function(){};
	
	
	/**
	 * Show the simple dialog
	 * @param message message
	 */
	ice.view.util.simpleDialog.prototype.show = function(message){ Logger.info("[ICE#SimpleDialog(Original)]  Show simple dialog :"+message ); };
	
	/**
	 * Hide the simple dialog
	 * @param message message
	 */		
	//ice.view.util.simpleDialog.prototype.hide = function(){	Logger.info("[ICE#SimpleDialog(Original)]  Hide simple dialog :");	};
		
	/**
	 * Operation Dialog I/F class. This class should be overriden by application.
	 * @class operation dialog
	 */
	ice.view.util.operationDialog = function(){};	
	
	/**
	 * Show the message with operation dialog
	 * @param message {string} message
	 * @param details {Object} details object
	 *   @param {String}         details.id unique id describing this event
	 *   @param {String}         details.process process name of what is processing
	 *   @param {String}         details.uid unique job id
	 *   @param {ricoh.dapi.Job} [details.job] current job
	 *   @param {Number}         [details.printedCount] printed count. set only when process is printing
	 *   @param {Number}         [details.scannedCount] scanned count. set only when process is scanning
	 *   @param {Number}         [details.sentCount] sent count. set only when process is sending
	 *   @param {Object}         [details.download] set only when process is downloading
	 *     @param {String}         [details.download.url] download url
	 *     @param {Number}         [details.download.progress] download progress (%)
	 *   @param {Object}         [details.upload] set only when process is uploading
	 *     @param {String}         [details.upload.filename] uploading file name
	 *     @param {Number}         [details.upload.progress] upload progress (%)
	 *     @param {Number}         [details.upload.number] the number of upload pages
	 *   @param {Boolean}        details.cancel whether the job can be canceled
	 *   @param {Object}         [details.callbacks]
	 *     @param {Function}       [details.callbacks.cancel] cancel callback function
	 *   @param {Any}            [details.userInfo] user setting info 
	 */
	ice.view.util.operationDialog.prototype.show = function(message,details){ Logger.info("[ICE#OperationDialog(Original)]  Show operation dialog :"+message+" "+ details); };	
	/**
	 * Update the message 
	 * @param message {string} message
	 * @param details {object} the details object which is defined in ricoh.dapi.app.js
	 */
	ice.view.util.operationDialog.prototype.update = function(message,details){	Logger.info("[ICE#OperationDialog(Original)]  Update operation dialog :"+message +" "+ details);};	
	/**
	 * Hide the message
	 */
	ice.view.util.operationDialog.prototype.hide = function(){Logger.info("[ICE#OperationDialog(Original)]  Hide operation dialog.");};	

	/**
	 * Scan stop Dialog I/F class. This class should be overriden by application.
	 * @class Scan stop dialog
	 */
	ice.view.util.scanStopDialog = function(){};
	
	
	/**
	 * Show the scan stop dialog
	 * @param message message
	 * @param details detail object
	 */
	ice.view.util.scanStopDialog.prototype.show = function(message, details){ Logger.info("[ICE#ScanStopDialog(Original)]  Show scan stop dialog :"+message ); };
	
	/**
	 * Hide the scan stop dialog
	 * @param message message
	 */		
	ice.view.util.scanStopDialog.prototype.hide = function(){	Logger.info("[ICE#ScanStopDialog(Original)]  Hide scan stop dialog :");	};


	ice.view.util.printJobObserver = function(){};
	
	/**
	 * Callback method for download completed.
	 */
	ice.view.util.printJobObserver.prototype.onDownloadCompleted = function(fileUrl){ Logger.info("[ICE#PrintJobObserver] "+fileUrl+" has been downloaded.");};
	
	
	/**
	 * Scan job state observer
	 * @class Scan job observer
	 */
	ice.view.util.scanJobObserver = function(){};
	/**
	 * Callback method for job is finished. 
	 */
	ice.view.util.scanJobObserver.prototype.onDone = function(){ Logger.info("[ICE#ScanJobObserver] job is done.");};
	  
	/**
	 * Utility methods for this file internal
	 * @private
	 * @ignore
	 */
	ice.util.api = {
		contains: function(array, obj){
        	for (var i = 0; i < array.length; i++) {
	       		if (array[i] === obj) {
    	       		return true;
        		}
    		}
    		return false;
		},
		
		getMessage: function(id){
			var word;
			id = ICE_I18N_NAMESPACE + ":" + id;
			word = i18n.t(id);
			
			return word;
		}	
	};
	
	var _sToken=null;
	/**
	 * Utility methods for this file internal
	 * @private
	 * @ignore
	 */
	ice.util.security = {
		//	var sToken = null;
		setToken: function(token, productName, resultCallback){
    		if( token == null || productName == null ){
    			Logger.info("[ICE#Security] Parameter is invalid.");
    			return;
    		}
    		document.title = productName;
    		_sToken = token;
    		ricoh.dapi.validateAccessToken(_sToken, resultCallback);
    	},
    	
		getToken: function(){
			return _sToken;
		}
	};

    /**
	 * Logger
	 * 
	 * @class logger
	 */
    ice.util.logger = {
     /**
 	  * Set log level
	  * @method setLevel
	  * @param {Integer}
	  *            level
	  */
      setLevel: function( level ) {
        Logger.setLevel( level );
        if( ricoh.dapi.app ){
        	ricoh.dapi.app.logger.setLevel( level );
        }
      },
      
      /**
	   * Get log level 
	   * @method getLevel
	   */
      getLevel: function() {
        return Logger.getLevel();        
      },      
      /**
	   * Write trace level log 
	   * @param message message
	   */
      trace: function(message){
    	  Logger.trace(message);
      },
      /**
	   * Write debug level log 
	   * @param message message
	   */      
      debug: function(message){
    	  Logger.debug(message);
      },
      
      /**
	   * Write info level log 
	   * @param message message
	   */      
      info: function(message){
    	  Logger.info(message);
      },
      /**
	   * Write warn level log 
	   * @param message message
	   */      
      warn: function(message){
    	  Logger.warn(message);
      },
      
      /**
	   * Write error level log 
	   * @param message message
	   */
      error: function(message){
    	  Logger.info(message);
      },
      
      /**
		 * TRACE Level 
		 * @property TRACE
		 * @type {Integer}
		 */
      TRACE: Logger.TRACE,
      /**
		 * DEBUG LEVEL
		 * @property DEBUG
		 * @type {Integer}
		 */
      DEBUG: Logger.DEBUG,
      /**
		 * INFO LEVEL
		 * @property INFO
		 * @type {Integer}
		 */
      INFO:  Logger.INFO,
      /**
		 * WARN LEVEL
		 * @property WARN
		 * @type {Integer}
		 */
      WARN:  Logger.WARN,
      /**
		 * ERROR LEVEL
		 * @property ERROR
		 * @type {Integer}
		 */
      ERROR: Logger.ERROR
    };
    
    // Cheetah v1.0.2 token
    var token= "/yRUEU9p0bcbIoN5wA3BT5asv0NS+Hj8jHmJTeDmTkIjarHI0IUCG1SraA1Ed+emyPC8ESV41/kU/VRbivAW5UTMzmKHhfJchQsaqDnMTxyfGPK/Cy7vuveSm++rjLVzrF8tFZBeMV5QQxqyxu0Pdd6gnz9i7skfs3hGtfACvnrh1X/qYveYUwf2wacv8XpzMtpQC6O/rDX3/tY1jGK6jw==";
    var productName = "ICE"; 

    // Access token logic
    //var skipValidation = (typeof root.ricoh.ice.helper !== "undefined");
    var skipValidation = false;
    var retryFlag = true; 
      
    function _resultCallback(result) {
    	if (result.result === true) {
 	    // do nothing.
    	} else if (result.result === false && result.detail === "busy") {
     	    var pToken = token;
    	    var pResultCallback = _resultCallback;
    	    var pRetryFlag = retryFlag;
    	    if( pRetryFlag ){
   		setTimeout(ricoh.dapi.validateAccessToken,0,pToken,pResultCallback);
    	    }
    	} else {
    	    alert("Failed to validate this application.");
    	}
    }    

    if(skipValidation === true ){
	  // do nothing and validate access token by using ricoh.ice.helper.js
          //console.log("[ICE] skip access token validation in ricoh.ice.js.");
	 //alert("will skip validation in ricoh.ice.js.");    // <-- for debugging only
	 	console.log("SDCA - will skip validation in ricoh.ice.js. skipValidation === true ");
    } else if(typeof ricoh.dapi.getSupport !== "undefined" && ricoh.dapi.getSupport() != undefined && ricoh.dapi.getSupport().validateAccessToken == true ) {
          //alert("will do validation.");      // <-- for debugging only
          console.log("SDCA - will do validation. ricoh.dapi.getSupport().validateAccessToken == true");
  	  ricoh.ice.util.security.setToken(token, productName, _resultCallback);
    } else {
      console.log("SDCA - ricoh.dapi.getSupport().validateAccessToken == false");
      ricoh.dapi.validateAccessToken = function( accessToken, resultCallback ) {
         setTimeout(ricoh.dapi.internal.validateAccessTokenResult, 0, JSON.stringify({"result":true, "accesstoken": accessToken}), resultCallback);
      };
      ricoh.ice.util.security.setToken(token, productName,_resultCallback);
    }
})( window );

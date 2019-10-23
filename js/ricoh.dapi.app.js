/**
 * @copyright Copyright 2013-2015 Ricoh Company, Ltd. All Rights Reserved.
 * @license Released under the MIT license
 *
 * Copyright (c) 2013-2015 Ricoh Company, Ltd. All Rights Reserved.
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
 * This ricoh.app.js supports SmartSdk Version : 2.10
 */

/**
 * Provides the application class which enable developers to create applications connected to each device API easily.
 * @module ricoh.dapi.app
 */
( function( root ) {

  "use strict";

  var ricoh, dapi, app,
      i18n,
      Device,
      Scanner, Printer, Copy, Fax,
      Job, Upload,
      logger, util,
      INIT_COUNT = 5,
      I18N_NAMESPACE = "dapi";

  /**
   * @namespace ricoh.dapi.app
   */

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

  app = dapi.app = dapi.app || {};
  // for setLevel
  dapi.app.logger = dapi.logger;
  logger = dapi._logger;
  util = dapi._util;

  if ( root.i18n ) {
    i18n = root.i18n;
  } else {
    logger.warn( "i18n is undefined. Use mock object which returns a key." );
    i18n = root.i18n = {
      t: function( key ) {
        return key;
      },
      mock: true
    };
  }

  /**
   * A Base class for each device application.
   *
   * @private
   * @class Device
   * @constructor
   */
  Device = function( device, service, systemName ) {
    var me = this;

    /**
     * Whether this device is ready.
     *
     * @protected
     * @property _isReady
     * @type     Boolean
     * @default  false
     */
    me._isReady = false;

    /**
     * Whether the user is permitted to use this device.
     *
     * @protected
     * @property _isPermitted
     * @type     Boolean
     * @default  false
     */
    me._isPermitted = false;

    /**
     * Whether init has succeeded.
     *
     * @protected
     * @property _isInitialized
     * @type     Boolean
     * @default  false
     */
    me._isInitialized = false;

    /**
     * A device object defined in ricoh.dapi.ext.js
     *
     * @protected
     * @property  _device
     * @default   null
     * @see       ricoh.dapi.ext.js
     */
    me._device = device;

    /**
     * A service name included in API path.<br />
     * /rws/service/{_service}/...
     *
     * @protected
     * @property  _service
     * @type      String
     * @default   ""
     */
    me._service = service;

    /**
     * System name of a service which is used in dapi.displayAlertDialog.
     *
     * @protected
     * @property _systemName
     * @type     String
     * @default  ""
     */
    me._systemName = systemName;

    /**
     * User setting callback functions.
     *
     * @protected
     * @property _userCallbacks
     * @type     {Object}
     * @default  null
     */
    me._userCallbacks = null;

    /**
     * Current running jobs.
     *
     * @public
     * @property jobs
     * @type     {ricoh.dapi.app.Job[]}
     * @default  []
     */
    me.jobs = [];

    /**
     * Whether setBack_Menu true when all jobs have been finished.
     *
     * @protected
     * @property  _setBackMenu
     * @type      {Boolean}
     * @default   true
     */
    me._setBackMenu = true;

    /**
     * Whether unlock power mode when all jobs have been finished.
     *
     * @protected
     * @property  _unlockPowerMode
     * @type      {Boolean}
     * @default   true
     */
    me._unlockPowerMode = true;

    /**
     * Whether unlock logout when all jobs have been finished.
     *
     * @protected
     * @property  _unlockLogout
     * @type      {Boolean}
     * @default   true
     */
    me._unlockLogout = true;
  };

  /**
   * Initialize a app object.<br>
   * Start monitoring device state, check device status and permission.
   *
   * @public
   * @method  init
   * @param   {Object} [config] Config.
   *   @param {Boolean}  [config.setBackMenu=true] if true, setBack_Menu true when all jobs have been finished
   *   @param {Boolean}  [config.unlockPowerMode=true] if true, unlock power mode when all jobs have been finished
   *   @param {Boolean}  [config.unlockLogout=true] if true, unlock logout when all jobs have been finished
   *   @param {Function} [config.onInitResult] See ricoh.dapi.xxxx.onInitResult
   *   @param {Function} [config.onStatusChange] See ricoh.dapi.xxxx.onStatusChange
   */
  Device.prototype.init = function( _config ) {
    var me = this,
        config = util.clone( _config ) || {},
        initCount = INIT_COUNT,
        authState,
        deviceConfig = {};

    if ( config.setBackMenu !== undefined ) {
      this._setBackMenu = config.setBackMenu;
    }
    if ( config.unlockPowerMode !== undefined ) {
      this._unlockPowerMode = config.unlockPowerMode;
    }
    if ( config.unlockLogout !== undefined ) {
      this._unlockLogout = config.unlockLogout;
    }
    if( config.accessToken !== undefined ) {
      deviceConfig.accessToken = config.accessToken;
    }

    me._device.onInitResult = function( result, error ) {
      if ( config.onInitResult ) {
        logger.trace( "onInitResult( " + result + " ) is called" );
        config.onInitResult.apply( me._device, [ result, error ] );
      }

      // if failed to init, retry it
      if ( !result ) {
        logger.warn( "init failed" );
        if ( initCount > 1 ) {
          initCount--;
          me._device.init( deviceConfig );
        } else if ( initCount === 1 ) {
          var serviceId = me._service + ".error.init_failure";
          if( error && error.errors  ) {
            serviceId = me._service + "." + error.errors[0].message_id;
          }
          me._callOnAlert({
            id: serviceId,
            process: me._service
          });
        }
        return;
      }

      logger.debug( "ricoh.dapi." + me._service + ".init succeeded." );
      me._isInitialized = true;

      authState = ricoh.dapi.auth.getAuthState();
      // check whether the user is permitted
      if ( !( authState && authState.permission && authState.permission[ me._service ] === true ) ) {
        me._callOnAlert({
          id: me._service + ".error.not_permitted",
          process: me._service
        });
        return;
      }
      me._isPermitted = true;

      me._device.getStatus( function( status ) {
        if ( !status ) {
          logger.warn( "cannot get status" );
        } else {
          if ( me._isDeviceReady( status ) ) {
            me._isReady = true;
            logger.debug( "onReady is called" );
            me.onReady();
          } else {
            if ( me._isDeviceBusy( status ) ) {
              me._callOnAlert( {
                id: me._service + ".error.other_function_using",
                process: me._service
              } );
            }
            logger.debug( "onUnready is called" );
            me.onUnready();
          }
          me._switchAlertDialog( status );
        }
      });
    };
    me._device.onStatusChange = me._onStatusChange( config.onStatusChange );
    me._device.init( deviceConfig );
  };

  /**
   * Reset the properties.
   *
   * @private
   * @method _reset
   */
  Device.prototype._reset = function() {
    this._isReady = false;
    this._isPermitted = false;
    this._userCallbacks = null;
    this.jobs = [];
    this._setBackMenu = true;
    this._unlockPowerMode = true;
    this._unlockLogout = true;

    this._device.onInitResult = undefined;
    this._device.onStatusChange = undefined;
  };

  /**
   * Returns onStatusChange handler which displays a system dialog when app errors happen.
   *
   * @protected
   * @method _onStatusChange
   * @param  {Function} [userHandler]
   * @return {Function}
   */
  Device.prototype._onStatusChange = function( userHandler ) {
    var me = this;

    return function() {
      if ( !me._isReady && me._isDeviceReady( this.status ) ) {
        me._isReady = true;
        me.onReady();
      } else if ( me._isReady && !me._isDeviceReady( this.status ) ) {
        me._isReady = false;
        me.onUnready();
      } else {
        // device ready status is not changed.
      }
      me._switchAlertDialog( this.status );

      if ( userHandler ) {
        userHandler.apply( this );
      }
    };
  };

  /**
   * Return whether the device is ready to start job.
   *
   * @protected
   * @param  {Object}  statusObj
   * @return {Boolean} true, if the device is ready to start job.
   */
  Device.prototype._isDeviceReady = function( statusObj ) {
    if ( !statusObj ) {
      return false;
    }

    return statusObj[ this._service + "Status" ] === "idle";
  };

  /**
   * Return whether the device cannot run a new job because of running job.
   *
   * @protected
   * @param  {Object}  statusObj
   * @return {Boolean} true, if the device is running a job.
   */
  Device.prototype._isDeviceBusy = function( statusObj ) {
    return statusObj[ this._service + "Status" ] === "processing" ||
      statusObj[ this._service + "Status" ] === "stopped";
  };

  /**
   * Show or hide system alert dialog.
   * 
   * @protected
   * @method _switchAlertDialog
   * @param  {Object} status device status object.
   * @return {Boolean} true when the dialog was shown.
   */
  Device.prototype._switchAlertDialog = function( status ) {
    var me = this,
        deviceStatus, statusReasons,
        hasSystemDialog;

    // this is a extended class from 'dapi.Device'
    deviceStatus = status[ me._service + "Status" ];
    statusReasons = status[ me._service + "StatusReasons" ];

    if ( me._service === "printer" ) {
      hasSystemDialog = ( statusReasons && statusReasons[0].severity === "error" );
    } else {
      hasSystemDialog = ( status && ( status.occuredErrorLevel === "fatal_error" || status.occuredErrorLevel === "error" ) );
    }
    
    if ( hasSystemDialog ) {
      logger.trace( "ricoh.dapi.displayAlertDialog is called" );
      dapi.displayAlertDialog( me._systemName, deviceStatus, statusReasons[0][ me._service + "StatusReason" ] );
    } else {
      dapi.hideAlertDialog();
    }
    return hasSystemDialog;
  };

  /**
   * Called when a device status become ready.<br>
   * Should be override by a user application.
   *
   * @public
   * @method onReady
   */
  Device.prototype.onReady = function() {};

  /**
   * Called when a device status become unready( cannot start jobs )<br>
   * Should be override by a user application.
   *
   * @public
   * @method onUnready
   */
  Device.prototype.onUnready = function() {};

  /**
   * Called when a device starts to request a job start, cancel or proceeding.<br>
   * Should be override by a user application.
   *
   * <table>
   * <tr><th>message</th><th>id</th><th>process</th></tr>
   * <tr><td>printer.requesting.start</td><td>printer.requesting.start</td><td>start</td></tr>
   * <tr><td>printer.requesting.cancel</td><td>printer.requesting.cancel</td><td>cancel</td></tr>
   * <tr><td>scanner.requesting.start</td><td>scanner.requesting.start</td><td>start</td></tr>
   * <tr><td>scanner.requesting.cancel</td><td>scanner.requesting.cancel</td><td>cancel</td></tr>
   * <tr><td>scanner.requesting.proceed</td><td>scanner.requesting.proceed</td><td>proceed</td></tr>
   * <tr><td>scanner.requesting.finish</td><td>scanner.requesting.finish</td><td>finish</td></tr>
   * </table>
   *
   * @public
   * @method onRequesting
   * @param  {String} msg localized message or message key.
   * @param  {Object} details
   *   @param {String}         details.id unique id describing this event
   *   @param {String}         details.process process name of what is requested
   *   @param {String}         details.id unique job id
   *   @param {ricoh.dapi.Job} details.job current job object
   *   @param {Any}            [details.userInfo] user setting info
   */
  /* jshint unused:false */
  Device.prototype.onRequesting = function( msg, details ) {};

  /**
   * Wrapper method to call onRequesting.
   *
   * @protected
   * @method _callOnRequesting
   * @param {Object}             details see {{#crossLink "ricoh.dapi.app.Device/onRequesting:method"}}{{/crossLink}}
   * @param {ricoh.dapi.app.Job} job job
   */
  Device.prototype._callOnRequesting = function( details, job ) {
    details = details || {};
    if ( job ) {
      details.uid = job.id;
      details.job = job.obj;
      details.userInfo = job.userInfo;
    }
    logger.debug( "onRequesting:" + details.id + " is called" );
    this._logDetails( details );
    this.onRequesting( this._getMessage( details.id ), details );
  };

  /**
   * Called when a request has done.<br>
   * Should be override by a user application.
   *
   * <table>
   * <tr><th>message</th><th>id</th><th>process</th></tr>
   * <tr><td>printer.done.start</td><td>printer.done.start</td><td>start</td></tr>
   * <tr><td>printer.done.cancel</td><td>printer.done.cancel</td><td>cancel</td></tr>
   * <tr><td>scanner.done.start</td><td>scanner.done.start</td><td>start</td></tr>
   * <tr><td>scanner.done.cancel</td><td>scanner.done.cancel</td><td>cancel</td></tr>
   * <tr><td>scanner.done.proceed</td><td>scanner.done.proceed</td><td>proceed</td></tr>
   * <tr><td>scanner.done.finish</td><td>scanner.done.finish</td><td>finish</td></tr>
   * </table>
   *
   * @public
   * @method onDone
   * @param {String} msg localized message or message key.
   * @param {Object} details
   *   @param {String} details.id unique id describing this event
   *   @param {String} details.process process name of what has done
   *   @param {Any}    [details.userInfo] user setting info
   */
  /* jshint unused:false */
  Device.prototype.onDone = function( msg, details ) {};

  /**
   * Wrapper method to call onDone.
   *
   * @protected
   * @method _callOnDone
   * @param {Object}             details see {{#crossLink "ricoh.dapi.app.Device/onDone:method"}}{{/crossLink}}
   * @param {ricoh.dapi.app.Job} job job
   */
  Device.prototype._callOnDone = function( details, job ) {
    details = details || {};
    if ( job ) {
      details.uid = job.id;
      details.job = job.obj;
      details.userInfo = job.userInfo;
    }

    logger.debug( "onDone:" + details.id + " is called" );
    this._logDetails( details );
    this.onDone( this._getMessage( details.id ), details );
  };

  /**
   * Called when a job status becomes processing or preparing for some operations( start, cancel, proceed ... )
   * Should be override by a user application.
   *
   * <table>
   * <tr><th>message</th><th>id</th><th>process</th></tr>
   * <tr><td>printer.processing.start</td><td>printer.processind.start</td><td>start</td></tr>
   * <tr><td>printer.processing.cancel</td><td>printer.processing.cancel</td><td>cancel</td></tr>
   * <tr><td>printer.processing.proceed</td><td>printer.processing.proceed</td><td>proceed</td></tr>
   * <tr><td>printer.processing.downloading</td><td>printer.processind.downloading</td><td>downloading</td></tr>
   * <tr><td>printer.pending.printing.REASON \*1</td><td>printer.pending.printing.REASON \*1</td><td>printing</td></tr>
   * <tr><td>printer.processing.printing</td><td>printer.processing.printing</td><td>printing</td></tr>
   * <tr><td>scanner.processing.start</td><td>printer.processing.start</td><td>start</td></tr>
   * <tr><td>scanner.processing.cancel</td><td>scanner.processing.cancel</td><td>cancel</td></tr>
   * <tr><td>scanner.processing.proceed</td><td>scanner.processing.proceed</td><td>proceed</td></tr>
   * <tr><td>scanner.processing.finish</td><td>scanner.processing.finish</td><td>finish</td></tr>
   * <tr><td>scanner.pending.scanning.REASON \*1</td><td>scanner.pending.scanning.REASON \*1</td><td>scanning</td></tr>
   * <tr><td>scanner.pending.filing.REASON \*1</td><td>scanner.pending.filing.REASON \*1</td><td>filing</td></tr>
   * <tr><td>scanner.pending.ocring.REASON \*1</td><td>scanner.pending.ocring.REASON \*1</td><td>ocring</td></tr>
   * <tr><td>scanner.pending.sending.REASON \*1</td><td>scanner.pending.sending.REASON \*1</td><td>sending</td></tr>
   * <tr><td>scanner.processing.scanning</td><td>scanner.processing.scanning</td><td>scanning</td></tr>
   * <tr><td>scanner.processing.filing</td><td>scanner.processing.filing</td><td>filing</td></tr>
   * <tr><td>scanner.processing.ocring</td><td>scanner.processing.ocring</td><td>ocring</td></tr>
   * <tr><td>scanner.processing.sending</td><td>scanner.processing.sending</td><td>sending</td></tr>
   * <tr><td>scanner.processing.uploading</td><td>scanner.processing.uploading</td><td>uploading</td></tr>
   * </table>
   * \*1 REASON means the jobStatusReasons[0]
   *
   * @public
   * @method onProcessing
   * @param {String} msg localized message or message key.
   * @param {Object} details
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
  /* jshint unused:false */
  Device.prototype.onProcessing = function( msg, details ) {};

  /**
   * Called when a job status updates in processing.<br>
   * Should be override by a user application.
   *
   * @public
   * @method onProcessingUpdate
   * @param  {String} msg see {{#crossLink "ricoh.dapi.app.Device/onProcessing:method"}}{{/crossLink}}
   * @param  {Object} details see {{#crossLink "ricoh.dapi.app.Device/onProcessing:method"}}{{/crossLink}}
   */
  /* jshint unused:false */
  Device.prototype.onProcessingUpdate = function( msg, details ) {};

  /**
   * Wrapper method to call onProcessing and onProcessingUpdate.
   *
   * @protected
   * @method _callOnProcessing
   * @param  {Object}             details see {{#crossLink "ricoh.dapi.app.Device/onProcessing:method"}}{{/crossLink}}
   * @param  {ricoh.dapi.app.Job} job job
   */
  Device.prototype._callOnProcessing = function( details, job ) {
    var status = "processing",
        lastStatus = job.status(),
        lastCancelAvailability = job.availability( "cancel" ),
        lastStopAvailability = job.availability( "stop" );

    if ( job.isCancelAccepted() ||
         job.hasFinishedStatus() ) {
      return;
    }

    // update job status
    job.status( status );
    job.process( details.process );

    // create event details
    details.uid = job.id;
    details.job = job.obj;
    details.userInfo = job.userInfo;
    details.cancel = job.availability( "cancel" );
    details.callbacks = {
      cancel: details.cancel ? job.callbacks.cancel : undefined
    };
    if ( this._service === "scanner" ) {
      details.stop = job.availability( "stop" );
      details.callbacks.stop = details.stop ? job.callbacks.stop : undefined;
    }

    if ( lastStatus === job.status() &&
         lastCancelAvailability === job.availability( "cancel" ) &&
         lastStopAvailability === job.availability( "stop" ) ) {
      logger.debug( "onProcessingUpdate:" + details.id + " is called" );
      this._logDetails( details );
      this.onProcessingUpdate( this._getMessage( details.id ), details );
    } else {
      logger.debug( "onProcessing:" + details.id + " is called" );
      this._logDetails( details );
      this.onProcessing( this._getMessage( details.id ), details );
    }
  };

  /**
   * Called when a job status becomes processing_stopped.<br>
   * Should be override by a user application.
   *
   * <table>
   * <tr><th>message</th><th>id</th><th>process</th></tr>
   * <tr><td>printer.processing_stopped.printing</td><td>printer.processind_stopped.printing</td><td>printing</td></tr>
   * <tr><td>scanner.processing_stopped.scanning.REASON \*1</td><td>printer.processind_stopped.scanning.REASON \*1</td><td>scanning</td></tr>
   * <tr><td>scanner.processing_stopped.filing.REASON \*1</td><td>printer.processind_stopped.filing.REASON \*1</td><td>filing</td></tr>
   * <tr><td>scanner.processing_stopped.ocring.REASON \*1</td><td>printer.processind_stopped.ocring.REASON \*1</td><td>ocring</td></tr>
   * <tr><td>scanner.processing_stopped.sending.REASON \*1</td><td>printer.processind_stopped.sending.REASON \*1</td><td>sending</td></tr>
   * </table>
   * \*1 REASON means the jobStatusReasons[0]
   *
   * @public
   * @method onStopped
   * @param {String} msg localized message or message key.
   * @param {Object} details
   *   @param {String}         details.id unique id describing this event
   *   @param {String}         details.process process name of what is stopped
   *   @param {String}         details.uid unique job id
   *   @param {ricoh.dapi.Job} details.job current job
   *   @param {Number}         [details.remainingTime] remaining time
   *   @param {Boolean}        details.cancel whether the job can be canceled
   *   @param {Boolean}        details.proceed whether the job can be proceeded
   *   @param {Boolean}        details.finish whether the job can be finished
   *   @param {Object}         [details.callbacks]
   *     @param {Function}       [details.callbacks.cancel] cancel callback function
   *     @param {Function}       [details.callbacks.proceed] proceed callback function
   *     @param {Function}       [details.callbacks.finish] finish callback function
   *
   */
  /* jshint unused:false */
  Device.prototype.onStopped = function( msg, details ) {};

  /**
   * Called when a job status updates in stopped.<br>
   * Should be override by a user application.
   *
   * @public
   * @method onStoppedUpdate
   * @param  {String} msg see {{#crossLink "ricoh.dapi.app.Device/onStopped:method"}}{{/crossLink}}
   * @param  {Object} details see {{#crossLink "ricoh.dapi.app.Device/onStopped:method"}}{{/crossLink}}
   */
  /* jshint unused:false */
  Device.prototype.onStoppedUpdate = function( msg, details ) {};

  /**
   * Wrapper method to call onStopped and onStoppedUpdate.
   *
   * @protected
   * @method _callOnStopped
   * @param  {Object}             details see {{#crossLink "ricoh.dapi.app.Device/onStopped:method"}}{{/crossLink}}
   * @param  {ricoh.dapi.app.Job} job
   */
  Device.prototype._callOnStopped = function( details, job ) {
    var status = "stopped",
        lastStatus = job.status(),
        lastCancelAvailability = job.availability( "cancel" ),
        lastProceedAvailability = job.availability( "proceed" ),
        lastFinishAvailability = job.availability( "finish" ),
        message;

    if ( job.isCancelAccepted() ||
         job.hasFinishedStatus() ) {
      return;
    }

    // update job status
    job.availability( "proceed", details.proceed );
    job.availability( "finish", details.finish );
    job.status( status );
    job.process( details.process );

    // create event details
    details = details || {};
    details.uid = job.id;
    details.job = job.obj;
    details.userInfo = job.userInfo;
    details.cancel = job.availability( "cancel" );
    details.callbacks = {
      cancel: details.cancel ? job.callbacks.cancel : undefined,
      proceed: details.proceed ? job.callbacks.proceed : undefined,
      finish: details.finish ? job.callbacks.finish : undefined
    };
    if ( ( details.id.indexOf( "wait_for_next_original" ) !== -1 ||
         details.id.indexOf( "wait_for_next_original_and_continue" ) !== -1 ) &&
         !details.remainingTime ) {
      details.id += "_notimeout";
    }

    message = this._getMessage( details.id );
    if ( lastStatus === job.status() &&
         lastCancelAvailability === job.availability( "cancel" ) &&
         lastProceedAvailability === job.availability( "proceed" ) &&
         lastFinishAvailability === job.availability( "finish" ) ) {
      logger.debug( "onStoppedUpdate:" + details.id + " is called" );
      this._logDetails( details );
      this.onStoppedUpdate( message, details );
    } else {
      logger.debug( "onStopped:" + details.id + " is called" );
      this._logDetails( details );
      this.onStopped( message, details );
    }
  };

  /**
   * Called when a job status becomes completed.<br>
   * Should be override by a user application.
   *
   * <table>
   * <tr><th>message</th><th>id</th><th>process</th></tr>
   * <tr><td>printer.completed</td><td>printer.completed</td><td>printer</td></tr>
   * <tr><td>printer.completed.REASON \*1</td><td>printer.completed.REASON \*1</td><td>printer</td></tr>
   * <tr><td>scanner.completed</td><td>scanner.completed</td><td>scanner</td></tr>
   * <tr><td>scanner.completed.REASON \*1</td><td>scanner.completed.REASON \*1</td><td>scanner</td></tr>
   * </table>
   * \*1 REASON means the jobStatusReasons[0]
   *
   * @public
   * @method onCompleted
   * @param  {String} msg localized message or message key.
   * @param  {Object} details
   *   @param {String}         details.id unique id describing this event
   *   @param {String}         details.process process name of what is completed
   *   @param {String}         details.uid unique job id
   *   @param {ricoh.dapi.Job} details.job current job object
   *   @param {Any}            [details.userInfo] user setting info
   */
  /* jshint unused:false */
  Device.prototype.onCompleted = function( msg, details ) {};

  /**
   * Wrapper method to call onCompleted.
   *
   * @protected
   * @method _callOnCompleted
   * @param  {Object}             details see {{#crossLink "ricoh.dapi.app.Device/onCompleted:method"}}{{/crossLink}}
   * @param  {ricoh.dapi.app.Job} job job
   */
  Device.prototype._callOnCompleted = function( details, job ) {
    var status = "completed";

    if ( job.hasFinishedStatus() ) {
      return;
    }
    // update job
    job.status( status );
    job.process( details.process );

    // create event details
    details = details || {};
    details.uid = job.id;
    details.job = job.obj;
    details.userInfo = job.userInfo;

    logger.debug( "onCompleted:" + details.id + " is called" );
    this._logDetails( details );
    this.onCompleted( this._getMessage( details.id ), details );
  };

  /* jshint unused:false */
  /**
   * Called when a job status becomes aborted.<br>
   * Should be override by a user application.
   *
   * <table>
   * <tr><th>message</th><th>id</th><th>process</th></tr>
   * <tr><td>printer.aborted.printing.REASON \*1</td><td>printer.aborted.printing.REASON \*1</td><td>printing</td></tr>
   * <tr><td>printer.aborted.downloading</td><td>printer.aborted.downloading</td><td>downloading</td></tr>
   * <tr><td>printer.canceled.printing.REASON \*1</td><td>printer.canceled.printing.REASON *1</td><td>printing</td></tr>
   * <tr><td>printer.canceled.downloading</td><td>printer.canceled.downloading</td><td>d\ownloading</td></tr>
   * <tr><td>printer.MESSAGE_ID \*2</td><td>printer.MESSAGE_ID \*2</td><td>start</td></tr>
   * <tr><td>scanner.aborted.scanning.REASON \*1</td><td>scanner.aborted.scanning.REASON \*1</td><td>scanning</td></tr>
   * <tr><td>scanner.aborted.filing.REASON \*1</td><td>scanner.aborted.filing.REASON \*1</td><td>filing</td></tr>
   * <tr><td>scanner.aborted.ocring.REASON \*1</td><td>scanner.aborted.ocring.REASON \*1</td><td>ocring</td></tr>
   * <tr><td>scanner.aborted.sending.REASON \*1</td><td>scanner.aborted.sending.REASON \*1</td><td>sending</td></tr>
   * <tr><td>scanner.aborted.uploading</td><td>scanner.aborted.uploading</td><td>uploading</td></tr>
   * <tr><td>scanner.canceled.scanning</td><td>scanner.canceled.scanning</td><td>scanning</td></tr>
   * <tr><td>scanner.canceled.filing</td><td>scanner.canceled.filing</td><td>filing</td></tr>
   * <tr><td>scanner.canceled.ocring</td><td>scanner.canceled.ocring</td><td>ocring</td></tr>
   * <tr><td>scanner.canceled.sending</td><td>scanner.canceled.sending</td><td>sending</td></tr>
   * <tr><td>scanner.canceled.uploading</td><td>scanner.canceled.uploading</td><td>uploading</td></tr>
   * <tr><td>scanner.MESSAGE_ID \*2</td><td>scanner.MESSAGE_ID \*2</td><td>start</td></tr>
   * </table>
   * \*1 REASON means the jobStatusReasons[0]<br>
   * \*2 MESSAGE_ID means the message_id of the top of errors
   *
   * @public
   * @method onAborted
   * @param  {String} meg     localized message or message key.
   * @param  {Object} details
   *   @param {String}         details.id unique id describing this event
   *   @param {String}         details.process process name of what is completed
   *   @param {String}         details.uid unique job id
   *   @param {ricoh.dapi.Job} details.job current job object
   *   @param {Object}         [details.download] set only when process is downloading
   *     @param {String}         [details.download.url] download url
   *     @param {Number}         [details.download.status] status code
   *     @param {String}         [details.download.error] error details
   *   @param {Object}         [details.upload] set only when process is uploading
   *     @param {String}         [details.upload.filename] uploading file name
   *     @param {Number}         [details.upload.status] status code
   *     @param {String}         [details.upload.error] error details
   *     @param {String}         [details.upload.responseBody] response body returned from server for file upload
   *   @param {Any}            [details.userInfo] user setting info
   */
  Device.prototype.onAborted = function( meg, details ) {};

  /**
   * Wrapper method to call onAborted.
   *
   * @protected
   * @method _callOnAborted
   * @param  {Object}             details see {{#crossLink "ricoh.dapi.app.Device/onAborted:method"}}{{/crossLink}}
   * @param  {ricoh.dapi.app.Job} job     job
   */
  Device.prototype._callOnAborted = function( details, job ) {
    var status = "aborted";

    if ( job.hasFinishedStatus() ) {
      return;
    }
    // update job
    job.status( status );
    job.process( "" );

    // create event details
    details = details || {};
    details.uid = job.id;
    details.job = job.obj;
    details.userInfo = job.userInfo;

    logger.debug( "onAborted:" + details.id + " is called" );
    this._logDetails( details );
    this.onAborted( this._getMessage( details.id ), details );
  };

  /**
   * Called when an event to be alerted happens.<br>
   * Should be override by a user application.
   *
   * <table>
   * <tr><th>message</th><th>id</th><th>process</th></tr>
   * <tr><td>printer.error.not_ready</td><td>printer.error.not_ready</td><td>printer</td></tr>
   * <tr><td>printer.error.init_failure</td><td>printer.error.init_failure</td><td>printer</td></tr>
   * <tr><td>printer.not_permitted</td><td>printer.not_permitted</td><td>printer</td></tr>
   * <tr><td>printer.MESSAGE_ID \*1</td><td>printer.MESSAGE_ID \*1</td><td>cancel</td></tr>
   * <tr><td>printer.MESSAGE_ID \*1</td><td>printer.MESSAGE_ID \*1</td><td>proceed</td></tr>
   * <tr><td>scanner.error.not_ready</td><td>scanner.error.not_ready</td><td>scanner</td></tr>
   * <tr><td>scanner.error.init_failure</td><td>scanner.error.init_failure</td><td>scanner</td></tr>
   * <tr><td>scanner.not_permitted</td><td>scanner.not_permitted</td><td>scanner</td></tr>
   * <tr><td>scanner.MESSAGE_ID \*1</td><td>scanner.MESSAGE_ID \*1</td><td>cancel</td></tr>
   * <tr><td>scanner.MESSAGE_ID \*1</td><td>scanner.MESSAGE_ID \*1</td><td>proceed</td></tr>
   * <tr><td>scanner.MESSAGE_ID \*1</td><td>scanner.MESSAGE_ID \*1</td><td>finish</td></tr>
   * </table>
   * \*1 MESSAGE_ID means the message_id of the top of errors
   *
   * @public
   * @method onAlert
   * @param {String} msg localized message or message key
   * @param {Object} details
   *   @param {String}         details.id unique id describing this event
   *   @param {String}         details.process process name of what is completed
   *   @param {String}         details.uid unique job id
   *   @param {ricoh.dapi.Job} details.job current job object
   *   @param {Number}         [details.status] status code
   *   @param {error}          [details.error] error object
   *   @param {Any}            [details.userInfo] user setting info
   */
  /* jshint unused:false */
  Device.prototype.onAlert = function( msg, details ) {};

  /**
   * Wrapper method to call onAlert.
   *
   * @protected
   * @method _callOnAlert
   * @param  {Object}             details see {{#crossLink "ricoh.dapi.app.Device/onAlert:method"}}{{/crossLink}}
   * @param  {ricoh.dapi.app.Job} job job
   */
  Device.prototype._callOnAlert = function( details, job ) {
    details = details || {};
    if ( job ) {
      details.uid = job.id;
      details.job = job.obj;
      details.userInfo = job.userInfo;
    }
    logger.debug( "onAlert:" + details.id + " is called" );
    this._logDetails( details );
    this.onAlert( this._getMessage( details.id ), details );
  };

  /**
   * Called when an event to be norified happens.<br>
   * Should be override by a user application.
   *
   * <table>
   * <tr><th>message</th><th>id</th><th>process</th></tr>
   * <tr><td>printer.completed.printing</td><td>printer.completed.printing</td><td>printing</td></tr>
   * <tr><td>printer.completed.downloading</td><td>printer.completed.downloading</td><td>downloading</td></tr>
   * <tr><td>scanner.completed.scanning</td><td>scanner.completed.scanning</td><td>scanning</td></tr>
   * <tr><td>scanner.completed.filing</td><td>scanner.completed.filing</td><td>filing</td></tr>
   * <tr><td>scanner.completed.ocring</td><td>scanner.completed.ocring</td><td>ocring</td></tr>
   * <tr><td>scanner.completed.sending</td><td>scanner.completed.sending</td><td>sending</td></tr>
   * <tr><td>scanner.completed.uploading</td><td>scanner.completed.uploading</td><td>uploading</td></tr>
   * </table>
   *
   * @public
   * @method onNotify
   * @param  {[type]} msg     localized message or message key
   * @param  {[type]} details details
   *   @param {String}         details.id unique id describing this event
   *   @param {String}         details.process process name of what is completed
   *   @param {String}         details.uid unique job id
   *   @param {ricoh.dapi.Job} details.job current job object
   *   @param {Object}         [details.download] set only when process is downloading
   *     @param {String}         [details.download.url] download url
   *   @param {Object}         [details.upload] set only when process is uploading
   *     @param {String}         [details.upload.filename] uploading file name
   *     @param {Number}         [details.upload.number] the number of upload pages
   *   @param {Any}            [details.userInfo] user setting info
   */
  Device.prototype.onNotify = function( msg, details ) {};

  /**
   * Wrapper method to call onNotify.
   *
   * @protected
   * @method _callOnNotify
   * @param  {Object}             details see {{#crossLink "ricoh.dapi.app.Device/onNotify:method"}}{{/crossLink}}
   * @param  {ricoh.dapi.app.Job} job job
   */
  Device.prototype._callOnNotify = function( details, job ) {
    details = details || {};
    if ( job ) {
      details.uid = job.id;
      details.job = job.obj;
      details.userInfo = job.userInfo;
    }

    logger.debug( "onNotify:" + details.id + " is called" );
    this._logDetails( details );
    this.onNotify( this._getMessage( details.id ), details );
  };

  /**
   * Log details of event function.
   * @protected
   * @method _logDetails
   * @param {Object} details: see each event functions such as onProcessing.
   */
  Device.prototype._logDetails = function( details ) {
    var _details = util.clone( details );
    if ( _details.job ) {
      _details.job = {
        id: _details.job.id,
        status: _details.job.status
      };
    }
    // remove userInfo not to log user's private data.
    if ( _details.userInfo ) {
      _details.userInfo = "FILTERED";
    }
    // remove callbacks. Function objects are not logged and confusing.
    delete _details.callbacks;
    logger.debug( "Summary of details: " + JSON.stringify( _details ) );
  };

  /**
   * Return whether a device is ready.
   *
   * @public
   * @method isReady
   * @return {Boolean}
   */
  Device.prototype.isReady = function() {
    return this._isReady;
  };

  /**
   * Return whether the user is permitted to use a device.
   *
   * @public
   * @method isPermitted
   * @return {Boolean}
   */
  Device.prototype.isPermitted = function() {
    return this._isPermitted;
  };

  /**
   * Return whether init has succeeded.
   *
   * @public
   * @method isInitialized
   * @return {Boolean}
   */
  Device.prototype.isInitialized = function() {
    return this._isInitialized;
  };

  /**
   * Return localized message.<br>
   * Firstly search message by an id, secondary search message again<br />
   * by an id of which replaced "service name(ex. printer, scanner)" with "common".
   *
   * @protected
   * @method _getMessage
   * @param  {String} id message id
   * @return {String}
   */
  Device.prototype._getMessage = function( id ) {
    var word, subId;

    id = I18N_NAMESPACE + ":" + id;

    // search scanner.completed.default instead of scanner.completed.
    word = i18n.t( id + ".default" );
    if ( word !== id + ".default" ) {
      return word;
    }

    word = i18n.t( id );
    if ( word !== id ) {
      return word;
    }

    // replace dapi:common.error.not_ready to dapi:scanner.error.not_ready.
    subId = id.replace( I18N_NAMESPACE + ":" + this._service, I18N_NAMESPACE + ":common" );
    word = i18n.t( subId );
    if ( word !== subId ) {
      return word;
    }
    
    return id;
  };

  /**
   * Return a subprocess name.
   *
   * @protected
   * @method _getProcess
   * @param  {Object} statusObj job status
   * @return {String}
   */
  /* jshint unused:false */
  Device.prototype._getProcess = function( statusObj ) {
    return "";
  };

  /**
   * 
   *
   * @protected
   * @method _getProcessOfMultiProcessJob
   * @param  {Object} statusObj job status
   * @param  {Object} job       set completed process to job object
   * @param  {Array} processes job processes
   * @return {String}
   */
  Device.prototype._getProcessOfMultiProcessJob = function( statusObj, job, processes ) {
    // When job is given, update job._completedProcess.
    // This is for onJobStatusChange. Be care for updating via other method.
    var status,
        process,
        lastCompletedProcess = "",
        i;

    if ( !statusObj ) {
      return "";
    }

    for ( i = 0; i < processes.length; i++ ) {
      process = processes[ i ];
      if ( job && job._completedProcess[ process ] ) {
        // if job is given, skip when this process had been completed.
        lastCompletedProcess = process;
        continue;
      }
      if ( statusObj[ process + "Info" ] ) {
        if( statusObj[ process + "Info" ].jobStatus === "completed" ) {
          if ( job ) {
            // if job is given, set completed process. and return.
            job._completedProcess[ process ] = true;
            return process;
          } else {
            lastCompletedProcess = process;
            continue;
          }
        }

        return process;
      }
    }
    return lastCompletedProcess;
  };

  /**
   * Return an error id.
   *
   * @protected
   * @method _getErrorId
   * @param  {Object} errors
   * @return {String}
   */
  Device.prototype._getErrorId = function( errors ) {
    if ( errors && errors.length > 0 ) {
      return this._service + "." + errors[0].message_id;
    } else {
      return this._service + ".error.unknown";
    }
  };

  /**
   * Return an event id.
   *
   * @protected
   * @method _getEventId
   * @param  {Object} statusObj
   * @return {String}
   */
  Device.prototype._getEventId = function( statusObj ) {
    var id = this._service + "." + statusObj.jobStatus,
        process = this._getProcess( statusObj );
    if ( process !== "" ) {
      id += "." + process;
    }
    if ( statusObj.jobStatusReasons ) {
      id += "." + statusObj.jobStatusReasons[0];
    }
    return id;
  };

  /**
   * Return a callback to cancel a job.
   *
   * @protected
   * @method _cancelCallback
   * @param  {ricoh.dapi.app.Job} job
   * @return {Function} cancel callback
   */
  Device.prototype._cancelCallback = function( job ) {
    var me = this;

    return function() {
      job.isCancelRequested = true;

      switch ( job.process() ) {
      case "printing":
      case "scanning":
      case "preview":
      case "filing":
      case "sending":
        me._jobCancel( job );
        break;

      case "downloading":
        me._downloadCancel( job );
        break;

      case "uploading":
        me._uploadCancel( job );
        break;

      // when process is ocring, start, cancel, proceed and finish,
      // cannot cancel job immediately
      case "":
      case "ocring":
      case "start":
      case "cancel":
      case "proceed":
      case "finish":
        break;

      default:
        break;
      }
    };
  };

  /**
   * Cancel device job.
   *
   * @protected
   * @method _jobCancel
   * @param  {ricoh.dapi.app.Job} job
   */
  Device.prototype._jobCancel = function( job ) {
    var me = this;

    // When the job is finished, job object is deleted in ricoh.dapi.ext.js.
    // So return to prevent from endless retrying to cancel job.
    if ( !job || job.hasFinishedStatus() ) {
      return;
    }

    me._callOnRequesting({
      id: me._service + ".requesting.cancel",
      process: "cancel"
    }, job );

    job.obj.cancel( function( response ) {
      me._callOnDone({
        id: me._service + ".done.cancel",
        process: "cancel"
      }, job );

      if( response && response.errors ) {
        if ( response.errors[0].message_id === "error.cannot_accept_now" ) {
          job.callbacks.cancel();
        } else {
          job.isCancelRequested = false;
          me._callOnAlert({
            id: me._getErrorId( response.errors ),
            process: "cancel",
            status: response.code,
            error: response,
          }, job );
          return;
        }
      }

      job.flagStopCountdown = true;

      me._callOnProcessing({
        id: me._service + ".processing.cancel",
        process: "cancel"
      }, job );
    });
  };

  /**
   * Cancel downloading.
   *
   * @protected
   * @method _downloadCancel
   * @param  {ricoh.dapi.app.Job} job
   */
  Device.prototype._downloadCancel = function( job ) {
    var requestId = job.id;

    this._callOnProcessing({
      id: this._service + ".processing.cancel",
      process: "cancel"
    }, job );

    logger.trace( "ricoh.dapi.net.abort( " + requestId + " ) is called" );
    dapi.net.abort( requestId );
  };

  /**
   * Cancel uploading.
   *
   * @protected
   * @method _uploadCancel
   * @param  {ricoh.dapi.app.Job} job
   */
  Device.prototype._uploadCancel = function( job ) {
    var files = job.upload.files,
        i;

    this._callOnProcessing({
      id: this._service + ".processing.cancel",
      process: "cancel"
    }, job );

    for ( i = 0; i < files.length; i++ ) {
      if ( files[i].status === "uploading" ) {
        logger.trace( "ricoh.dapi.net.abort( " + files[i].id + " ) is called" );
        dapi.net.abort( files[i].id );
      }
      job.upload.fileStatus( files[i].id, "canceling" );
    }
  };

  /**
   * Return a callback to proceed a job.
   *
   * @protected
   * @method _proceedCallback
   * @param  {ricoh.dapi.app.Job} job
   * @return {Function} proceed callback
   */
  Device.prototype._proceedCallback = function( job ) {
    var me = this;

    return function( options ) {
      // Check options. It can be an Event object.
      if ( util.type( options ) !== "Object" || !options.jobSetting ) {
        options = undefined;
      }

      switch ( job.process() ) {
      case "printing":
      case "scanning":
      case "filing":
      case "ocring":
      case "sending":
        break;
      default:
        return;
      }

      me._callOnRequesting({
        id: me._service + ".requesting.proceed",
        process: "proceed"
      }, job );
 
      job.obj.proceed( options, function( response ) {
        me._callOnDone({
          id: me._service + ".done.proceed",
          process: "proceed"
        }, job );
 
        if( response && response.errors ) {
          me._callOnAlert({
            id: me._getErrorId( response.errors ),
            process: "proceed",
            status: response.code,
            error: response
          }, job );
          return;
        }

        job.flagStopCountdown = true;
 
        me._callOnProcessing({
          id: me._service + ".processing.proceed",
          process: "proceed"
        }, job );
      });
    };
  };

  /**
   * Return a callback to finish a scanning process.
   *
   * @protected
   * @method _finishCallback
   * @param  {ricoh.dapi.app.Job} job
   * @return {Function} finish callback
   */
  Device.prototype._finishCallback = function( job ) {
    var me = this;

    return function() {
      if ( job.process() !== "scanning" && job.process() !== "preview" ) {
        return;
      }

      me._callOnRequesting({
        id: me._service + ".requesting.finish",
        process: "finish"
      }, job );
 
      job.obj.finishScanning( function( response ) {
        me._callOnDone({
          id: me._service + ".done.finish",
          process: "finish"
        }, job );
 
        if ( response && response.errors ) {
          me._callOnAlert({
            id: me._getErrorId( response.errors ),
            process: "finish",
            status: response.code,
            error: response
          }, job );
          return;
        }

        job.flagStopCountdown = true;
 
        me._callOnProcessing({
          id: me._service + ".processing.finish",
          process: "finish"
        }, job );
      });
    };
  };

  /**
   * Return onPending callback.
   *
   * @protected
   * @method _onPending
   * @param  {ricoh.dapi.app.Job} job
   * @return {Function} onPending callback
   */
  Device.prototype._onPending = function( job ) {
    var me = this,
        jobObj = job.obj,
        callback = me._userCallbacks ? me._userCallbacks.onPending : undefined;

    return function() {
      if ( callback ) {
        logger.trace( "onPending defined at init is called" );
        callback.apply( jobObj );
      }

      if ( job.hasFinishedStatus() ||
           me._isCanceled( jobObj.status ) ||
           me._isAborted( jobObj.status ) ) {
        return;
      }

      if ( jobObj.status.jobStatusReasons &&
           jobObj.status.jobStatusReasons[0] === "processing_later" ) {
        me._callOnCompleted({
          id: me._service + ".completed.processing_later",
          process: me._service
        }, job );
        me._finish( job );
        return;
      }

      me._callOnProcessing({
        id: me._getEventId( jobObj.status ),
        process: me._getProcess( jobObj.status )
      }, job);
    };
  };

  /**
   * Return onProcessing callback.
   *
   * @protected
   * @method _onProcessing
   * @param  {ricoh.dapi.app.Job} job
   * @return {Function} onProcessing callback
   */
  Device.prototype._onProcessing = function( job ) {
    var me = this,
        jobObj = job.obj,
        callback = me._userCallbacks ? me._userCallbacks.onProcessing : undefined;

    return function() {
      if ( callback ) {
        logger.trace( "onProcessing defined at init is called" );
        callback.apply( jobObj );
      }

      if ( job.hasFinishedStatus() ||
           me._isCanceled( jobObj.status ) ||
           me._isAborted( jobObj.status ) ) {
        return;
      }

      me._callOnProcessing({
        id: me._getEventId( jobObj.status ),
        process: me._getProcess( jobObj.status )
      }, job );
    };
  };

  /**
   * Return onProcessingStopped callback.
   *
   * @protected
   * @method _onProcessingStopped
   * @param  {ricoh.dapi.app.Job} job
   * @return {Function} onProcessingStopped callback
   */
  Device.prototype._onProcessingStopped = function( job ) {
    var me = this,
        jobObj = job.obj,
        callback = me._userCallbacks ? me._userCallbacks.onProcessingStopped : undefined;

    return function( autoRestart, _details ) {
      var id = me._getEventId( jobObj.status ),
          process = id.indexOf( "preview" ) > -1 ? "preview" : me._getProcess( jobObj.status ),
          details,
          remainingTime,
          prop;
 
      if ( callback ) {
        logger.trace( "onProcessingStopped defined at init is called" );
        callback.apply( jobObj, [autoRestart] );
      }

      if ( job.hasFinishedStatus() ) {
        return;
      }

      details = {
        id: id,
        process: process,
        proceed: me._isAbleToProceed( jobObj.status ) && !job.isCancelAccepted(),
        finish: me._isAbleToFinish( jobObj.status ) && !job.isCancelAccepted(),
      };

      if ( _details ) {
        for ( prop in _details ) {
          if ( _details.hasOwnProperty( prop ) ) {
            details[prop] = _details[prop];
          }
        }
      }

      if ( jobObj.status &&
           jobObj.status.scanningInfo &&
           jobObj.status.scanningInfo.remainingTimeOfWaitingNextOriginal ) {
        remainingTime = jobObj.status.scanningInfo.remainingTimeOfWaitingNextOriginal + 1;
      }

      if ( remainingTime ) {
        job.flagStopCountdown = false;

        ( function countdown() {
          remainingTime -= 1;
          details.remainingTime = remainingTime;

          if ( remainingTime < 0 || job.flagStopCountdown === true ) {
            job.flagStopCountdown = false;
            return;
          }

          me._callOnStopped( details, job );

          setTimeout( countdown, 1000 );

          // correct inaccurate remaining time every five seconds
          if ( remainingTime % 5 === 0 ) {
            jobObj.getStatus( function( status, error ) {
              if ( error ) {
                return;
              }

              if ( status &&
                   status.scanningInfo &&
                   status.scanningInfo.remainingTimeOfWaitingNextOriginal ) {
                remainingTime = status.scanningInfo.remainingTimeOfWaitingNextOriginal || 0;
                jobObj.status.scanningInfo.remainingTimeOfWaitingNextOriginal = status.scanningInfo.remainingTimeOfWaitingNextOriginal;
              }
            });
          }
        })();
      } else {
        me._callOnStopped( details, job );
      }
    };
  };

  /**
   * Return onAborted callback.
   *
   * @protected
   * @method _onAborted
   * @param  {ricoh.dapi.app.Job} job
   * @return {Function} onAborted callback
   */
  Device.prototype._onAborted = function( job ) {
    var me = this,
        jobObj = job.obj,
        callback = me._userCallbacks ? me._userCallbacks.onAborted : undefined;

    return function() {
      if ( callback ) {
        logger.trace( "onAborted defined at init is called" );
        callback.apply( jobObj );
      }

      if ( job.hasFinishedStatus() ) {
        return;
      }

      if ( job.isFinished() ) {
        me._callOnAborted({
          id: me._getEventId( jobObj.status ),
          process: me._getProcess( jobObj.status ),
        }, job );
        
        me._finish( job );
      }
    };
  };

  /**
   * Return onCompleted callback
   *
   * @protected
   * @method _onCompleted
   * @param  {ricoh.dapi.app.Job} job
   * @return {Function} onCompleted callback
   */
  Device.prototype._onCompleted = function( job ) {
    var me = this,
        jobObj = job.obj,
        callback = me._userCallbacks ? me._userCallbacks.onCompleted : undefined;

    return function() {
      if ( callback ) {
        logger.trace( "onCompleted defined at init is called" );
        callback.apply( jobObj );
      }

      if ( job.hasFinishedStatus() ) {
        return;
      }

      if ( job.postOnCompleted ) {
        // if user requests to cancel job, stop the post process.
        if ( job.isCancelRequested ) {
          me._callOnAborted({
            id: me._service + ".canceled." + me._getProcess( jobObj.status ),
            process: me._getProcess( jobObj.status )
          }, job );
          me._finish( job );
        } else {
          job.postOnCompleted();
        }
      } else {
        // user requests to cancel job, but job is not canceled.
        if ( job.isCancelRequested ) {
          me._callOnAlert({
            id: me._service + ".error.cancel_failure",
            process: "cancel"
          }, job );
        }

        me._callOnCompleted({
          id: me._service + ".completed",
          process: me._service,
        }, job );
        me._finish( job );
      }
    };
  };

  /**
   * Return onCanceled callback
   *
   * @protected
   * @method _onCanceled
   * @param  {ricoh.dapi.app.Job} job
   * @return {Function} onCanceled callback
   */
  Device.prototype._onCanceled = function( job ) {
    var me = this,
        jobObj = job.obj,
        callback = me._userCallbacks ? me._userCallbacks.onCanceled : undefined;

    return function() {
      if ( callback ) {
        callback.apply( jobObj );
      }

      if ( job.hasFinishedStatus() ) {
        return;
      }

      me._callOnAborted({
        id: me._getEventId( this.status ),
        process: me._getProcess( this.status )
      }, job );

      me._finish( job );
    };
  };

  /**
   * Return onStatusChange callback.
   *
   * @protected
   * @method _onJobStatusChange
   * @param  {ricoh.dapi.app.Job} job
   * @return {Function} onStatusChange callback
   */
  Device.prototype._onJobStatusChange = function( job ) {
    var me = this,
        jobObj = job.obj,
        callback = me._userCallbacks ? me._userCallbacks.onStatusChange : undefined;

    return function() {
      var lastProcess = job.lastProcess,
          process = me._getProcess( jobObj.status, job );

      job.lastProcess = process;
      job.flagStopCountdown = true;

      if ( callback ) {
        logger.trace( "onStatusChange defined at init is called" );
        callback.apply( jobObj );
      }

      if ( job.hasFinishedStatus() ) {
        return;
      }

      // Call onNotify if this process becomes completed.
      if ( job._completedProcess[ process ] ) {
        me._callOnNotify({
          id: me._service + ".completed." + process,
          process: process
        }, job );
      }

      // If jobStatus has not been changed and process is changed, 
      // Device.prototype.onProcessing must be called.
      // But, in such case, _onProcessing is not called,
      // so call _callOnProcessing here.
      if ( lastProcess !== process ) {
        if ( jobObj.lastStatus &&
             ( jobObj.lastStatus.jobStatus === jobObj.status.jobStatus ) ) {
          me._callOnProcessing({
            id: me._service + ".processing." + process,
            process: process
          }, job );
        }
      }
      if ( job.postOnStatusChange ) {
        job.postOnStatusChange();
      }
    };
  };

  /**
   * Return onFileReadCompleted callback.
   *
   * @protected
   * @method _onFileReadCompleted
   * @param  {ricoh.dapi.app.Job} job
   * @return {Function} onFileReadCompleted callback
   */
  Device.prototype._onFileReadCompleted = function( job ) {
    var me = this,
        jobObj = job.obj,
        callback = me._userCallbacks ? me._userCallbacks.onFileReadCompleted : undefined;

    return function() {
      if ( callback ) {
        callback.apply ( jobObj );
      }
    };
  };

  /**
   * Return onPagePrinted callback.
   *
   * @protected
   * @method _onPagePrinted
   * @param  {ricoh.dapi.app.Job} job
   * @return {Function} onPagePrinted callback
   */
  Device.prototype._onPagePrinted = function( job ) {
    var me = this,
        jobObj = job.obj,
        callback = me._userCallbacks ? me._userCallbacks.onPagePrinted : undefined;

    return function( count ) {
      if ( callback ) {
        logger.trace( "onPagePrinted defined at init is called" );
        callback.apply( jobObj, [ count ] );
      }

      if ( job.hasFinishedStatus() ) {
        return;
      }

      if ( jobObj.status.jobStatus === "processing" ) {
        me._callOnProcessing({
          id: me._service + ".processing.printing",
          process: "printing",
          printedCount: count
        }, job );
      }
      else if ( jobObj.status.jobStatus === "processing_stopped" ) {
        jobObj.onProcessingStopped( jobObj._isAutoStart( jobObj.status ), { printedCount: count } );
      }
    };
  };

  /**
   * Return onCopyPrinted callback.
   *
   * @protected
   * @method _onCopyPrinted
   * @param  {ricoh.dapi.app.Job} job
   * @return {Function} onCopyPrinted callback
   */
  Device.prototype._onCopyPrinted = function( job ) {
    var me = this,
        jobObj = job.obj,
        callback = me._userCallbacks ? me._userCallbacks.onCopyPrinted : undefined;

    return function( count ) {
      if ( callback ) {
        logger.trace( "onCopyPrinted defined at init is called" );
        callback.apply( jobObj, [ count ] );
      }

      if ( job.hasFinishedStatus() ) {
        return;
      }

      if( jobObj.status.jobStatus === "processing" ) {
        me._callOnProcessing({
          id: me._service + ".processing.printing",
          process: "printing",
          printedCopies: count,
          cancel: true,
        }, job );
      }
      else if ( jobObj.status.jobStatus === "processing_stopped" ) {
        jobObj.onProcessingStopped( jobObj._isAutoStart( jobObj.status ), { printedCopies: count } );
      }
    };
  };

  /**
   * Return onPageScanned callback.
   *
   * @protected
   * @method _onPageScanned
   * @param  {ricoh.dapi.app.Job} job
   * @return {Function} onPageScanned callback
   */
  Device.prototype._onPageScanned = function( job ) {
    var me = this,
        jobObj = job.obj,
        callback = me._userCallbacks ? me._userCallbacks.onPageScanned : undefined;

    return function( count ) {
      if ( callback ) {
        logger.trace( "onPageScanned defined at init is called" );
        callback.apply( jobObj, [ count ] );
      }

      if ( job.hasFinishedStatus() ) {
        return;
      }

      if ( jobObj.status.jobStatus === "processing" ) {
        me._callOnProcessing({
          id: me._service + ".processing.scanning",
          process: "scanning",
          scannedCount: count
        }, job );
      }
      else if ( jobObj.status.jobStatus === "processing_stopped" ) {
        jobObj.onProcessingStopped( jobObj._isAutoStart( jobObj.status ), { scannedCount: count } );
      }
    };
  };

  /**
   * Return onSent callback.
   *
   * @protected
   * @method _onSent
   * @param  {ricoh.dapi.app.Job} job
   * @return {Function} onSent callback
   */
  Device.prototype._onSent = function( job ) {
    var me = this,
        jobObj = job.obj,
        callback = me._userCallbacks ? me._userCallbacks.onSent : undefined;

    return function( count ) {
      if ( callback ) {
        logger.trace( "onSent defined at init is called" );
        callback.apply( jobObj, [ count ] );
      }

      if ( job.hasFinishedStatus() ) {
        return;
      }

      if ( jobObj.status.jobStatus === "processing" ) {
        me._callOnProcessing({
          id: this._service + ".processing.sending",
          process: "sending",
          sentCount: count
        }, job );
      }
      else if ( jobObj.status.jobStatus === "processing_stopped" ) {
        jobObj.onProcessingStopped( jobObj._isAutoStart( jobObj.status ), { sentCount: count } );
      }
    };
  };

  /**
   * Create job object.
   *
   * @protected
   * @method _createJob
   * @param  {String} service service name
   * @param  {String} id      unique id
   * @return {ricoh.dapi.app.Job}
   */
  Device.prototype._createJob = function( id ) {
    var job = new Job( id, this._service );

    job.callbacks.cancel  = this._cancelCallback( job );
    job.callbacks.proceed = this._proceedCallback( job );

    if ( this._service === "scanner" ) {
      job.callbacks.finish = this._finishCallback( job );
      job.callbacks.stop   = this._stopCallback( job );
    }

    if( this._service === "copy" ) {
      job.callbacks.finish = this._finishCallback( job );
    }

    if ( this._service === "fax" ) {
      job.callbacks.finish = this._finishCallback( job );
    }

    return job;
  };

  /**
   * Create ricoh.dapi.Job object.
   *
   * @protected
   * @method _createDeviceJob
   * @param  {ricoh.dapi.app.Job} job
   * @return {ricoh.dapi.Job}
   */
  Device.prototype._createDeviceJob = function( job ) {
    var jobObj;

    jobObj = job.obj = this._device.createJob();

    jobObj.onPending           = this._onPending( job );
    jobObj.onProcessing        = this._onProcessing( job );
    jobObj.onProcessingStopped = this._onProcessingStopped( job );
    jobObj.onCompleted         = this._onCompleted( job );
    jobObj.onAborted           = this._onAborted( job );
    jobObj.onCanceled          = this._onCanceled( job );
    jobObj.onStatusChange      = this._onJobStatusChange( job );

    switch ( this._service ) {
    case "scanner":
      jobObj.onPageScanned = this._onPageScanned( job );
      jobObj.onSent        = this._onSent( job );
      break;

    case "printer":
      jobObj.onFileReadCompleted = this._onFileReadCompleted( job );
      jobObj.onPagePrinted       = this._onPagePrinted( job );
      break;

    case "copy":
      jobObj.onPageScanned = this._onPageScanned( job );
      jobObj.onCopyPrinted = this._onCopyPrinted( job );
      break;

    case "fax":
      jobObj.onPageScanned = this._onPageScanned( job );
      break;

    default:
      break;
    }

    return jobObj;
  };

  /**
   * Start device job (printing, scanning, ...)
   *
   * @protected
   * @method _startJob
   * @param  {ricoh.dapi.app.Job} job
   */
  Device.prototype._startJob = function( job ) {
    var me = this,
        jobObj = me._createDeviceJob( job ),
        callbacks = me._userCallbacks || {},
        _options;

    me._lockDevice();

    me._callOnRequesting({
      id: me._service + ".requesting.start",
      process: "start",
    }, job );

    _options = ( job.headers ) ? ( [ job.options, job.headers ] ) : ( job.options );
    jobObj.start( _options, function( result ) {
      if ( callbacks.onRequest ) {
        callbacks.onRequest.apply( this, [ result ] );
      }

      me._callOnDone({
        id: me._service + ".done.start",
        process: "start"
      }, job );

      if ( result && result.errors ) {
        me._callOnAborted({
          id: me._getErrorId( result.errors ),
          process: "start",
          status: result.code,
          error: result
        }, job );
        me._finish( job );
        return;
      }

      me._callOnProcessing({
        id: me._service + ".processing.start",
        process: "start"
      }, job );
    });
  };

  /**
   * Post processing method when job is finished.<br>
   * If all jobs have finished, unlock device.
   *
   * @protected
   * @method _finish
   * @param  {ricoh.dapi.app.Job} job
   */
  Device.prototype._finish = function( job ) {
    var me = this,
        i,
        n = me.jobs.length;

    for ( i = 0; i < n; i++ ) {
      if ( me.jobs[i].id === job.id ) {
        me.jobs.splice( i, 1 );
        break;
      }
    }

    if ( this.jobs.length < 1 ) {
      this._unlockDevice();
      this._destroy();
    }
  };

  /**
   * Clean up.
   *
   * @protected
   * @method _destroy
   */
  Device.prototype._destroy = function() {
    this._userCallbacks = null;
  };

  /**
   * Return whether a job is able to be proceeded.
   *
   * @protected
   * @method _isAbleToProceed
   * @param  {Object} statusObj a job status
   * @return {Boolean}
   */
  /* jshint unused:false */
  Device.prototype._isAbleToProceed = function( statusObj ) {
    return true;
  };

  /**
   * Return whether a job is able to be finished scanning.
   * 
   * @protected
   * @method _isAbleToFinish
   * @param  {Object} statusObj a job status
   * @return {Boolean}
   */
  /* jshint unused:false */
  Device.prototype._isAbleToFinish = function( statusObj ) {
    return false;
  };

  /**
   * Return whether a job is canceled.
   *
   * @protected
   * @method _isCanceled
   * @param  {Object} statusObj a job status
   * @return {Boolean}
   */
  Device.prototype._isCanceled = function( statusObj ) {
    if ( statusObj ) {
      if ( statusObj.jobStatus === "canceled" ) {
        return true;
      }
    }

    return false;
  };

  /**
   * Return whether a job is aborted.
   *
   * @protected
   * @method _isAborted
   * @param  {object} statusObj a job status
   * @return {Boolean}
   */
  Device.prototype._isAborted = function( statusObj ) {
    if ( statusObj ) {
      if ( statusObj.jobStatus === "aborted" ) {
        return true;
      }
    }

    return false;
  };

  /**
   * Lock Device.
   *
   * @protected
   * @method _lockDevice
   */
  Device.prototype._lockDevice = function() {
    logger.trace( "ricoh.dapi.setBack_Menu( false ) is called" );
    dapi.setBack_Menu( false );
    logger.trace( "ricoh.dapi.lockPowerMode() is called" );
    dapi.lockPowerMode();
    logger.trace( "ricoh.dapi.auth.lockLogout() is called" );
    dapi.auth.lockLogout();
  };
 
  /**
   * Unlock Device.
   *
   * @protected
   * @method _unlockDevice
   */
  Device.prototype._unlockDevice = function() {
    if ( this._setBackMenu ) {
      logger.trace( "ricoh.dapi.setBack_Menu( true ) is called" );
      dapi.setBack_Menu( true );
    }
    if ( this._unlockPowerMode ) {
      logger.trace( "ricoh.dapi.unlockPowerMode() is called" );
      dapi.unlockPowerMode();
    }
    if ( this._unlockLogout ) {
      logger.trace( "ricoh.dapi.auth.unlockLogout() is called" );
      dapi.auth.unlockLogout();
    }
  };

  /**
   * Printer class.
   *
   * @class Printer
   * @constructor
   * @extends ricoh.dapi.app.Device
   */
  Printer = function() {
    if ( !dapi.printer ) {
      logger.error( "namespace 'ricoh.dapi.printer' is undefined." );
    }
    Device.apply( this, [ dapi.printer, "printer", "PRINTER" ] );
  };

  Printer.prototype = Object.create( Device.prototype );
  Printer.prototype.constructor = Printer;

  /**
   * Post processing method when job is finished.<br>
   * Delete downloaded file.<br>
   * If all jobs have finished, unlock device.
   *
   * @private
   * @method _finish
   * @param  {ricoh.dapi.app.Job} job
   */
  Printer.prototype._finish = function( job ) {
    if ( job &&
         job.options &&
         job.options.filePath ) {
      logger.trace( "ricoh.dapi.net.removeFile( " + job.options.filePath + " ) is called" );
      dapi.net.removeFile( job.options.filePath );
    }
    Device.prototype._finish.apply( this, [ job ] );
  };

  /**
   * Return whether a job is able to be proceeded.<br>
   * Always return false.
   *
   * @private
   * @method  _isAbleToProceed
   * @param  {Object} statusObj a job status
   * @return {Boolean} false
   */
  Printer.prototype._isAbleToProceed = function( statusObj ) {
    return false;
  };

  /**
   * Return whether a job is able to be finished scanning.<br>
   * Always return false.
   * 
   * @private
   * @method _isAbleToFinish
   * @param  {Object} statusObj a job status
   * @return {Boolean}
   */
  /* jshint unused:false */
  Printer.prototype._isAbleToFinish = function( statusObj ) {
    return false;
  };

  /**
   * Return whether a job is canceled.
   *
   * @private
   * @method _isCanceled
   * @param  {Object} statusObj a job status
   * @return {Boolean}
   */
  Printer.prototype._isCanceled = function( statusObj ) {
    if ( statusObj ) {
      if ( statusObj.jobStatus === "canceled" ) {
        return true;
      }

      if ( statusObj.printingInfo && statusObj.printingInfo.jobStatus === "canceled" ) {
        return true;
      }
    }

    return false;
  };

  /**
   * Return whether a job is aborted.
   *
   * @private
   * @method _isCanceled
   * @param  {Object} statusObj a job status
   * @return {Boolean}
   */
  Printer.prototype._isAborted = function( statusObj ) {
    if ( statusObj ) {
      if ( statusObj.jobStatus === "aborted" ) {
        return true;
      }

      if ( statusObj.printingInfo && statusObj.printingInfo.jobStatus === "aborted" ) {
        return true;
      }
    }

    return false;
  };

  /**
   * Return a subprocess name.<br>
   * Always returns "printing."
   *
   * @private
   * @method  _getProcess
   * @return {String} "printing"
   */
  Printer.prototype._getProcess = function() {
    return "printing";
  };

  /**
   * Return an event id.
   *
   * @private
   * @method _getEventId
   * @param  {Object} statusObj
   * @return {String}
   */
  Printer.prototype._getEventId = function( statusObj ) {
    var id = this._service + "." + statusObj.jobStatus,
        process = this._getProcess( statusObj );

    if ( process !== "" ) {
      id += "." + process;
    }

    if ( statusObj.jobStatus === "processing_stopped" &&
         this._device.status &&
         this._device.status.printerStatusReasons ) {
      id += "." + this._device.status.printerStatusReasons[0].printerStatusReason;
    } else if ( statusObj.jobStatusReasons ) {
      id += "." + statusObj.jobStatusReasons[0];
    }

    return id;
  };

  /**
   * Return whether the device is ready to start job.
   *
   * @private
   * @param  {Object}  statusObj
   * @return {Boolean} true, if the device is ready to start job.
   */
  Printer.prototype._isDeviceReady = function( statusObj ) {
    if ( !statusObj ) {
      return false;
    }

    switch ( statusObj[ this._service + "Status" ] ) {
    case "idle":
    case "processing":
      return true;
    default:
      return false;
    }
  };

  /**
   * Return whether the device cannot run a new job because of running job.
   * This is always false on Printer.
   *
   * @protected
   * @param  {Object}  statusObj
   * @return {Boolean} true, if the device is running a job.
   */
  Printer.prototype._isDeviceBusy = function( statusObj ) {
    return false;
  };

  /**
   * Start downloading and printing.<br>
   * For each job, the 'printer' downloads a file from the specified url and then start a print job process.
   *
   * @public
   * @method start
   * @param {String} file file url
   * @param {Object} printOptions print options
   * @param {Object} [downloadOptions] donwload options
   *   @param {Object} [downloadOptions.params]
   *     @param {String} [downloadOptions.params.userName] user name for connecting to the server
   *     @param {String} [downloadOptions.params.userPassword] password for connection to the server
   *   @param {Object}   [downloadOptions.headers] http header in key-value format
   *   @param {Object}   [downloadOptions.query] query parameters in key-value format
   *   @param {Function} [downloadOptions.success] calback called when download succeeds
   *   @param {Function} [downloadOptions.error] callback called when download failes 
   * @param {Any}    [userInfo] value notified when an event occurs
   * @param {Object} [callbacks]
   *   @param {Function} [callbacks.onPending]             see {{#crossLink "ricoh.dapi.Printer/onPending:method"}}{{/crossLink}}
   *   @param {Function} [callbacks.onProcessing]          see {{#crossLink "ricoh.dapi.Printer/onProcessing:method"}}{{/crossLink}}
   *   @param {Function} [callbacks.onProcessingStopped]   see {{#crossLink "ricoh.dapi.Printer/onProcessingStopped:method"}}{{/crossLink}}
   *   @param {Function} [callbacks.onCompleted]           see {{#crossLink "ricoh.dapi.Printer/onCompleted:method"}}{{/crossLink}}
   *   @param {Function} [callbacks.onCanceled]            see {{#crossLink "ricoh.dapi.Printer/onCanceled:method"}}{{/crossLink}}
   *   @param {Function} [callbacks.onAborted]             see {{#crossLink "ricoh.dapi.Printer/onAborted:method"}}{{/crossLink}}
   *   @param {Function} [callbacks.onFileReadCompleted]   see {{#crossLink "ricoh.dapi.Printer/onFileReadCompleted:method"}}{{/crossLink}}
   *   @param {Function} [callbacks.onPagePrinted]         see {{#crossLink "ricoh.dapi.Printer/onPagePrinted:method"}}{{/crossLink}}
   *   @param {Function} [callbacks.onRequest]             called when the request to create a printer job is completed
   *   @param {Function} [callbacks.onDownloadStateChange] called when dapi.net.onDownloadStateChange occurs
   */
  Printer.prototype.start = function() {
    var me = this,
        options,
        i,
        id,
        option,
        job,
        downloadOptions,
        hasDownloadJob = false;

    if ( !me.isInitialized() ) {
      me._callOnAlert({
        id: me._service + ".error.not_initialized",
        process: me._service
      });
      return;
    } else if ( !me.isPermitted() ) {
      me._callOnAlert({
        id: me._service + ".error.not_permitted",
        process: me._service
      });
      return;
    } else if ( !me.isReady() ) {
      me._callOnAlert({
        id: me._service + ".error.not_ready",
        process: me._service
      });
      return;
    }

    if ( util.is( arguments[0], "String" ) ) {
      options = [
        {
          file: arguments[0],
          printOptions: util.clone( arguments[1] ),
          downloadOptions: util.clone( arguments[2] ),
          userInfo: util.clone( arguments[3] )
        }
      ];
      me._userCallbacks = arguments[4] || {};
    } else if ( util.is( arguments[0], "Object" ) ) {
      options = [
        {
          printOptions: util.clone( arguments[0] ),
          userInfo: util.clone( arguments[1] )
        }
      ];
      me._userCallbacks = arguments[2] || {};
    } else if ( util.is( arguments[0], "Array" ) ) {
      options = util.clone( arguments[0] );
      me._userCallbacks = arguments[1] || {};
    } else {
      return;
    }

    for ( i = 0; i < options.length; i++ ) {
      id = util.createRandomString();
      option = options[i];

      job = me._createJob( id );
      job.options = option.printOptions;
      job.userInfo = option.userInfo;
      me.jobs.push( job );

      if ( option.file ) {
        if ( !hasDownloadJob ) {
          // Execute common tasks for download jobs only once.
          me._lockDevice();
          dapi.net.onDownloadStateChange = me._onDownloadStateChange();
          hasDownloadJob = true;
        }
        job.download.options = option.downloadOptions;
        job.download.url = option.file;
        downloadOptions = util.clone( option.downloadOptions );
        if ( downloadOptions ) {
          // remove callback functions. ricoh.dapi.net.download does not use them.
          delete downloadOptions.success;
          delete downloadOptions.error;
        }
        
        logger.trace( "ricoh.dapi.net.download is called with " + JSON.stringify({
          requestId: id,
          url: option.file,
          options: "FILTERED"
        }));
        dapi.net.download( id, option.file, downloadOptions );
      } else {
        me._startJob( job );
      }
    }
  };

  /**
   * Return function called when dapi.net.onDownloadStateChange occurs.
   *
   * @private
   * @method _onDownloadStateChange
   * @return {Function}
   */
  Printer.prototype._onDownloadStateChange = function() {
    var me = this;

    return function( requestId, state, result, status, error, progress ) {
      var i,
          jobs = me.jobs,
          job,
          eventId;

      logger.trace( "ricoh.dapi.net.onDownloadStateChange is called with " + JSON.stringify({
        requestId: requestId,
        state: state,
        result: result,
        status: status,
        error: error,
        progress: progress
      }));

      if ( me._userCallbacks && me._userCallbacks.onDownloadStateChange ) {
        logger.trace( "onDownloadStateChange defined at init is called" );
        me._userCallbacks.onDownloadStateChange( requestId, state, result, status, error, progress );
      }

      for ( i = 0; i < jobs.length; i++ ) {
        if ( jobs[i].id === requestId ) {
          job = jobs[i];
          break;
        }
      }

      if ( !job ) {
        return;
      }

      switch ( state ) {
      case "downloading":
        me._callOnProcessing({
          id: "printer.processing.downloading",
          process: "downloading",
          download: {
            url: job.download.url,
            progress: progress
          }
        }, job );
        break;

      case "success":
        if ( job.download.options && job.download.options.success ) {
          logger.trace( "success( " + result + " ) defined at start is called");
          job.download.options.success( result );
        }

        me._callOnNotify({
          id: "printer.completed.downloading",
          process: "downloading",
          download: {
            url: job.download.url
          }
        }, job );

        // if user requests to cancel downloading, but download is successfully completed,
        // stop starting print job
        if ( job.isCancelRequested && !job.hasFinishedStatus() ) {
          me._callOnAborted({
            id: "printer.canceled.downloading",
            process: "downloading",
            download: {
              url: job.download.url
            }
          }, job );
          me._finish( job );
          return;
        }

        job.options.filePath = result;
        me._startJob( job );
        break;

      case "failure":
        if ( job.download.options && job.download.options.error ) {
          logger.trace( "error( " + status + ", " + error + " ) defined at start is called" );
          job.download.options.error( status, error );
        }

        me._callOnAborted({
          id: error === "UserAborted" ? "printer.canceled.downloading" : "printer.aborted.downloading",
          process: "downloading",
          download: {
            url: job.download.url,
            status: error === "UserAborted" ? undefined : status,
            error: error === "UserAborted" ? undefined : error
          }
        }, job );

        me._finish( job );
        break;

      default:
        break;
      }
    };
  };


  /**
   * Scanner class.
   *
   * @class Scanner
   * @constructor
   * @extends ricoh.dapi.app.Device
   */
  Scanner = function() {
    if ( !dapi.scanner ) {
      logger.error( "namespace 'ricoh.dapi.scanner' is undefined." );
    }
    Device.apply( this, [ dapi.scanner, "scanner", "SCANNER" ] );
  };

  Scanner.prototype = Object.create( Device.prototype );
  Scanner.prototype.constructor = Scanner;

  /**
   * Post processing method when job is finished.<br>
   * Delete scanned files.<br>
   * If all jobs have finished, unlock device.
   *
   * @private
   * @method _finish
   * @param  {ricoh.dapi.app.Job} job
   */
  Scanner.prototype._finish = function( job ) {
    if ( job.obj && job.obj.status && job.obj.status.jobStatus === "completed" ) {
      if ( job.upload && job.upload.files && job.upload.files.length !== 0 ) {
        logger.trace( "ScannerJob.fileDelete() is called." );
        job.obj.fileDelete();
      }
    }
    Device.prototype._finish.apply( this, [ job ] );
  };

  /**
   * Cancel device job.<br>
   * And cancel upload if upload has been started.
   * 
   * @private
   * @method _jobCancel
   * @param  {ricoh.dapi.app.Job} job
   */
  Scanner.prototype._jobCancel = function( job ) {
    Device.prototype._jobCancel.apply( this, [ job ] );
    if ( job.upload && job.upload.files.length !== 0 ) {
      this._uploadCancel( job );
    }
  };

  /**
   * Return whether a job is able to be proceeded.<br>
   * Proceedable job has the following reasons.
   *
   * <ul>
   * <li>scanner_jam</li>
   * <li>wait_for_next_original_and_continue</li>
   * <li>cannot_detect_original_size</li>
   * <li>exceeded_max_data_capacity</li>
   * <li>not_suitable_original_orientation</li>
   * <li>too_small_scan_size</li>
   * <li>too_large_scan_size</li>
   * <li>user_request</li>
   * </ul>
   *
   * @private
   * @method _isAbleToProceed
   * @param  {Object} statusObj
   * @return {Boolean}
   */
  Scanner.prototype._isAbleToProceed = function( statusObj ) {
    var i, max, reasons = statusObj.jobStatusReasons;
    if ( reasons && reasons.length > 0 ) {
      for ( i = 0, max = reasons.length; i < max; i++ ) {
        switch( reasons[i] ) {
        case "scanner_jam":
        case "wait_for_next_original_and_continue":
        case "cannot_detect_original_size":
        case "exceeded_max_data_capacity":
        case "not_suitable_original_orientation":
        case "too_small_scan_size":
        case "too_large_scan_size":
        case "user_request":
          break;
        default:
          return false;
        }
      }
      return true;
    } else {
      return false;
    }
  };

  /**
   * Return whether a job is able to be finished scanning.<br>
   * When scannedCount is 0, that job is not finishable.
   * Other reasons why a job is not finishable are followings.
   *
   * <ul>
   * <li>user_request</li>
   * </ul>
   * 
   * @private
   * @method _isAbleToFinish
   * @param  {Object} statusObj
   * @return {Boolean}
   */
  Scanner.prototype._isAbleToFinish = function( statusObj ) {
    var i, max, reasons;
    if ( statusObj.scanningInfo && statusObj.scanningInfo.scannedCount === 0 ) {
      return false;
    }

    reasons = statusObj.jobStatusReasons;
    if ( reasons && reasons.length > 0 ) {
      for ( i = 0, max = reasons.length; i < max; i++ ) {
        switch ( reasons[i] ) {
        case "user_request":
          return false;
        }
      }
      return true;
    } else {
      return false;
    }
  };

  /**
   * Return whether a job is canceled.
   *
   * @private
   * @method _isCanceled
   * @param  {Object} statusObj
   * @return {Boolean}
   */
  Scanner.prototype._isCanceled = function( statusObj ) {
    if ( statusObj ) {
      if ( statusObj.jobStatus === "canceled" ) {
        return true;
      }

      if ( statusObj.scanningInfo && statusObj.scanningInfo.jobStatus === "canceled" ) {
        return true;
      }

      if ( statusObj.filingInfo && statusObj.filingInfo.jobStatus === "canceled" ) {
        return true;
      }

      if ( statusObj.ocringInfo && statusObj.ocringInfo.jobStatus === "canceled" ) {
        return true;
      }

      if ( statusObj.sendingInfo && statusObj.sendingInfo.jobStatus === "canceled" ) {
        return true;
      }
    }

    return false;
  };

  /**
   * Return whether onProcessingUploading can be called.
   *
   * @private
   * @method _isAbleToCallOnProcessingUploading
   * @param  {Object} job
   * @return {Boolean}
   */
  Scanner.prototype._isAbleToCallOnProcessingUploading = function( job ) {
    return job.obj.status && job.obj.status.jobStatus === "completed";
  };

  /**
   * Return whether a job is aborted.
   *
   * @private
   * @method _isAborted
   * @param  {Object} statusObj
   * @return {Boolean}
   */
  Scanner.prototype._isAborted = function( statusObj ) {
    if ( statusObj ) {
      if ( statusObj.jobStatus === "aborted" ) {
        return true;
      }

      if ( statusObj.scanningInfo && statusObj.scanningInfo.jobStatus === "aborted" ) {
        return true;
      }

      if ( statusObj.filingInfo && statusObj.filingInfo.jobStatus === "aborted" ) {
        return true;
      }

      if ( statusObj.ocringInfo && statusObj.ocringInfo.jobStatus === "aborted" ) {
        return true;
      }

      if ( statusObj.sendingInfo && statusObj.sendingInfo.jobStatus === "aborted" ) {
        return true;
      }
    }

    return false;
  };

  /**
   * Return a callback to stop a scanning process.
   *
   * @protected
   * @method _stopCallback
   * @param  {ricoh.dapi.app.Job} job
   * @return {Function} stop callback
   */
  Scanner.prototype._stopCallback = function( job ) {
    var me = this;

    return function() {
      if ( job.process() !== "scanning" ) {
        return;
      }

      me._callOnRequesting({
        id: me._service + ".requesting.stop",
        process: "stop"
      }, job );
 
      job.obj.stopScanning( function( response ) {
        me._callOnDone({
          id: me._service + ".done.stop",
          process: "stop"
        }, job );
 
        if ( response && response.errors ) {
          me._callOnAlert({
            id: me._getErrorId( response.errors ),
            process: "stop",
            status: response.code,
            error: response
          }, job );
          return;
        }

        job.flagStopCountdown = true;
 
        me._callOnProcessing({
          id: me._service + ".processing.stop",
          process: "stop"
        }, job );
      });
    };
  };

  /**
   * Start scanning.
   *
   * @method start
   * @param {Object}  scanOptions scan options
   * @param {Object}  uploadOptions upload options
   *   @param {String}  uploadOptions.url upload url
   *   @param {Object}  [uploadOptions.headers] http header in key-value format
   *   @param {Object}  [uploadOptions.body] http body in key-value format
   *   @param {Object}  [uploadOptions.params]
   *     @param {String}          [uploadOptions.params.userName] user name for connecting to the server
   *     @param {String}          [uploadOptions.params.userPassword] password for connecting to the server
   *     @param {String|Function} [uploadOptions.params.fileName] local file name
   *     @param {String}          [uploadOptions.params.filepartName=upfile] name of the filepart in a multipart form
   *     @param {Boolean}         [uploadOptions.params.chunkedStreaming] whether or not to use chunked transfer
   *   @param {Boolean}  [uploadOptions.concurrent] whether or not to upload scanned pages while scanning other pages
   *   @param {Function} [uploadOptions.success] callback called when upload scceeds
   *   @param {Function} [uploadOptions.error] callback called when upload fails
   * @param {Any}    [userInfo] value notified when an event occurs
   * @param {Object} [callbacks]
   *   @param {Function} [callbacks.onPending]             see {{#crossLink "ricoh.dapi.Scanner/onPending:method"}}{{/crossLink}}
   *   @param {Function} [callbacks.onProcessing]          see {{#crossLink "ricoh.dapi.Scanner/onProcessing:method"}}{{/crossLink}}
   *   @param {Function} [callbacks.onProcessingStopped]   see {{#crossLink "ricoh.dapi.Scanner/onProcessingStopped:method"}}{{/crossLink}}
   *   @param {Function} [callbacks.onCompleted]           see {{#crossLink "ricoh.dapi.Scanner/onCompleted:method"}}{{/crossLink}}
   *   @param {Function} [callbacks.onCanceled]            see {{#crossLink "ricoh.dapi.Scanner/onCanceled:method"}}{{/crossLink}}
   *   @param {Function} [callbacks.onAborted]             see {{#crossLink "ricoh.dapi.Scanner/onAborted:method"}}{{/crossLink}}
   *   @param {Function} [callbacks.onPageScanned]         see {{#crossLink "ricoh.dapi.Scanner/onPageScanned:method"}}{{/crossLink}}
   *   @param {Function} [callbacks.onSent]                see {{#crossLink "ricoh.dapi.Scanner/onSent:method"}}{{/crossLink}}
   *   @param {Function} [callbacks.onRequest]             called when the request to create a scanner job is completed
   *   @param {Function} [callbacks.onUploadStateChange]   called when dapi.net.onUploadStateChange occurs
   */
  Scanner.prototype.start = function( _scanOptions, _uploadOptions, _userInfo, _callbacks ) {
    var me = this,
        options = util.clone( _scanOptions ),
        callbacks = util.clone( _callbacks ),
        job;

    if ( !me.isInitialized() ) {
      me._callOnAlert({
        id: me._service + ".error.not_initialized",
        process: me._service
      });
      return;
    } else if ( !me.isPermitted() ) {
      me._callOnAlert({
        id: me._service + ".error.not_permitted",
        process: me._service
      });
      return;
    } else if ( !me.isReady() ) {
      me._callOnAlert({
        id: me._service + ".error.not_ready",
        process: me._service
      });
      return;
    }

    me._userCallbacks = callbacks || {};

    job = me._createJob( util.createRandomString() );
    if ( util.is( options, "Array" ) ) {
      job.options = options[0];
      job.headers = options[1];
    }
    else {
      job.options = options;
    }
    job.userInfo = util.clone( _userInfo );
    me.jobs.push( job );

    // If upload options is set.
    if ( _uploadOptions &&
         job.options &&
         job.options.jobSetting &&
         job.options.jobSetting.jobMode === "scan_and_store_temporary" ) {
      job.upload.options = util.clone( _uploadOptions );

      // event handler
      dapi.net.onUploadStateChange = me._onUploadStateChange();
      
      // upload scanned files after scanning
      job.postOnCompleted = function() {
        me._sendScannedFiles( this );
      };

      // If this job is single page format, each scanned page is uploaded right after filing the page.
      if ( !job.isMultiPageFormat() && job.upload.options.concurrent ) {
        job.postOnStatusChange = function() {
          if ( !job.isCancelRequested &&
               job.obj &&
               job.obj.status &&
               job.obj.status.jobStatus !== "aborted" &&
               job.obj.status.jobStatus !== "canceled" ) {
            me._sendScannedFiles( this, true );
          }
        };
      }
    }

    me._startJob( job );
  };

  /**
   * Upload scanned files.
   *
   * @private
   * @method _sendScannedFiles
   * @param  {ricoh.dapi.app.Job} job
   * @param  {Boolean} isPrallel : upload while scanning following pages.
   */
  Scanner.prototype._sendScannedFiles = function( job, isConcurrent ) {
    var me = this,
        status,
        fileNum,
        file,
        i;

    if ( job.isFinished() ) {
      // Concurrent upload and called after job.onCompleted,
      // then, all files may already has been uploaded at job.onStatusChange.
      if ( isConcurrent ) {
        return;
      }
      if ( job.upload.hasErrorFile() || job.upload.hasCanceledFile() ) {
        me._callOnAborted({
          id: job.upload.hasErrorFile() ? "scanner.aborted.uploading" : "scanner.canceled.uploading",
          process: "uploading"
        }, job );
        me._finish( job );
      } else {
        me._callOnCompleted({
          id: me._service + ".completed",
          process: me._service,
        }, job );
        me._finish( job );
        return;
      }
    }

    if ( !job.obj.status ) {
      return;
    }
    status = job.obj.status;

    if ( isConcurrent ) {
      if ( job.isMultiPageFormat() ||
           !status.filingInfo ||
           !status.filingInfo.filedPageCount ||
           status.filingInfo.filedPageCount <= 1 ) {
        return;
      }
    }
    fileNum = job.isMultiPageFormat() ? 1 : status.filingInfo.filedPageCount;

    // Return if no files are added
    if ( job.upload.files.length >= fileNum ) {
      return;
    }
    if ( me._isAbleToCallOnProcessingUploading( job ) ) {
      me._callOnProcessing({
        id: "scanner.processing.uploading",
        process: "uploading",
        upload: {
          progress: fileNum === 1 ? 0 : job.upload.finishedCount,
          number: fileNum
        }
      }, job );
    }
    for( i = job.upload.files.length; i < fileNum; i++) {
      file = job.upload.addFile( i + 1 );
      me._sendFile( job, file );
    }
  };

  /**
   * Upload a file.
   *
   * @private
   * @method _sendFile
   * @param  {ricoh.dapi.app.Job} job
   * @param  {Object} file
   */
  Scanner.prototype._sendFile = function( job, file ) {
    var me = this;

    job.obj.file( file.page, "filePath", function( fileInfo, error ) {
      var options,
          eventId,
          process,
          fileNum = job.upload.files.length;

      if ( error ) {
        logger.error( "scannerJob#file( " + file.page + " ) was failed." );
        job.upload.fileStatus( file.id, "error" );

        if ( job.isFinished() ) {
          me._callOnAborted({
            id: "scanner.aborted.uploading",
            process: "uploading"
          }, job );
          me._finish( job );
        } else {
          // if failed to upload a file, cancel to upload the remaining files.
          job.callbacks.cancel();
        }
        return;
      }

      if ( job.isCancelRequested ) {
        job.upload.fileStatus( file.id, "canceled" );

        if ( job.isFinished() ) {
          if ( me._isAborted( job.obj.status ) ) {
            process = me._getProcess( job.obj.status );
            eventId = "scanner.aborted.";
          } else if ( me._isCanceled( job.obj.status ) ) {
            process = me._getProcess( job.obj.status );
            eventId = "scanner.canceled.";
          } else if ( job.upload.hasErrorFile() ) {
            process = "uploading";
            eventId = "scanner.aborted.";
          } else {
            process = "uploading";
            eventId = "scanner.canceled.";
          }
          eventId += process;
          me._callOnAborted({
            id: eventId,
            process: process
          }, job );
          me._finish( job );
        }
        return;
      }

      options = me._createUploadOptions( job, file, fileInfo.result );

      logger.trace( "ricoh.dapi.net.upload is called with " + JSON.stringify({
        requestId: file.id,
        url: job.upload.options.url,
        filePath: fileInfo.result,
        options: "FILTERED"
      }));
      dapi.net.upload( file.id, job.upload.options.url, fileInfo.result, options );

      job.upload.fileStatus( file.id, "uploading" );
      if ( me._isAbleToCallOnProcessingUploading( job ) ) {
        me._callOnProcessing({
          id: "scanner.processing.uploading",
          process: "uploading",
          upload: {
            filename: options.params.fileName,
            progress: fileNum === 1 ? 0 : job.upload.finishedCount,
            number: fileNum
          }
        }, job );
      }
    });
  };

  /**
   * Create file name.
   *
   * @private
   * @method _createFileName
   * @param  {String} id              id
   * @param  {Number} page            page number
   * @param  {Number} fileNum         the number of all files
   * @param  {String} scannedFilePath the path of scanned file
   * @return {String}                 file name
   */
  Scanner.prototype._createFileName = function( id, page, fileNum, scannedFilePath ) {
    var fileName = id;

    if ( fileNum !== 1 ) {
      fileName += "-" + page;
    }

    if ( scannedFilePath && scannedFilePath.indexOf( "." ) !== -1 ) {
      fileName += "." + scannedFilePath.split( "." ).slice( -1 )[0];
    }

    return fileName;
  };

  /**
   * Create upload options.
   *
   * @private
   * @method _createUploadOptions
   * @param  {ricoh.dapi.app.Job} job
   * @param  {Object} file
   * @param  {String} scannedFilePath
   * @return {Object} upload options
   */
  Scanner.prototype._createUploadOptions = function( job, file, scannedFilePath ) {
    var options,
        fileName,
        userOptions = util.clone( job.upload.options );

    options = {
      params: {}
    };

    if ( userOptions ) {
      if ( userOptions.headers ) {
        options.headers = userOptions.headers;
      }

      if ( userOptions.body ) {
        options.body = userOptions.body;
      }

      if ( userOptions.params ) {
        options.params = userOptions.params;

        switch ( util.type( userOptions.params.fileName ) ) {
        case "String":
          fileName = replacePageNumber( userOptions.params.fileName, file.page );
          break;

        case "Function":
          fileName = userOptions.params.fileName.apply( this, [ job.obj, scannedFilePath, job.upload.files.length === 1 ? undefined : file.page ] );
          break;

        default:
          break;
        }
      }
    }

    if ( !fileName ) {
      fileName = this._createFileName( job.obj.id, file.page, job.upload.files.length, scannedFilePath );
    }

    options.params.fileName = fileName;
    file.name = fileName;

    return options;
  };

  /**
   * Return function called when dapi.net.onUploadStateChange occurs.
   *
   * @private
   * @method _onUploadStateChange
   * @return {Function}
   */
  Scanner.prototype._onUploadStateChange = function() {
    var me = this,
        jobs = me.jobs;

    return function( requestId, state, result, status, error, progress, responseBody ) {
      var i, j,
          job,
          files,
          file,
          filenames = [];

      logger.trace( "ricoh.dapi.net.onUploadStateChange is called with " + JSON.stringify({
        requestId: requestId,
        state: state,
        result: result,
        status: status,
        error: error,
        progress: progress
      }));

      if ( me._userCallbacks && me._userCallbacks.onUploadStateChange ) {
        logger.trace( "onUploadStateChange is called" );
        me._userCallbacks.onUploadStateChange(
          requestId,
          state,
          result,
          status,
          error,
          progress,
          responseBody
        );
      }

      // Search a job and a file which have the requestId.
      for ( i = 0; i < jobs.length; i++ ) {
        for ( j = 0; j < jobs[i].upload.files.length; j++ ) {
          if ( jobs[i].upload.files[j].id === requestId ) {
            job = jobs[i];
            files = job.upload.files;
            file = files[j];
            break;
          }
        }
      }

      if ( !file ) {
        return;
      }

      switch ( state ) {
      case "uploading":
        if ( job.upload.fileStatus( requestId ) === "canceling" ) {
          logger.trace( "ricoh.dapi.net.abort( " + requestId + " ) is called" );
          dapi.net.abort( requestId );
        }

        // Call onProcessingUpdate if scanning is finished.
        if ( me._isAbleToCallOnProcessingUploading( job ) ) {
          me._callOnProcessing({
            id: "scanner.processing.uploading",
            process: "uploading",
            upload: {
              filename: file.name,
              progress: files.length === 1 ? progress : job.upload.finishedCount,
              number: files.length
            }
          }, job );
        }
        break;

      case "success":
        if ( job.upload.options.success ) {
          logger.trace( "success( " + result + ", " + responseBody + " ) defined at start is called." );
          job.upload.options.success( result, responseBody );
        }

        job.upload.fileStatus( requestId, "success" );

        if ( job.isFinished() ) {
          if ( job.upload.hasErrorFile() || job.upload.hasCanceledFile() ) {
            me._callOnAborted({
              id: job.upload.hasErrorFile() ? "scanner.aborted.uploading" : "scanner.canceled.uploading",
              process: "uploading"
            }, job );
            me._finish( job );
          } else {
            for ( i = 0; i < files.length; i++ ) {
              filenames.push( files[i].name );
            }

            me._callOnNotify({
              id: me._service + ".completed.uploading",
              process: "uploading",
              upload: {
                filename: files.length === 1 ? file.name : filenames,
                progress: files.length,
                number: files.length
              }
            }, job );

            if ( job.isCancelRequested ) {
              me._callOnAlert({
                id: me._service + ".error.cancel_failure",
                process: "cancel"
              }, job );
            }

            me._callOnCompleted({
              id: me._service + ".completed",
              process: me._service,
            }, job );
          }
          me._finish( job );
        } else {
          // Call onProcessingUpdate if scanning has been finished.
          if ( me._isAbleToCallOnProcessingUploading( job ) ) {
            me._callOnProcessing({
              id: "scanner.processing.uploading",
              process: "uploading",
              upload: {
                filename: file.name,
                progress: job.upload.finishedCount,
                number: files.length
              }
            }, job );
          }
          // Call onNotify to inform of completing one file at concurrent uploading.
          me._callOnNotify({
            id: "scanner.processing.uploading",
            process: "uploading",
            upload: {
              filename: file.name,
              progress: job.upload.finishedCount,
              number: files.length
            }
          }, job );
        }
        break;
      
      case "failure":
        logger.trace( "upload failure: " + JSON.stringify({
          requestId: requestId,
          status: status,
          error: error,
          progress: progress,
          responseBody: responseBody
        }));

        if ( job.upload.options.error ) {
          logger.trace( "error( " + status + ", " + error + " ) defined at start is called." );
          job.upload.options.error( status, error );
        }

        if ( error === "UserAborted" ) {
          job.upload.fileStatus( requestId, "canceled" );
        } else {
          job.upload.fileStatus( requestId, "error" );
        }

        if ( job.isFinished() ) {
          me._callOnAborted({
            id: job.upload.hasErrorFile() ? "scanner.aborted.uploading" : "scanner.canceled.uploading",
            process: "uploading",
            upload: {
              filename: file.name,
              status: status,
              error: error,
              responseBody: responseBody
            }
          }, job );
          me._finish( job );
        } else {
          // if failed to upload a file, cancel to upload the remaining files.
          job.callbacks.cancel();
        }
        break;
      }
    };
  };

  /**
   * Return a subprocess name.
   *
   * @private
   * @method _getProcess
   * @param  {Object} statusObj job status
   * @param  {Object} job       set completed process to job object
   * @return {String} 
   */
  Scanner.prototype._getProcess = function( statusObj, job ) {
    var processes = [ "scanning", "filing", "ocring", "sending"];
    return this._getProcessOfMultiProcessJob( statusObj, job, processes );
  };

  /**
   * Copy class.
   *
   * @class Copy
   * @constructor
   * @extends ricoh.dapi.app.Device
   */
  Copy = function() {
    if ( !dapi.copy ) {
      logger.error( "namespace 'ricoh.dapi.copy' is undefined." );
    }
    Device.apply( this, [ dapi.copy, "copy", "COPIER" ] );
  };

  Copy.prototype = Object.create( Device.prototype );
  Copy.prototype.constructor = Copy;

  /**
   * Return whether a job is able to be proceeded.<br>
   * Other reasons why a job is not proceedable are followings.
   *
   * <ul>
   * <li>wait_for_next_original</li>
   * <li>memory_over</li>
   * <li>plotter_jam</li>
   * <li>no_paper</li>
   * <li>original_set_error</li>
   * <li>no_toner</li>
   * <li>other_unit_error</li>
   * <li>plotter_cover_open</li>
   * <li>marker_waste_full</li>
   * <li>memory_over_auto_restart</li>
   * <li>charge_unit_limit</li>
   * </ul>
   *
   * @private
   * @method _isAbleToProceed
   * @param  {Object} statusObj
   * @return {Boolean}
   */
  Copy.prototype._isAbleToProceed = function( statusObj ) {
    var i, max, reasons = statusObj.jobStatusReasons;
    if ( reasons && reasons.length > 0 ) {
      for ( i = 0, max = reasons.length; i < max; i++ ) {
        switch( reasons[i] ) {
        case "wait_for_next_original":
        case "memory_over":
        case "plotter_jam":
        case "no_paper":
        case "original_set_error":
        case "no_toner":
        case "other_unit_error":
        case "plotter_cover_open":
        case "marker_waste_full":
        case "memory_over_auto_restart":
        case "charge_unit_limit":
          return false;
        }
      }
      return true;
    } else {
      return false;
    }
  };

  /**
   * Return whether a job is able to be finished scanning.<br>
   * When scannedCount is 0, that job is not finishable.
   * Finishable job has the following reasons.
   * 
   * <ul>
   * <li>wait_for_next_original</li>
   * <li>wait_for_next_original_and_continue</li>
   * <li>cannot_detect_original_size</li>
   * </ul>
   * 
   * @private
   * @method _isAbleToFinish
   * @param  {Object} statusObj
   * @return {Boolean}
   */
  Copy.prototype._isAbleToFinish = function( statusObj ) {
    var i, max, reasons;
    // finish at 0 pages scanned, then, job will halt.
    if ( statusObj.scanningInfo &&
         ( statusObj.scanningInfo.scannedCount === undefined ||
           statusObj.scanningInfo.scannedCount === 0 ) ) {
      return false;
    }

    reasons = statusObj.jobStatusReasons;
    if ( reasons && reasons.length > 0 ) {
      for ( i = 0, max = reasons.length; i < max; i++ ) {
        switch ( reasons[i] ) {
        case "wait_for_next_original":
        case "wait_for_next_original_and_continue":
        case "cannot_detect_original_size":
          break;
        default:
          return false;
        }
      }
      return true;
    } else {
      return false;
    }
  };

  /**
   * Return whether a job is canceled.
   *
   * @private
   * @method _isCanceled
   * @param  {Object} statusObj
   * @return {Boolean}
   */
  Copy.prototype._isCanceled = function( statusObj ) {
    if ( statusObj ) {
      if ( statusObj.jobStatus === "canceled" ) {
        return true;
      }

      if ( statusObj.scanningInfo && statusObj.scanningInfo.jobStatus === "canceled" ) {
        return true;
      }

      if ( statusObj.printingInfo && statusObj.printingInfo.jobStatus === "canceled" ) {
        return true;
      }

    }

    return false;
  };

  /**
   * Return whether a job is aborted.
   *
   * @private
   * @method _isAborted
   * @param  {Object} statusObj
   * @return {Boolean}
   */
  Copy.prototype._isAborted = function( statusObj ) {
    if ( statusObj ) {
      if ( statusObj.jobStatus === "aborted" ) {
        return true;
      }

      if ( statusObj.scanningInfo && statusObj.scanningInfo.jobStatus === "aborted" ) {
        return true;
      }

      if ( statusObj.printingInfo && statusObj.printingInfo.jobStatus === "aborted" ) {
        return true;
      }

    }

    return false;
  };

  /**
   * Start copying.
   *
   * @method start
   * @param {Object}  copyOptions scan options
   * @param {Any}    [userInfo] value notified when an event occurs
   * @param {Object} [callbacks]
   *   @param {Function} [callbacks.onPending]             see {{#crossLink "ricoh.dapi.Copy/onPending:method"}}{{/crossLink}}
   *   @param {Function} [callbacks.onProcessing]          see {{#crossLink "ricoh.dapi.Copy/onProcessing:method"}}{{/crossLink}}
   *   @param {Function} [callbacks.onProcessingStopped]   see {{#crossLink "ricoh.dapi.Copy/onProcessingStopped:method"}}{{/crossLink}}
   *   @param {Function} [callbacks.onCompleted]           see {{#crossLink "ricoh.dapi.Copy/onCompleted:method"}}{{/crossLink}}
   *   @param {Function} [callbacks.onCanceled]            see {{#crossLink "ricoh.dapi.Copy/onCanceled:method"}}{{/crossLink}}
   *   @param {Function} [callbacks.onAborted]             see {{#crossLink "ricoh.dapi.Copy/onAborted:method"}}{{/crossLink}}
   *   @param {Function} [callbacks.onPageScanned]         see {{#crossLink "ricoh.dapi.Copy/onPageScanned:method"}}{{/crossLink}}
   *   @param {Function} [callbacks.onRequest]             called when the request to create a scanner job is completed
   *   @param {Function} [callbacks.onUploadStateChange]   called when dapi.net.onUploadStateChange occurs
   */
  Copy.prototype.start = function( _copyOptions, _userInfo, _callbacks ) {
    var me = this,
        options = util.clone( _copyOptions ),
        callbacks = util.clone( _callbacks ),
        job;

    if ( !me.isInitialized() ) {
      me._callOnAlert({
        id: me._service + ".error.not_initialized",
        process: me._service
      });
      return;
    } else if ( !me.isPermitted() ) {
      me._callOnAlert({
        id: me._service + ".error.not_permitted",
        process: me._service
      });
      return;
    } else if ( !me.isReady() ) {
      me._callOnAlert({
        id: me._service + ".error.not_ready",
        process: me._service
      });
      return;
    }

    me._userCallbacks = callbacks || {};

    job = me._createJob( util.createRandomString() );
    if ( util.is( options, "Array" ) ) {
      job.options = options[0];
      job.headers = options[1];
    }
    else {
      job.options = options;
    }
    job.userInfo = util.clone( _userInfo );
    me.jobs.push( job );

    me._startJob( job );
  };

  /**
   * Return a subprocess name.
   *
   * @private
   * @method _getProcess
   * @param  {Object} statusObj job status
   * @param  {Object} job       set completed process to job object
   * @return {String}
   */
  Copy.prototype._getProcess = function( statusObj, job ) {
    var processes = [ "scanning", "printing" ];
    return this._getProcessOfMultiProcessJob( statusObj, job, processes );
  };

  /**
   * Fax class.
   *
   * @class Fax
   * @constructor
   * @extends ricoh.dapi.app.Device
   */
  Fax = function() {
    if ( !dapi.fax ) {
      logger.error( "namespace 'ricoh.dapi.fax' is undefined." );
    }
    Device.apply( this, [ dapi.fax, "fax", "FAX" ] );
  };

  Fax.prototype = Object.create( Device.prototype );
  Fax.prototype.constructor = Fax;


  /**
   * Return a subprocess name.<br>
   * Always returns "scanning."
   *
   * @private
   * @method  _getProcess
   * @return {String} "scanning"
   */
  Fax.prototype._getProcess = function() {
    return "scanning";
  };


  /**
   * Return whether a job is able to be proceeded.<br>
   * Other reasons why a job is not proceedable are followings.
   *
   * <ul>
   * <li>wait_for_original_preview_operation</li>
   * </ul>
   * 
   * @private
   * @method  _isAbleToProceed
   * @param  {Object} statusObj
   * @return {Boolean}
   */
  Fax.prototype._isAbleToProceed = function( statusObj ) {
    var i, max, reasons = statusObj.jobStatusReasons;
    if ( reasons && reasons.length > 0 ) {
      for ( i = 0, max = reasons.length; i < max; i++ ) {
        switch ( reasons[i] ) {
        case "wait_for_original_preview_operation":
          return false;
        }
      }
      return true;
    } else {
      return false;
    }
  };


  /**
   * Return whether a job is able to be finished scanning.<br>
   * When scannedCount is 0, that job is not finishable.
   * Other reasons why a job is not finishable are followings.
   *
   * <ul>
   * <li>sub_machine_error</li>
   * </ul>
   * 
   * @private
   * @method  _isAbleToFinish
   * @param  {Object} statusObj
   * @return {Boolean}
   */
  Fax.prototype._isAbleToFinish = function( statusObj ) {
    var i, max, reasons;
    // finish at 0 pages scanned, then, job will halt.
    if ( statusObj.scanningInfo &&
         ( statusObj.scanningInfo.scannedCount === undefined ||
           statusObj.scanningInfo.scannedCount === 0 ) ) {
      return false;
    }

    reasons = statusObj.jobStatusReasons;
    if ( reasons && reasons.length > 0 ) {
      for ( i = 0, max = reasons.length; i < max; i++ ) {
        switch ( reasons[i] ) {
        case "sub_machine_error":
        case "scanner_jam":
          return false;
        }
      }
      return true;
    } else {
      return false;
    }
  };


  /**
   * Return whether a job is canceled.
   *
   * @private
   * @method _isCanceled
   * @param  {Object} statusObj
   * @return {Boolean}
   */
  Fax.prototype._isCanceled = function( statusObj ) {
    if ( statusObj ) {
      if ( statusObj.jobStatus === "canceled" ) {
        return true;
      }

      if ( statusObj.scanningInfo && statusObj.scanningInfo.jobStatus === "canceled" ) {
        return true;
      }
    }

    return false;
  };

  /**
   * Return whether a job is aborted.
   *
   * @private
   * @method _isAborted
   * @param  {Object} statusObj
   * @return {Boolean}
   */
  Fax.prototype._isAborted = function( statusObj ) {
    if ( statusObj ) {
      if ( statusObj.jobStatus === "aborted" ) {
        return true;
      }

      if ( statusObj.scanningInfo && statusObj.scanningInfo.jobStatus === "aborted" ) {
        return true;
      }
    }

    return false;
  };

  /**
   * Start faxing.
   *
   * @method start
   * @param {Object}  faxOptions fax options
   * @param {Any}    [userInfo] value notified when an event occurs
   * @param {Object} [callbacks]
   *   @param {Function} [callbacks.onPending]             see {{#crossLink "ricoh.dapi.Fax/onPending:method"}}{{/crossLink}}
   *   @param {Function} [callbacks.onProcessing]          see {{#crossLink "ricoh.dapi.Fax/onProcessing:method"}}{{/crossLink}}
   *   @param {Function} [callbacks.onProcessingStopped]   see {{#crossLink "ricoh.dapi.Fax/onProcessingStopped:method"}}{{/crossLink}}
   *   @param {Function} [callbacks.onCompleted]           see {{#crossLink "ricoh.dapi.Fax/onCompleted:method"}}{{/crossLink}}
   *   @param {Function} [callbacks.onCanceled]            see {{#crossLink "ricoh.dapi.Fax/onCanceled:method"}}{{/crossLink}}
   *   @param {Function} [callbacks.onAborted]             see {{#crossLink "ricoh.dapi.Fax/onAborted:method"}}{{/crossLink}}
   *   @param {Function} [callbacks.onPageScanned]         see {{#crossLink "ricoh.dapi.Fax/onPageScanned:method"}}{{/crossLink}}
   *   @param {Function} [callbacks.onRequest]             called when the request to create a scanner job is completed
   */
  Fax.prototype.start = function( _faxOptions, _userInfo, _callbacks ) {
    var me = this,
        options = util.clone( _faxOptions ),
        callbacks = util.clone( _callbacks ),
        job;
    if ( !me.isInitialized() ) {
      me._callOnAlert({
        id: me._service + ".error.not_initialized",
        process: me._service
      });
      return;
    } else if ( !me.isPermitted() ) {
      me._callOnAlert({
        id: me._service + ".error.not_permitted",
        process: me._service
      });
      return;
    } else if ( !me.isReady() ) {
      me._callOnAlert({
        id: me._service + ".error.not_ready",
        process: me._service
      });
      return;
    }

    me._userCallbacks = callbacks || {};

    job = me._createJob( util.createRandomString() );
    if ( util.is( options, "Array" ) ) {
      job.options = options[0];
      job.headers = options[1];
    }
    else {
      job.options = options;
    }
    job.userInfo = util.clone( _userInfo );
    me.jobs.push( job );

    me._startJob( job );
  };

  /**
   * Job class.
   *
   * @private
   * @class  Job
   * @constructor
   */
  Job = function( id, service ) {

    /**
     * Unique id to identify a job
     *
     * @public
     * @property id
     * @type     {String}
     */
    this.id = id;

    /**
     * Service name
     *
     * @public
     * @property service
     * @type     {String}
     */
    this.service = service;

    /**
     * Job object
     *
     * @public
     * @property job
     * @type     {ricoh.dapi.Job}
     * @default  undefined
     */
    this.obj = undefined;

    /**
     * Status
     *
     * @private
     * @property _status
     * @type     {String}
     * @default  undefined
     */
    this._status = undefined;

    /**
     * Process
     *
     * @private
     * @property _process
     * @type     {String}
     * @default  ""
     */
    this._process = "";

    /**
     * Download info
     *
     * @public
     * @property download
     * @type     {Object}
     */
    this.download = {

      /**
       * Download options
       *
       * @public
       * @property download.options
       * @type     {Object}
       * @default  undefined
       */
      options: undefined,

      /**
       * Download file url
       *
       * @public
       * @property download.url
       * @type     {String}
       * @default  undefined
       */
      url: undefined
    };

    /**
     * Upload info
     *
     * @public
     * @property upload
     * @type     {ricoh.dapi.app.Upload}
     */
    this.upload = new Upload();

    /**
     * Whether user is able to cancel/proceed/finish/stop
     *
     * @public
     * @property availability
     * @type {Object}
     */
    this._availability = {
      cancel: false,
      proceed: false,
      finish: false,
      stop: false
    };

    /**
     * Callback functions
     *
     * @public
     * @property callbacks
     * @type     {Object}
     */
    this.callbacks = {
      cancel: undefined,
      proceed: undefined,
      finish: undefined,
      stop: undefined
    };

    /**
     * Whether user requests to cancel job
     *
     * @public
     * @property isCancelRequested
     * @type     {Boolean}
     * @default  false
     */
    this.isCancelRequested = false;

    /**
     * Whether cancel request is accepted
     *
     * @private
     * @property isCancelAccepted
     * @type     {Boolean}
     * @default  false
     */
    this._isCancelAccepted = false;

    /**
     * Flag to stop countdown
     *
     * @public
     * @property flagStopCountdown
     * @type     {Boolean}
     * @default  false
     */
    this.flagStopCountdown = false;

    /**
     * Function which is called after onCompleted.
     *
     * @public
     * @property postOnCompleted
     * @type     {Function}
     * @default  undefined
     */
    this.postOnCompleted = undefined;

    /**
     * Function which is called after onJobStatusChange.
     *
     * @public
     * @property postOnStatusChange
     * @type     {Function}
     * @default  undefined
     */
    this.postOnStatusChange = undefined;

    /**
     * Flags that process has been completed.
     *
     * @private
     * @property _completedProcess
     * @type     {Object}
     */
    this._completedProcess = {};

    /**
     * Last process
     *
     * @private
     * @property lastProcess
     * @type     {String}
     */
    this._lastProcess = {};
  };

  /**
   * Set or get status value
   *
   * @public
   * @method status
   * @param  {String} [value] status
   * @return {String}         status
   */
  Job.prototype.status = function( value ) {
    // As a getter method.
    if ( value === undefined ) {
      return this._status;
    }

    if ( this._status !== value ) {
      this._status = value;
      this._isStatusChanged = true;
    } else {
      this._isStatusChanged = false;
    }
  };

  /**
   * Set or get process value
   *
   * @public
   * @method process
   * @param  {String} [value] process
   * @return {String}         process
   */
  Job.prototype.process = function( value ) {
    // As a getter method.
    if ( value === undefined ) {
      return this._process;
    }

    if ( this._process !== value ) {
      this._process = value;

      if ( value === "cancel" ) {
        this.availability( "cancel", false );
        this._isCancelAccepted = true;
      } else {
        this.availability( "cancel", true );
      }

      if ( value === "scanning" ) {
        this.availability( "stop", true );
      } else {
        this.availability( "stop", false );
      }

      switch ( value ) {
      // if cancel is pending, execute cancel
      case "scanning":
      case "printing":
      case "preview":
      case "filing":
      case "sending":
      case "downloading":
      case "uploading":
        if ( this.isCancelRequested && !this._isCancelAccepted ) {
          this.callbacks.cancel();
        }
        break;
      default:
        break;
      }
    }
  };

  /**
   * Set or get availability
   *
   * @public
   * @method availability
   * @param  {String}
   * @param  {Boolean}
   * @return {Object|Boolean}
   */
  Job.prototype.availability = function() {
    switch ( arguments.length ) {
    // Get all availability
    case 0:
      return this._availability;

    // Get the specified availability
    case 1:
      return this._availability[ arguments[0] ];

    // Set the specified availability
    case 2:
      this._availability[ arguments[0] ] = arguments[1];
      break;

    default:
      break;
    }
  };

  /**
   * Return whether this job had been finished.
   * This status is updated in callOnXXX.
   *
   * @public
   * @method hasFinishedStatus
   * @return {Boolean}
   */
  Job.prototype.hasFinishedStatus = function() {
    return this._status === "completed" || this._status === "aborted";
  };


  /**
   * Return whether this job is finished.
   * For scanner job, check that all files has been uploaded.
   *
   * @public
   * @method isFinished
   * @return {Boolean}
   */
  Job.prototype.isFinished = function() {
    var jobStatus;

    // check current job status.
    if ( !this.obj || !this.obj.status ) {
      return false;
    }
    jobStatus = this.obj.status.jobStatus;
    if ( jobStatus !== "completed" && jobStatus !== "aborted" && jobStatus !== "canceled" ) {
      return false;
    }
    
    // without scanner, it does not have uploading process after device job.
    if ( this.service !== "scanner" ) {
      return true;
    }

    // aborted or canceled
    if ( this.obj.status.scanningInfo === undefined || this.obj.status.scanningInfo.scannedCount === undefined ) {
      return true;
    }
    // this.upload.files is not fully created.
    if ( jobStatus === "completed" ) {
      if ( ( this.isMultiPageFormat() && this.upload.files.length !== 1 ) ||
           ( !this.isMultiPageFormat() && this.obj.status.scanningInfo.scannedCount !== this.upload.files.length ) ){
        return false;
      }
    }
    // check all files has been uploaded.
    return this.upload.isAllFinished();
  };

  /**
   * Return whether cancel request is accepted.
   *
   * @public
   * @method isCancelAccepted
   * @return {Boolean}
   */
  Job.prototype.isCancelAccepted = function() {
    return this._isCancelAccepted;
  };

  /**
   * Return whether the job option is multi page format.
   * @private
   * @method isMultiPageFormat
   * @return {Boolean}
   */
  Job.prototype.isMultiPageFormat = function() {
    if ( this.options.jobSetting &&
         this.options.jobSetting.fileSetting &&
         this.options.jobSetting.fileSetting.multiPageFormat !== undefined ) {
      return this.options.jobSetting.fileSetting.multiPageFormat;
    } else {
      return true;
    }
  };

  /**
   * Upload class.
   *
   * @private
   * @class Upload
   * @constructor
   */
  Upload = function() {

    /**
     * Upload options
     *
     * @public
     * @property options
     * @type     {Object}
     * @default  undefined
     */
    this.options = undefined;

    /**
     * Uploaded files
     *
     * @public
     * @property files
     * @type     {Array}
     * @default  []
     */
    this.files = [];

    /**
     * The number of files which has already been uploaded
     *
     * @public
     * @property finishedCount
     * @type     {Number}
     * @default  0
     */
    this.finishedCount = 0;

    /**
     * Whether some files are failed to upload
     *
     * @private
     * @property _hasErrorFile
     * @type     {Boolean}
     * @default  false
     */
    this._hasErrorFile = false;

    /**
     * Whether some files are canceled to upload
     *
     * @private
     * @property _hasCanceledFile
     * @type     {Boolean}
     * @default  false
     */
    this._hasCanceledFile = false;
  };

  /**
   * Add file object until the number of files becomes the page argument.
   *
   * @public
   * @method addFiles
   * @param  {Number} The number of file page
   */
  Upload.prototype.addFile = function( page ) {
    var file = {
      id: util.createRandomString(),
      page: page,
      status: "file_getting",
      isFinished: false
    };
    this.files.push( file );
    return file;
  };

  /**
   * Set or get file status
   *
   * @public
   * @method fileStatus
   * @param  {String} id      file id
   * @param  {String} [value] status
   * @return {String}         status
   */
  Upload.prototype.fileStatus = function( id, value ) {
    var file, i;

    for ( i = 0; i < this.files.length; i++ ) {
      if ( this.files[i].id === id ) {
        file = this.files[i];
        break;
      }
    }

    if ( !file ) {
      return;
    }

    // As a getter method.
    if ( value === undefined ) {
      return  file.status;
    }

    // Do not change finished file.
    if ( file.isFinished ) {
      return;
    }

    if ( value !== file.status ) {
      file.status = value;

      if ( value === "success" ||
           value === "error" ||
           value === "canceled" ) {
        this.finishedCount += 1;
        file.isFinished = true;
      }

      switch( value ) {
      case "file_getting":
      case "uploading":
      case "canceling":
      case "success":
        break;
      case "error":
        this._hasErrorFile = true;
        break;
      case "canceled":
        this._hasCanceledFile = true;
        break;
      default:
        break;
      }
    }
  };

  /**
   * Return whether all uploads are finished
   *
   * @public
   * @method isAllFinished
   * @return {Boolean}
   */
  Upload.prototype.isAllFinished = function() {
    return this.finishedCount === this.files.length;
  };

  /**
   * Return whether some files are failed to upload
   *
   * @public
   * @method hasErrorFile
   * @return {Boolean}
   */
  Upload.prototype.hasErrorFile = function() {
    return this._hasErrorFile;
  };

  /**
   * Return whether some files are canceled to upload
   *
   * @public
   * @method hasCanceledFile
   * @return {Boolean}
   */
  Upload.prototype.hasCanceledFile = function() {
    return this._hasCanceledFile;
  };

  function isPDF( fileName ) {
    var ext = extension( fileName );
    return ext.indexOf( "pdf" ) > -1;
  }

  function extension( fileName ) {
    var name = fileName.toLowerCase();
    return name.split( "." ).pop();
  }

  function replacePageNumber( fileName, page ) {
    var replacedFileName;

    if ( !util.is( page, "Number" ) ) {
      return fileName;
    }

    replacedFileName = fileName.replace( /%(\d*)p/g, function( str, p1 ) {
      if ( !p1 ) {
        return page;
      }
      return util.zeroPadding( page, Number( p1 ) );
    });

    return replacedFileName;
  }

  app.printer = new Printer();
  app.scanner = new Scanner();
  app.copy = new Copy();
  app.fax = new Fax();

})( window );

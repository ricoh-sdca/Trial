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
 * This ice.print.js supports SmartSdk Version : 2.00
 */

( function( root ) {

  "use strict";

  var ricoh, dapi, app,
      logger, util, supported;

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

  supported = dapi.getSupport();
  if ( !supported || !supported.modifiedPrint ) {
    console.error( "not modified print." );
    return;
  }

  dapi.internal = dapi.internal || {};
  dapi.internal.print = function( param ) {
    ricoh.dapi.internal.browserCall( "[[RICOH:EXJS]]ricoh.dapi.internal.print", JSON.stringify( param ) );
  };

  dapi.internal.printResult = function() {
    // This JavaScript library user must override this function.
  };

  app = dapi.app = dapi.app || {};
  // for setLevel
  logger = dapi._logger;
  util = dapi._util;

  if ( app.printer ) {
    /**
     * Return function called when dapi.internal.printResult occurs.
     *
     * @private
     * @method _onPrivatePrintResult
     * @return {Function}
     */
    app.printer._onPrivatePrintResult = function( job ) {
      var me = this;
      return function( _result ) {
        var result = JSON.parse( _result );
        if ( result && result.result ) {
          me._callOnCompleted({
            id: me._service + ".completed",
            process: me._service,
          }, job );
          me._finish( job );
        }
        else {
          me._callOnAborted({
            id: me._service + ".aborted.printing.job_canceled_at_device",
            process: me._service,
          }, job );
          me._finish( job );
        }
      };
    };

    /**
     * Start print job
     *
     * @protected
     * @method _startJob
     * @param  {ricoh.dapi.app.Job} job
     */
    app.printer._startJob = function( job ) {
      var me = this;
      me._lockDevice();

      me._callOnRequesting({
        id: me._service + ".requesting.start",
        process: "start",
      }, job );
      
      dapi.internal.printResult = me._onPrivatePrintResult( job );
      dapi.internal.print( { "filepath" : job.options.filePath } );
      
      me._callOnDone({
        id: me._service + ".done.start",
        process: "start"
      }, job );

      me._callOnProcessing({
        id: me._service + ".processing.start",
        process: "start"
      }, job );
    };
  }
})( window );

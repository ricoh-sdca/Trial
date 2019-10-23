/**
 * @copyright Copyright 2013 Ricoh Americas Corporation. All Rights Reserved.
 * 
 * Copyright (c) 2013 Ricoh Americas Corporation. All Rights Reserved.
 * 
 * @fileOverview UI plugin implementation class for Sencha Touch2.
 * @author Ricoh Americas Corporation. ICE development team.
 * @version 0.1 (06 Feb 2014) 
 */
(function( root ) {	
	"use strict";
	
	/**
	 * This is a view logic class for Jquery UI. 
	 */
	ricoh.ice.view.plugin.jqueryUI = {
		/**
		 * 
		 * @param param the parameter for this plugin
		 */
		overrideIceUILogic: function(param){
		   //console.info("overrideICEUILogic is called");
		  
		   
		   ricoh.ice.view.util.mask.show = function(message){
			   activateSpinner(message);		
		    };
		            
		   ricoh.ice.view.util.mask.hide = function(){
			   removeSpinner();			
		   };
		    		
		   ricoh.ice.view.util.simpleDialog.show = function(message){
			   activateSimpleDialog(message);
		   };
		    	
		   ricoh.ice.view.util.operationDialog.show = function(message,details){
			   activateOperationalDialog(message, details);
		   };

		   ricoh.ice.view.util.operationDialog.update = function(message,details){
			   updateOperationalDialog(message, details);
		   };

		   ricoh.ice.view.util.operationDialog.hide = function(){
			   closeOperationalDialog();
		   };
		   
		   ricoh.ice.view.util.scanStopDialog.show = function(message,details){
			   activateSpinnerStopScan(message, details);
		   };
		   ricoh.ice.view.util.scanStopDialog.hide = function(){
			   removeStopScan();
		   };
		   ricoh.ice.view.util.printJobObserver.onDownloadCompleted = function(fileUrl){ 
			   resetWindowTimeout();
				//alert("[ICE#PrintJobObserver] "+fileUrl+" has been downloaded.");
		   };
		   ricoh.ice.view.util.scanJobObserver.onDone = function(){ 
			   resetWindowTimeout();	
				//alert("[ICE#ScanJobObserver] job is done.");
		   };
		}
	};
})( window );



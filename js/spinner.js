
var details;

function activateSpinner(message) {
	var isStopable = false;
	isStopable = $('#stopscan').is(":visible");
    // add the overlay with loading image to the page	
	removeSpinner();
	var imagesrc = "images/loading_spin.gif";
	var stopscansrc = "images/stop_scanning.png";
    var over = '<div id="overlay">' + 
        			'<div id="innerOverlay"><div><img id="loading" src="'+imagesrc+'"></div>' +
        			'<div id="message"><font color="#333333">'+message+'</font></div></div>';
    over += '<div id="stopscan"  onclick="doStopScan();"><img id="loading-stopscan" src="'+stopscansrc+'"></div>';
    over += '</div>';
    $(over).appendTo('body');
    
    if(isStopable){
    	$("#stopscan").show();
    }else{
    	$("#stopscan").hide();
    }
};

function activateSpinnerStopScan(message, detailObject) {
	details = detailObject;
	$("#stopscan").show();
	//$("#message").text(message);    
};

function removeStopScan() {
	$("#stopscan").hide();
};

function getUrl(){
	  var strHref = window.location.href;	  
	  var baseHref = strHref.split("?");
	  
	  var aQueryString = baseHref[0].split("/");
	  strHref="";
	  // window.alert(aQueryString);
	  for(i=0;i<aQueryString.length-1;i++){
	    strHref=strHref+aQueryString[i]+"/";
	  }
	  //window.alert(strHref);
	  return strHref;
}

function removeSpinner(){
	$('#overlay').remove();
	//$(":input").removeAttr("disabled");
	//$("*").removeAttr("disabled");
}

function activateSimpleDialog(infoMessage){
	$('#infoMsgDiv').html(infoMessage);
	$('#simpleDialog').toggle();
}

function closeSimpleDialog(){
	var isSimpleDialogVisible = $('#simpleDialog').is(":visible");
	
	if(isSimpleDialogVisible){
		$('#simpleDialog').toggle();
	}	
}

function activateOperationalDialog(infoMessage, detailObject){
	if(typeof detailObject.remainingTime !== "undefined"){
		var message = infoMessage.replace("{0}", detailObject.remainingTime);
		message = message.replace('.', '<br>');
		message = message.replace('.', '<br>');
		$('#infoMsgOperationalDiv').html(message);
	}else{
		$('#infoMsgOperationalDiv').html(infoMessage);
	}	
	if(detailObject.proceed === false){
		$('#continueOperational').hide();
	}else{
		$('#continueOperational').show();
	}
	if(detailObject.cancel === false){
		$('#cancelScanOperational').hide();
	}else{
		$('#cancelScanOperational').show();
	}
	if(detailObject.finish === false){
		$('#finishScanOperational').hide();				
	}else{
		$('#finishScanOperational').show();
	}
	
	$('#operationalDialog').toggle();
	
	details = detailObject;
}

function updateOperationalDialog(infoMessage, detailObject){
	if(typeof detailObject.remainingTime !== "undefined"){
		var message = infoMessage.replace("{0}", detailObject.remainingTime);
		message = message.replace('.', '<br>');
		message = message.replace('.', '<br>');
		$('#infoMsgOperationalDiv').html(message);
	}else{
		$('#infoMsgOperationalDiv').html(infoMessage);
	}
	if(detailObject.proceed === false){
		$('#continueOperational').hide();
	}else{
		$('#continueOperational').show();
	}
	if(detailObject.cancel === false){
		$('#cancelScanOperational').hide();
	}else{
		$('#cancelScanOperational').show();
	}
	if(detailObject.finish === false){
		$('#finishScanOperational').hide();				
	}else{
		$('#finishScanOperational').show();
	}
	
	var isOperationalDialogVisible = $('#operationalDialog').is(":visible");
	
	if(isOperationalDialogVisible === false){
		$('#operationalDialog').toggle();
	}
	
	details = detailObject;
}

function closeOperationalDialog(){
	var isOperationalDialogVisible = $('#operationalDialog').is(":visible");
	
	if(isOperationalDialogVisible){
		$('#operationalDialog').toggle();
	}
}


function toggledialogs(){
	$('#operationalDialog').toggle();
	$('#simpleDialog').toggle();
}

function doContinue(){
    details.callbacks.proceed(); 
    closeOperationalDialog(); 
}   

function doFinish(){ 
    details.callbacks.finish(); 
    closeOperationalDialog();
}  

function doCancel(){ 
    details.callbacks.cancel();             
    closeOperationalDialog();
}

function doStopScan(){	
	console.info("[spinner] stop scan start");
    details.callbacks.stop();    
    console.info("[spinner] stop scan end");
} 
           





/**
 * @copyright Copyright 2016 Ricoh Americas Corporation. All Rights Reserved.
 * 
 * Copyright (c) 2016 Ricoh Americas Corporation. All Rights Reserved.
 * 
 * @file Overview This library hides the 
 * @author Ricoh Americas Corporation.
 */
(function( root ) {	
    "use strict";

    var ricoh;

    if (typeof root.ricoh === "undefined" || root.ricoh === null) {
	ricoh = root.ricoh = {};
    } else {
	ricoh = root.ricoh;
    }
	
    var ice = ricoh.ice = ricoh.ice || {};
    ice.aaa = ricoh.ice.aaa || {};

    ice.aaa.onLoginCallback = function(){
        // Please override this function from ICE application.
    }
    ice.aaa.onLogoutCallback = function(){
        // Please override this function from ICE application
    }
    
    /**
     * ricoh.dapi initialization (token validation)
     */
    ice.aaa.dapi = {
	init: function(){
	    var listener = {
		authenticator: {
		    onLogin: ice.aaa.onLoginCallback,
		    onLogout: ice.aaa.onLogoutCallback
		}
	    };
	    ricoh.dapi.auth.addListener(listener);
	},

        /** The data structure should be like below.
        return {
        existsProvider : true,
        isLogin : true,
        user : {
          STATUS : "LOGGED IN",
          IDENTIFIER : "user1",
          AUTHENTICATOR : "Simulated Authenticator",
          AUTHENTICATOR_PROVIDER : "Simulated Authenticator Provider",
          AUTHENTICATOR_TYPE : "Original type",
          DISPLAY_NAME : "user1",
          FIRST_NAME : "user",
          MIDDLE_NAME : "",
          LAST_NAME : "1",
          GROUP : "users",
          EMAIL : "user1@users.org",
          HOME_FOLDER : "/home/user",
        },
        credential : {
          STATUS : "ACTIVE",
          SESSION_ID : "sessionid",
          USER_ID : "user1",
          PASSWORD : "pa$$word",
          DELEGATION_STR : "deleg string",
          KDC : "kdc.ricohsv.com",
          REALM : "RICOHSV.LOCAL",
          NTLM_DOMAIN : "RICOHSV.DOMAIN",
          NTLM_HOST : "RICOHSV.DOMAIN.HOST",
          SMB_AUTH : "smb-auth",
          SMB_AUTH_REMOTE : "smb-auth-remote",
        },
        };
	*/ 
	getAuthInfo: function(){
	    return ricoh.dapi.auth.getAuthenticatorInfo();
	},
    };
})( window );

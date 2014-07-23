
/**
 * This function is used to login into cti
 */
function agentLogin_doLogin()
{
    var agentId = $("#agentLogin_agentId").val().trim();
    var password = $("#agentLogin_password").val().trim();
    var phoneNumber = $("#agentLogin_phonenumber").val().trim();
    var status = $("#agentLogin_loginstatus").val();
    var releasePhone = $("#agentLogin_releasePhone").val();
    //var agentId = "131";
    //var password = "";
    //var phoneNumber = "7109";
    //var releasePhone = "false";
    //var status = "4";
	if (agentId == "")
	{
		alert("Please input workno!");
		return;
	}
	agentLogin_login(agentId, password, phoneNumber, status, releasePhone);
}

/**
 * This function is used to login into cti
 * @param agentId : the work ID of  agent 
 * @param password : the password ID of agent 
 * @param phoneNumber : the phone numeber ID of agent 
 * @param status : 4 means agent will be into idle status after login
 *     4 means agent will be into ACW status after login
 * @param releasePhone : 
 *    true means always off hook after finishing call.
 *    false means phone will keep talking after finishing call.
 */
function agentLogin_login(agentId, password, phoneNumber, status, releasePhone)
{
	OnlineAgent.login({
		"agentid" : agentId,
		$entity:{
			"password":password,
			"phonenum":phoneNumber,
			"status": status,
			"releasephone" : releasePhone,
			"agenttype": 4
		},
		$callback: function(result, data, entity){
			 var resLogin = entity;
			 var retCodeLogin = resLogin.retcode;
			 switch (retCodeLogin)
			 {
				case "0":
					// login success	
					agentLogin_loginSuccess(agentId, phoneNumber);
					break;
				case "100-015":
					alert("The agent has logged in. And the system do not allow forcibly login ");
					break;
				case "100-002":						
					//The agent has loged in. But you can force login.
					var btn = confirm("The agent has logged in. Do you want to forcibly login?");
					if (btn)
					{
						agentLogin_doForceLogin(agentId, password, phoneNumber, status, releasePhone);
					}
					break;
				default :
					alert("Error! Retcode : " + retCodeLogin + ". RetMessage:" +  resLogin.message);
				break;
			 }
		}
	});
}

/**
 * When agent has logged in, you can call this function to force to login in
 * @param agentId
 * @param password
 * @param phoneNumber
 * @param status
 * @param releasePhone
 */
function agentLogin_doForceLogin(agentId, password, phoneNumber, status, releasePhone)
{
	OnlineAgent.forceLogin({
		"agentid" : agentId,
		$entity:{
			"password":password,
			"phonenum":phoneNumber,
			"status": status,
			"releasephone" : releasePhone,
			"agenttype": 4
		},
		$callback: function(result,data, entity){
			 var resLogin = entity;
			 var retCodeLogin = resLogin.retcode;
			 switch (retCodeLogin)
			 {
				case "0":
					// login success	
					agentLogin_loginSuccess(agentId, phoneNumber);
					break;
				default :
					alert("Error! Retcode : " + retCodeLogin + ". RetMessage:" +  resLogin.message);
				break;
			 }
		}
	});

}

/**
 * After login successfully, we need to login skill, and start the interval to get the agent's event.
 * @param agentId
 * @param phoneNumber 
 */
function agentLogin_loginSuccess(agentId, phoneNumber)
{
    $("#agentLogin_login").attr("disabled", "disabled");

	$("#agentLogin_logout").removeAttr("disabled");
	global_agentInfo = new AgentInfo(agentId, phoneNumber);
	OnlineAgent.resetSkill({
		"agentid" : agentId,
		"autoflag": true,
		$callback: function(result,data, entity){
			 var resLogin = entity;
			 var retCodeLogin = resLogin.retcode;
			 switch (retCodeLogin)
			 {
				case "0":
				    agentConsole_debug("agent [" + agentId + "] login successfully.");
				    $("#agentPanel_login").hide();
				    $("#agentPanel_status").show();
					// reset skill successfully	
					setTimeout("getEventLisnter()", 500);
					break;
				default :
					alert("Error! Retcode : " + retCodeLogin + ". RetMessage:" +  resLogin.message);
				break;
			 }
		}
	});

}


/**
 * This function is used to logout
 */
function agentLogin_doLogout()
{
	if (global_agentInfo == null
			|| global_agentInfo.undfined)
	{
		return;
	}
	agentLogin_lagout();
}

/**
 * lagout
 */
function agentLogin_lagout()
{
    OnlineAgent.logout({
        "agentid": global_agentInfo.agentId,
        $callback: function(result,data, entity){
            var resLogout = entity;
            var retCodeLogout = resLogout.retcode;
            switch (retCodeLogout) {
                case "0":
                    agentConsole_debug("agent [" + global_agentInfo.agentId + "] logout successfully.");
                    $("#agentPanel_status").hide();
                    $("#agentPanel_login").show();
                    // reset skill successfully	
                    setTimeout("getEventLisnter()", 500);
                    break;
                default:
                    alert("Error! Retcode : " + retCodeLogout + ". RetMessage:" + resLogout.message);
                    break;
            }
        }    
    });
}
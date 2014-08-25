
/**
 * This is agent status button'id
 */
var AGENT_STATUS_BUTTON = {};
AGENT_STATUS_BUTTON.INWORK = "agentStatus_InWork";
AGENT_STATUS_BUTTON.EXITWORK = "agentStatus_ExitWork";
AGENT_STATUS_BUTTON.REST = "agentStatus_rest";
AGENT_STATUS_BUTTON.CANCELREST = "agentStatus_cancelRest";
AGENT_STATUS_BUTTON.BUSY = "agentStatus_sayBusy";
AGENT_STATUS_BUTTON.IDLE = "agentStatus_sayIdle";

/**
 * This agent voice button'id
 */
var AGENT_VOICE_BUTTON = {};
AGENT_VOICE_BUTTON.ANSWER = "agentCall_answer";
AGENT_VOICE_BUTTON.HANGUP = "agentCall_hangup";
AGENT_VOICE_BUTTON.HOLD = "agentCall_hold";
AGENT_VOICE_BUTTON.UNHOLD = "agentCall_unHold";
AGENT_VOICE_BUTTON.THREEPARTY = "agentCall_threeParty";
AGENT_VOICE_BUTTON.TRANSFER = "agentCall_transfer";
AGENT_VOICE_BUTTON.CALLOUT = "agentCall_callout";
AGENT_VOICE_BUTTON.SECONDAIL = "agentCall_secondDial";
AGENT_VOICE_BUTTON.INNERCALL = "agentCall_innercall";
AGENT_VOICE_BUTTON.INNERHELP = "agentCall_innerhelp";
AGENT_VOICE_BUTTON.METU = "agentCall_mute";
AGENT_VOICE_BUTTON.UNMETUE = "agentCall_unmute";




/**
 * change button status
 * @param status
 */
function buttonInfo_changeButtonStatus(status) {
    if (status["disabled"] != undefined) {
        buttonInfo_disableButton(status["disabled"]);
    }
    if (status["enabled"] != undefined) {
        buttonInfo_enableButton(status["enabled"]);
    }
    buttonInfo_showOrHideButtons();

}

function buttonInfo_showOrHideButtons() {
    var buttons = [[AGENT_STATUS_BUTTON.INWORK, AGENT_STATUS_BUTTON.EXITWORK],
	               [AGENT_STATUS_BUTTON.REST, AGENT_STATUS_BUTTON.CANCELREST],
	               [AGENT_STATUS_BUTTON.BUSY, AGENT_STATUS_BUTTON.IDLE],
	               [AGENT_VOICE_BUTTON.HOLD, AGENT_VOICE_BUTTON.UNHOLD],
	               [AGENT_VOICE_BUTTON.METU, AGENT_VOICE_BUTTON.UNMETUE]];
    var len = buttons.length;
    var button = [];
    for (var i = 0; i < len; i++) {
        button = buttons[i];
        if ($("#" + button[0]).length == 1
				&& $("#" + button[1]).length == 1) {
            if ($("#" + button[0] + "[disabled=disabled]").length == 1
					&& $("#" + button[1] + "[disabled=disabled]").length == 1) {
                continue;
            }
            else if ($("#" + button[0] + "[disabled=disabled]").length == 1) {
                $("#" + button[1]).show();
                $("#" + button[0]).hide();
            }
            else if ($("#" + button[1] + "[disabled=disabled]").length == 1) {
                $("#" + button[1]).hide();
                $("#" + button[0]).show();
            }
        }
    }


}



/**
 * disable button
 */
function buttonInfo_disableButton(buttonArray) {
    for (var i in buttonArray) {
        $("#" + buttonArray[i]).attr("disabled", "disabled");
        //$("#" + buttonArray[i]).unbind("click");
        for (var j = 0; j < AGENT_BUTTON_DETAILS.length; j++) {
            if (buttonArray[i] == AGENT_BUTTON_DETAILS[j].name) {
                $("#" + buttonArray[i] + " img").attr("src", "/_imgs/" + AGENT_BUTTON_DETAILS[j].disablebg);
                //if (true == AGENT_BUTTON_DETAILS[j].toHide) {
                //    $("#" + buttonArray[i]).hide();
                //}
            }
        }
    }
}

/**
 * enable button
 */
function buttonInfo_enableButton(buttonArray) {
    for (var i in buttonArray) {
        $("#" + buttonArray[i]).removeAttr("disabled");
        for (var j = 0; j < AGENT_BUTTON_DETAILS.length; j++) {
            if (buttonArray[i] == AGENT_BUTTON_DETAILS[j].name) {
                //$("#" + buttonArray[i]).bind("click", AGENT_BUTTON_DETAILS[j].eventName);
                $("#" + buttonArray[i] + " img").attr("src", "/_imgs/" + AGENT_BUTTON_DETAILS[j].enabledbg);
                //if (true == AGENT_BUTTON_DETAILS[j].toHide) {
                //    $("#" + buttonArray[i]).show();
                //}
            }
        }
    }
}



var AGENT_BUTTON_STATUS = {};
/**
 * Idle status
 */
AGENT_BUTTON_STATUS.IDLE = {
    "disabled": [
                  AGENT_STATUS_BUTTON.EXITWORK,
                  AGENT_STATUS_BUTTON.CANCELREST,
                  AGENT_STATUS_BUTTON.IDLE,

                  AGENT_VOICE_BUTTON.ANSWER,
                  AGENT_VOICE_BUTTON.HANGUP,
                  AGENT_VOICE_BUTTON.HOLD,
                  AGENT_VOICE_BUTTON.UNHOLD,
                  AGENT_VOICE_BUTTON.THREEPARTY,
                  AGENT_VOICE_BUTTON.TRANSFER,
                  AGENT_VOICE_BUTTON.SECONDAIL,
                  AGENT_VOICE_BUTTON.INNERHELP,
                  AGENT_VOICE_BUTTON.METU,
                  AGENT_VOICE_BUTTON.UNMETUE
    ],
    "enabled": [
                 AGENT_STATUS_BUTTON.INWORK,
                 AGENT_STATUS_BUTTON.REST,
                 AGENT_STATUS_BUTTON.BUSY,

                 AGENT_VOICE_BUTTON.CALLOUT,
                 AGENT_VOICE_BUTTON.INNERCALL
    ]
};

/**
 * Busy status
 */
AGENT_BUTTON_STATUS.BUSY = {
    "disabled": [
                  AGENT_STATUS_BUTTON.INWORK,
                  AGENT_STATUS_BUTTON.EXITWORK,
                  AGENT_STATUS_BUTTON.REST,
                  AGENT_STATUS_BUTTON.CANCELREST,
                  AGENT_STATUS_BUTTON.IDLE,
                  AGENT_STATUS_BUTTON.BUSY,

                  AGENT_VOICE_BUTTON.ANSWER,
                  AGENT_VOICE_BUTTON.HANGUP,
                  AGENT_VOICE_BUTTON.HOLD,
                  AGENT_VOICE_BUTTON.UNHOLD,
                  AGENT_VOICE_BUTTON.THREEPARTY,
                  AGENT_VOICE_BUTTON.TRANSFER,
                  AGENT_VOICE_BUTTON.SECONDAIL,
                  AGENT_VOICE_BUTTON.INNERHELP,
                  AGENT_VOICE_BUTTON.METU,
                  AGENT_VOICE_BUTTON.UNMETUE
    ],
    "enabled": [
                 AGENT_STATUS_BUTTON.IDLE,

                 AGENT_VOICE_BUTTON.CALLOUT,
                 AGENT_VOICE_BUTTON.INNERCALL
    ]
};

/**
 * Working status
 */
AGENT_BUTTON_STATUS.WORKING = {
    "disabled": [
                  AGENT_STATUS_BUTTON.INWORK,
                  AGENT_STATUS_BUTTON.EXITWORK,
                  AGENT_STATUS_BUTTON.REST,
                  AGENT_STATUS_BUTTON.CANCELREST,
                  AGENT_STATUS_BUTTON.IDLE,
                  AGENT_STATUS_BUTTON.BUSY,

                  AGENT_VOICE_BUTTON.ANSWER,
                  AGENT_VOICE_BUTTON.HANGUP,
                  AGENT_VOICE_BUTTON.HOLD,
                  AGENT_VOICE_BUTTON.UNHOLD,
                  AGENT_VOICE_BUTTON.THREEPARTY,
                  AGENT_VOICE_BUTTON.TRANSFER,
                  AGENT_VOICE_BUTTON.SECONDAIL,
                  AGENT_VOICE_BUTTON.INNERHELP,
                  AGENT_VOICE_BUTTON.METU,
                  AGENT_VOICE_BUTTON.UNMETUE
    ],
    "enabled": [
                 AGENT_STATUS_BUTTON.BUSY,
                 AGENT_STATUS_BUTTON.REST,
                 AGENT_STATUS_BUTTON.EXITWORK,
                 AGENT_VOICE_BUTTON.CALLOUT,
                 AGENT_VOICE_BUTTON.INNERCALL
    ]
};

/**
 * Rest status
 */
AGENT_BUTTON_STATUS.REST = {
    "disabled": [
                  AGENT_STATUS_BUTTON.INWORK,
                  AGENT_STATUS_BUTTON.EXITWORK,
                  AGENT_STATUS_BUTTON.REST,
                  AGENT_STATUS_BUTTON.IDLE,
                  AGENT_STATUS_BUTTON.BUSY,

                  AGENT_VOICE_BUTTON.ANSWER,
                  AGENT_VOICE_BUTTON.HANGUP,
                  AGENT_VOICE_BUTTON.HOLD,
                  AGENT_VOICE_BUTTON.UNHOLD,
                  AGENT_VOICE_BUTTON.THREEPARTY,
                  AGENT_VOICE_BUTTON.TRANSFER,
                  AGENT_VOICE_BUTTON.SECONDAIL,
                  AGENT_VOICE_BUTTON.INNERHELP,
                  AGENT_VOICE_BUTTON.METU,
                  AGENT_VOICE_BUTTON.UNMETUE,
                  AGENT_VOICE_BUTTON.CALLOUT,
                  AGENT_VOICE_BUTTON.INNERCALL
    ],
    "enabled": [
                 AGENT_STATUS_BUTTON.CANCELREST
    ]
};

/**
 * Ringing status
 */
AGENT_BUTTON_STATUS.RINGING = {
    "disabled": [
                  AGENT_VOICE_BUTTON.HOLD,
                  AGENT_VOICE_BUTTON.UNHOLD,
                  AGENT_VOICE_BUTTON.THREEPARTY,
                  AGENT_VOICE_BUTTON.TRANSFER,
                  AGENT_VOICE_BUTTON.INNERHELP,
                  AGENT_VOICE_BUTTON.METU,
                  AGENT_VOICE_BUTTON.UNMETUE,
                  AGENT_VOICE_BUTTON.CALLOUT,
                  AGENT_VOICE_BUTTON.SECONDAIL,
                  AGENT_VOICE_BUTTON.INNERCALL
    ],
    "enabled": [
                  AGENT_VOICE_BUTTON.ANSWER,
                  AGENT_VOICE_BUTTON.HANGUP
    ]
};



/**
 * Talking status
 */
AGENT_BUTTON_STATUS.TALKING = {
    "disabled": [
                  AGENT_STATUS_BUTTON.INWORK,
                  AGENT_STATUS_BUTTON.EXITWORK,
                  AGENT_STATUS_BUTTON.CANCELREST,
                  AGENT_STATUS_BUTTON.IDLE,

                  AGENT_VOICE_BUTTON.ANSWER,
                  AGENT_VOICE_BUTTON.HANGUP,
                  AGENT_VOICE_BUTTON.HOLD,
                  AGENT_VOICE_BUTTON.UNHOLD,
                  AGENT_VOICE_BUTTON.THREEPARTY,
                  AGENT_VOICE_BUTTON.TRANSFER,
                  AGENT_VOICE_BUTTON.INNERHELP,
                  AGENT_VOICE_BUTTON.METU,
                  AGENT_VOICE_BUTTON.UNMETUE,
                  AGENT_VOICE_BUTTON.CALLOUT,
                  AGENT_VOICE_BUTTON.SECONDAIL,
                  AGENT_VOICE_BUTTON.INNERCALL
    ],
    "enabled": [
                  AGENT_STATUS_BUTTON.BUSY,
                  AGENT_STATUS_BUTTON.REST,
    ]
};

/**
 * 
 * When agent click busy button when agent in talking status ,
 * agent is into pre_busy status
 */
AGENT_BUTTON_STATUS.BUSYWHENTALKING = {
    "disabled": [
                  AGENT_STATUS_BUTTON.INWORK,
                  AGENT_STATUS_BUTTON.EXITWORK,
                  AGENT_STATUS_BUTTON.CANCELREST,
                  AGENT_STATUS_BUTTON.REST,
                  AGENT_STATUS_BUTTON.BUSY
    ],
    "enabled": [
                  AGENT_STATUS_BUTTON.IDLE
    ]
};


/**
 * 
 * When agent click busy button when agent in talking status ,
 * agent is into pre_rest status
 */
AGENT_BUTTON_STATUS.RESTWHENTALKING = {
    "disabled": [
                  AGENT_STATUS_BUTTON.INWORK,
                  AGENT_STATUS_BUTTON.EXITWORK,
                  AGENT_STATUS_BUTTON.REST,
                  AGENT_STATUS_BUTTON.BUSY,
                  AGENT_STATUS_BUTTON.IDLE,
    ],
    "enabled": [
                  AGENT_STATUS_BUTTON.CANCELREST
    ]
};

/**
 * 
 *  agent cancel busy when in talking status
 */
AGENT_BUTTON_STATUS.CANCELBUSYWHENTALKING = {
    "disabled": [
                  AGENT_STATUS_BUTTON.INWORK,
                  AGENT_STATUS_BUTTON.EXITWORK,
                  AGENT_STATUS_BUTTON.CANCELREST,
                  AGENT_STATUS_BUTTON.IDLE
    ],
    "enabled": [
                  AGENT_STATUS_BUTTON.REST,
                  AGENT_STATUS_BUTTON.BUSY
    ]
};

/**
 * agent cancel rest when in talking status
 */
AGENT_BUTTON_STATUS.CANCELRESTWHENTALKING = {
    "disabled": [
                  AGENT_STATUS_BUTTON.INWORK,
                  AGENT_STATUS_BUTTON.EXITWORK,
                  AGENT_STATUS_BUTTON.CANCELREST,
                  AGENT_STATUS_BUTTON.IDLE
    ],
    "enabled": [
                  AGENT_STATUS_BUTTON.REST,
                  AGENT_STATUS_BUTTON.BUSY
    ]
};



/**
 * 
 * When agent click busy button when agent in working status ,
 * agent is into pre_rest status
 */
AGENT_BUTTON_STATUS.RESTWHENWORKING = {
    "disabled": [
                  AGENT_STATUS_BUTTON.INWORK,
                  AGENT_STATUS_BUTTON.REST,
                  AGENT_STATUS_BUTTON.IDLE,
                  AGENT_STATUS_BUTTON.BUSY,
                  AGENT_STATUS_BUTTON.CANCELREST,

                  AGENT_VOICE_BUTTON.ANSWER,
                  AGENT_VOICE_BUTTON.HANGUP,
                  AGENT_VOICE_BUTTON.HOLD,
                  AGENT_VOICE_BUTTON.UNHOLD,
                  AGENT_VOICE_BUTTON.THREEPARTY,
                  AGENT_VOICE_BUTTON.TRANSFER,
                  AGENT_VOICE_BUTTON.INNERHELP,
                  AGENT_VOICE_BUTTON.METU,
                  AGENT_VOICE_BUTTON.UNMETUE,
                  AGENT_VOICE_BUTTON.CALLOUT,
                  AGENT_VOICE_BUTTON.SECONDAIL,
                  AGENT_VOICE_BUTTON.INNERCALL
    ],
    "enabled": [
                  AGENT_STATUS_BUTTON.EXITWORK
    ]
};


/**
 * 
 * When agent click busy button when agent in working status ,
 * agent is into pre_busy status
 */
AGENT_BUTTON_STATUS.BUSYWHENWORKING = {
    "disabled": [
                  AGENT_STATUS_BUTTON.INWORK,
                  AGENT_STATUS_BUTTON.REST,
                  AGENT_STATUS_BUTTON.IDLE,
                  AGENT_STATUS_BUTTON.BUSY,
                  AGENT_STATUS_BUTTON.CANCELREST,

                  AGENT_VOICE_BUTTON.ANSWER,
                  AGENT_VOICE_BUTTON.HANGUP,
                  AGENT_VOICE_BUTTON.HOLD,
                  AGENT_VOICE_BUTTON.UNHOLD,
                  AGENT_VOICE_BUTTON.THREEPARTY,
                  AGENT_VOICE_BUTTON.TRANSFER,
                  AGENT_VOICE_BUTTON.INNERHELP,
                  AGENT_VOICE_BUTTON.METU,
                  AGENT_VOICE_BUTTON.UNMETUE,
                  AGENT_VOICE_BUTTON.CALLOUT,
                  AGENT_VOICE_BUTTON.SECONDAIL,
                  AGENT_VOICE_BUTTON.INNERCALL
    ],
    "enabled": [
                  AGENT_STATUS_BUTTON.EXITWORK
    ]
};

/**
 * 
 * When agent click submit rest button when agent in idle status ,
 * agent is into pre_rest status first
 */
AGENT_BUTTON_STATUS.RESTWHENIDLE = {
    "disabled": [
                  AGENT_STATUS_BUTTON.INWORK,
                  AGENT_STATUS_BUTTON.BUSY,
                  AGENT_STATUS_BUTTON.REST
    ],
    "enabled": [
                  AGENT_STATUS_BUTTON.CANCELREST
    ]
};

/**
 * 
 * When agent click cancel rest button when agent in idle status ,
 * agent is into idle status 
 */
AGENT_BUTTON_STATUS.CANCELRESTWHENIDLE = {
    "disabled": [
                  AGENT_STATUS_BUTTON.CANCELREST
    ],
    "enabled": [
                  AGENT_STATUS_BUTTON.INWORK,
                  AGENT_STATUS_BUTTON.BUSY,
                  AGENT_STATUS_BUTTON.REST
    ]
};




/**
 * if callfeature is unknow type, only enable hangup button.
 */
AGENT_BUTTON_STATUS.TALKING_DEFAULT = {
    "disabled": [
        AGENT_VOICE_BUTTON.ANSWER,
        AGENT_VOICE_BUTTON.HOLD,
        AGENT_VOICE_BUTTON.UNHOLD,
        AGENT_VOICE_BUTTON.THREEPARTY,
        AGENT_VOICE_BUTTON.TRANSFER,
        AGENT_VOICE_BUTTON.CALLOUT,
        AGENT_VOICE_BUTTON.SECONDAIL,
        AGENT_VOICE_BUTTON.INNERCALL,
        AGENT_VOICE_BUTTON.INNERHELP,
        AGENT_VOICE_BUTTON.METU,
        AGENT_VOICE_BUTTON.UNMETUE
    ],
    "enabled": [
       AGENT_VOICE_BUTTON.HANGUP
    ]
};

/**
 *talking when normal callin and callout
 *agent receive AgentEvent_Talking event
 *and call feature is CALL_FEATURE.NORMAL or CALL_FEATURE.FEATURE_OUT or CALL_FEATURE.PRE_OCCUPY
 * or CALL_FEATURE.OUTBOUND_VIRTUAL_CALLIN or CALL_FEATURE.OUTBOUND_PREVIEW or CALL_FEATURE.OUTBOUND_CALLBACK
 */
AGENT_BUTTON_STATUS.TALKING_NORMALCALL = {
    "disabled": [
        AGENT_VOICE_BUTTON.ANSWER,
        AGENT_VOICE_BUTTON.UNHOLD,
        AGENT_VOICE_BUTTON.THREEPARTY,
        AGENT_VOICE_BUTTON.CALLOUT,
        AGENT_VOICE_BUTTON.INNERCALL,
        AGENT_VOICE_BUTTON.UNMETUE
    ],
    "enabled": [
       AGENT_VOICE_BUTTON.HANGUP,
       AGENT_VOICE_BUTTON.HOLD,
       AGENT_VOICE_BUTTON.TRANSFER,
       AGENT_VOICE_BUTTON.SECONDAIL,
       AGENT_VOICE_BUTTON.INNERHELP,
       AGENT_VOICE_BUTTON.METU
    ]
};


/**
 *talking after hold operation when normal callin and callout
 *agent receive AgentEvent_Talking event
 *and call feature is CALL_FEATURE.NORMAL or CALL_FEATURE.FEATURE_OUT or CALL_FEATURE.PRE_OCCUPY
 * or CALL_FEATURE.OUTBOUND_VIRTUAL_CALLIN or CALL_FEATURE.OUTBOUND_PREVIEW or CALL_FEATURE.OUTBOUND_CALLBACK
 */
AGENT_BUTTON_STATUS.TALKING_NORMALCALLAFTERHOLD = {
    "disabled": [
        AGENT_VOICE_BUTTON.ANSWER,
        AGENT_VOICE_BUTTON.UNHOLD,
        AGENT_VOICE_BUTTON.CALLOUT,
        AGENT_VOICE_BUTTON.INNERCALL,
        AGENT_VOICE_BUTTON.UNMETUE
    ],
    "enabled": [
       AGENT_VOICE_BUTTON.HANGUP,
       AGENT_VOICE_BUTTON.HOLD,
       AGENT_VOICE_BUTTON.THREEPARTY,
       AGENT_VOICE_BUTTON.TRANSFER,
       AGENT_VOICE_BUTTON.SECONDAIL,
       AGENT_VOICE_BUTTON.INNERHELP,
       AGENT_VOICE_BUTTON.METU
    ]
};

/**
 *talking when innercall call
 *agent receive AgentEvent_Talking event
 *and call feature is CALL_FEATURE.INTERNAL
 */
AGENT_BUTTON_STATUS.TALKING_INNERCALL = {
    "disabled": [
        AGENT_VOICE_BUTTON.ANSWER,
        AGENT_VOICE_BUTTON.HOLD,
        AGENT_VOICE_BUTTON.UNHOLD,
        AGENT_VOICE_BUTTON.THREEPARTY,
        AGENT_VOICE_BUTTON.TRANSFER,
        AGENT_VOICE_BUTTON.CALLOUT,
        AGENT_VOICE_BUTTON.SECONDAIL,
        AGENT_VOICE_BUTTON.INNERCALL,
        AGENT_VOICE_BUTTON.INNERHELP,
        AGENT_VOICE_BUTTON.METU,
        AGENT_VOICE_BUTTON.UNMETUE
    ],
    "enabled": [
       AGENT_VOICE_BUTTON.HANGUP
    ]
};


/**
 *agent receive AgentEvent_Talking event
 *and call feature is CALL_FEATURE.INTERNAL_TWO_HELP
 */
AGENT_BUTTON_STATUS.TALKING_INNER2PARTY = {
    "disabled": [
        AGENT_VOICE_BUTTON.ANSWER,
        AGENT_VOICE_BUTTON.HOLD,
        AGENT_VOICE_BUTTON.UNHOLD,
        AGENT_VOICE_BUTTON.THREEPARTY,
        AGENT_VOICE_BUTTON.TRANSFER,
        AGENT_VOICE_BUTTON.CALLOUT,
        AGENT_VOICE_BUTTON.SECONDAIL,
        AGENT_VOICE_BUTTON.INNERCALL,
        AGENT_VOICE_BUTTON.INNERHELP,
        AGENT_VOICE_BUTTON.METU,
        AGENT_VOICE_BUTTON.UNMETUE
    ],
    "enabled": [
       AGENT_VOICE_BUTTON.HANGUP
    ]
};


/**
 *agent receive AgentEvent_Talking event
 *and call feature is CALL_FEATURE.INTERNAL_THREE_HELP
 */
AGENT_BUTTON_STATUS.TALKING_INNER3PARTY = {
    "disabled": [
        AGENT_VOICE_BUTTON.ANSWER,
        AGENT_VOICE_BUTTON.HOLD,
        AGENT_VOICE_BUTTON.UNHOLD,
        AGENT_VOICE_BUTTON.THREEPARTY,
        AGENT_VOICE_BUTTON.TRANSFER,
        AGENT_VOICE_BUTTON.CALLOUT,
        AGENT_VOICE_BUTTON.SECONDAIL,
        AGENT_VOICE_BUTTON.INNERCALL,
        AGENT_VOICE_BUTTON.INNERHELP,
        AGENT_VOICE_BUTTON.METU,
        AGENT_VOICE_BUTTON.UNMETUE
    ],
    "enabled": [
       AGENT_VOICE_BUTTON.HANGUP
    ]
};


/**
 *agent receive AgentEvent_Talking event
 *and call feature is CALL_FEATURE.CONFERENCE
 */
AGENT_BUTTON_STATUS.TALKING_CONFERENCE = {
    "disabled": [
        AGENT_VOICE_BUTTON.ANSWER,
        AGENT_VOICE_BUTTON.HOLD,
        AGENT_VOICE_BUTTON.UNHOLD,
        AGENT_VOICE_BUTTON.THREEPARTY,
        AGENT_VOICE_BUTTON.TRANSFER,
        AGENT_VOICE_BUTTON.CALLOUT,
        AGENT_VOICE_BUTTON.SECONDAIL,
        AGENT_VOICE_BUTTON.INNERCALL,
        AGENT_VOICE_BUTTON.INNERHELP,
        AGENT_VOICE_BUTTON.METU,
        AGENT_VOICE_BUTTON.UNMETUE
    ],
    "enabled": [
       AGENT_VOICE_BUTTON.HANGUP
    ]
};


/**
 * agent receive AgentEvent_Hold event
 * and call is held
 */
AGENT_BUTTON_STATUS.HOLD = {
    "disabled": [
        AGENT_VOICE_BUTTON.ANSWER,
        AGENT_VOICE_BUTTON.HANGUP,
        AGENT_VOICE_BUTTON.HOLD,
        AGENT_VOICE_BUTTON.THREEPARTY,
        AGENT_VOICE_BUTTON.TRANSFER,
        AGENT_VOICE_BUTTON.SECONDAIL,
        AGENT_VOICE_BUTTON.INNERHELP,
        AGENT_VOICE_BUTTON.METU,
        AGENT_VOICE_BUTTON.UNMETUE
    ],
    "enabled": [
       AGENT_VOICE_BUTTON.UNHOLD,
       AGENT_VOICE_BUTTON.CALLOUT,
       AGENT_VOICE_BUTTON.INNERCALL
    ]
};

/**
 * Metu call.
 */
AGENT_BUTTON_STATUS.METU = {
    "disabled": [
        AGENT_VOICE_BUTTON.ANSWER,
        AGENT_VOICE_BUTTON.HOLD,
        AGENT_VOICE_BUTTON.UNHOLD,
        AGENT_VOICE_BUTTON.THREEPARTY,
        AGENT_VOICE_BUTTON.TRANSFER,
        AGENT_VOICE_BUTTON.CALLOUT,
        AGENT_VOICE_BUTTON.SECONDAIL,
        AGENT_VOICE_BUTTON.INNERCALL,
        AGENT_VOICE_BUTTON.INNERHELP,
        AGENT_VOICE_BUTTON.METU
    ],
    "enabled": [
        AGENT_VOICE_BUTTON.HANGUP,
        AGENT_VOICE_BUTTON.UNMETUE
    ]
};

/**
 * NO call is hold
 */
AGENT_BUTTON_STATUS.NOHOLDCALL = {
    "disabled": [
        AGENT_VOICE_BUTTON.THREEPARTY
    ]
};

AGENT_BUTTON_DETAILS = [
    { name: AGENT_VOICE_BUTTON.ANSWER, enabledbg: "answer.jpg", disablebg: "no_answer.jpg", eventName: "agentCallOperation_toAnswer", toHide: true },
    { name: AGENT_VOICE_BUTTON.HANGUP, enabledbg: "hangup.jpg", disablebg: "no_hangup.jpg", eventName: "agentCallOperation_toHangUp", toHide: true },
    { name: AGENT_VOICE_BUTTON.HOLD, enabledbg: "hold.jpg", disablebg: "no_hold.jpg", eventName: "agentCallOperation_toHold", toHide: true },
    { name: AGENT_VOICE_BUTTON.UNHOLD, enabledbg: "unhold.jpg", disablebg: "no_unhold.jpg", eventName: "agentCallOperation_showUnHold", toHide: true },
    { name: AGENT_VOICE_BUTTON.THREEPARTY, enabledbg: "conference.jpg", disablebg: "no_conference.jpg", eventName: "", toHide: true },
    { name: AGENT_VOICE_BUTTON.TRANSFER, enabledbg: "transfer.jpg", disablebg: "no_transfer.jpg", eventName: "agentCallOperation_showTransfer", toHide: true },
    { name: AGENT_VOICE_BUTTON.CALLOUT, enabledbg: "callout.jpg", disablebg: "no_callout.jpg", eventName: "agentCallOperation_showCallOut", toHide: true },
    { name: AGENT_VOICE_BUTTON.SECONDAIL, enabledbg: "answer.jpg", disablebg: "no_answer.jpg", eventName: "", toHide: true },
    { name: AGENT_VOICE_BUTTON.INNERCALL, enabledbg: "innercall.jpg", disablebg: "no_innercall.jpg", eventName: "", toHide: true },
    { name: AGENT_VOICE_BUTTON.INNERHELP, enabledbg: "innerhelp.jpg", disablebg: "no_innerhelp.jpg", eventName: "", toHide: true },
    { name: AGENT_VOICE_BUTTON.METU, enabledbg: "mute.jpg", disablebg: "no_mute.jpg", eventName: "", toHide: true },
    { name: AGENT_VOICE_BUTTON.UNMETUE, enabledbg: "unmute.jpg", disablebg: "no_mute.jpg", eventName: "", toHide: true },
    { name: AGENT_STATUS_BUTTON.INWORK, enabledbg: "inwork.jpg", disablebg: "no_inwork.jpg", eventName: "", toHide: true },
    { name: AGENT_STATUS_BUTTON.EXITWORK, enabledbg: "exitwork.jpg", disablebg: "no_exitwork.jpg", eventName: "", toHide: true },
    { name: AGENT_STATUS_BUTTON.REST, enabledbg: "rest.jpg", disablebg: "no_rest.jpg", eventName: "", toHide: true },
    { name: AGENT_STATUS_BUTTON.CANCELREST, enabledbg: "rest.jpg", disablebg: "no_rest.jpg", eventName: "", toHide: true },
    { name: AGENT_STATUS_BUTTON.BUSY, enabledbg: "busy.jpg", disablebg: "no_busy.jpg", eventName: "", toHide: true },
    { name: AGENT_STATUS_BUTTON.IDLE, enabledbg: "idle.jpg", disablebg: "no_idle.jpg", eventName: "", toHide: true }

];
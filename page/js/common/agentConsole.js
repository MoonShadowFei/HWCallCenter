function agentConsole_debug(msg)
{
	agentConsole_displayMsg("DEBUG", msg);
}

function agentConsole_error(msg)
{
	agentConsole_displayMsg("ERROR", msg);
}

function agentConsole_info(msg)
{
	agentConsole_displayMsg("INFO", msg);
}


function agentConsole_displayMsg(level, msg)
{
	var buffer = [];
	buffer.push("<tr");
	if (level == "ERROR")
	{
		buffer.push(" style='font-color:red'");
	}
	buffer.push("><td style='width:200px'>" + new Date().format("yyyy-MM-dd hh:mm:ss")
			+ " [" + level + "] </td><td style='word-break:break-all;word-wrap:break-word'>" + htmlEncode(msg)+ "</td></tr>");
	$("#agentConsole tbody").append(buffer.join(""));
}



function agentConsole_cleanLog()
{
	$("#agentConsole tbody").empty();
}
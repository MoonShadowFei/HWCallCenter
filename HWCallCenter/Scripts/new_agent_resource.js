// start RESTEasy client API
// namespace
var REST = {
	apiURL : null,
	loglevel : 0
};
var cookiestring;
// constructor
REST.Request = function (){
	REST.log("Creating new Request");
	this.uri = null;
	this.method = "GET";
	this.username = null;
	this.password = null;
	this.acceptHeader = "*/*";
	this.contentTypeHeader = null;
	this.async = true;
	this.queryParameters = [];
	this.matrixParameters = [];
	this.formParameters = [];
	this.cookies = [];
	this.headers = [];
	this.entity = null;
	this.isForSpecial = false;
	this.timeout = 600000;
	this.timeoutHandle = null;
}

var sepcailRequest = new XMLHttpRequest();
REST.Request.prototype = {
		execute : function(callback){
			var request = null;
			if (this.isForSpecial)
			{
				if (sepcailRequest != null)
				{
					request = sepcailRequest;
				}
				else
				{
					sepcailRequest = new XMLHttpRequest();
					request = sepcailRequest;
				}
			}
			else
			{
				request = new XMLHttpRequest();
			}
			var url = this.uri;

			for(var i=0;i<this.matrixParameters.length;i++){
				url += ";" + REST.Encoding.encodePathParamName(this.matrixParameters[i][0]);
				url += "=" + REST.Encoding.encodePathParamValue(this.matrixParameters[i][1]);
			}
			for(var i=0;i<this.queryParameters.length;i++){
				if(i == 0)
					url += "?";
				else
					url += "&";
				url += REST.Encoding.encodeQueryParamNameOrValue(this.queryParameters[i][0]);
				url += "=" + REST.Encoding.encodeQueryParamNameOrValue(this.queryParameters[i][1]);
			}
			for(var i=0;i<this.cookies.length;i++){
				document.cookie = escape(this.cookies[i][0]) 
					+ "=" + escape(this.cookies[i][1]);
			}
			request.open(this.method, url, this.async, this.username, this.password);
			
			if ($.browser.msie)
			{	
				if(this.isForSpecial)
				{
					request.timeout = 60000; 
					request.ontimeout = this.timeoutHandle;
				}
				else
			    {
			    	request.timeout = this.timeout;
			    	request.ontimeout = function ()
					{
						try 
						{
							console.dir("date : " + new Date().format("yyyy-MM-dd hh:mm:ss.S") + "; time out");
							console.dir("url :" + url);
						}
						catch (e)
						{
							
						}
					};
			    }
			}
			if (null != cookiestring && "" != cookiestring)
			{
				request.setRequestHeader('Guid', cookiestring);
			}
			var acceptSet = false;
			var contentTypeSet = false;
			for(var i=0;i<this.headers.length;i++){
				if(this.headers[i][0].toLowerCase() == 'accept')
					acceptSet = this.headers[i][1];
				if(this.headers[i][0].toLowerCase() == 'content-type')
					contentTypeSet = this.headers[i][1];
				request.setRequestHeader(REST.Encoding.encodeHeaderName(this.headers[i][0]),
						REST.Encoding.encodeHeaderValue(this.headers[i][1]));
			}
			if(!acceptSet)
				request.setRequestHeader('Accept', this.acceptHeader);
			REST.log("Got form params: "+this.formParameters.length);
			// see if we're sending an entity or a form
			if(this.entity && this.formParameters.length > 0)
				throw "Cannot have both an entity and form parameters";
			// form
			if(this.formParameters.length > 0){
				if(contentTypeSet && contentTypeSet != "application/x-www-form-urlencoded")
					throw "The ContentType that was set by header value ("+contentTypeSet+") is incompatible with form parameters";
				if(this.contentTypeHeader && this.contentTypeHeader != "application/x-www-form-urlencoded")
					throw "The ContentType that was set with setContentType ("+this.contentTypeHeader+") is incompatible with form parameters";
				contentTypeSet = "application/x-www-form-urlencoded";
				request.setRequestHeader('Content-Type', contentTypeSet);
			}else if(this.entity && !contentTypeSet && this.contentTypeHeader){
				// entity
				contentTypeSet = this.contentTypeHeader;
				request.setRequestHeader('Content-Type', this.contentTypeHeader);
			}
			// we use this flag to work around buggy browsers
			var gotReadyStateChangeEvent = false;
			if(callback){
				request.onreadystatechange = function() {
					gotReadyStateChangeEvent = true;
					REST.log("Got readystatechange");
					REST._complete(this, callback);
				};
			}
			var data = this.entity;
			if(this.entity){
				// Modify by chengaoqi:delete document && element for ie
				if(this.entity instanceof Object){
					if(!contentTypeSet || REST._isJSONMIME(contentTypeSet))
						data = JSON.stringify(this.entity);
				}
			}else if(this.formParameters.length > 0){
				data = '';
				for(var i=0;i<this.formParameters.length;i++){
					if(i > 0)
						data += "&";
					data += REST.Encoding.encodeFormNameOrValue(this.formParameters[i][0]);
					data += "=" + REST.Encoding.encodeFormNameOrValue(this.formParameters[i][1]);
				}
			}
			REST.log("Content-Type set to "+contentTypeSet);
			REST.log("Entity set to "+data);
			request.send(data);
			// now if the browser did not follow the specs and did not fire the events while synchronous,
			// handle it manually
			if(!this.async && !gotReadyStateChangeEvent && callback){
				REST.log("Working around browser readystatechange bug");
				REST._complete(request, callback);
			}
			
			if(!this.async)
				request = null;
		},
		setAccepts : function(acceptHeader){
			REST.log("setAccepts("+acceptHeader+")");
			this.acceptHeader = acceptHeader;
		},
		setCredentials : function(username, password){
			this.password = password;
			this.username = username;
		},
		setEntity : function(entity){
			REST.log("setEntity("+entity+")");
			this.entity = entity;
		},
		setContentType : function(contentType){
			REST.log("setContentType("+contentType+")");
			this.contentTypeHeader = contentType;
		},
		setURI : function(uri){
			REST.log("setURI("+uri+")");
			this.uri = uri;
		},
		setMethod : function(method){
			REST.log("setMethod("+method+")");
			this.method = method;
		},
		setAsync : function(async){
			REST.log("setAsync("+async+")");
			this.async = async;
		},
		addCookie : function(name, value){
			REST.log("addCookie("+name+"="+value+")");
			this.cookies.push([name, value]);
		},
		addQueryParameter : function(name, value){
			REST.log("addQueryParameter("+name+"="+value+")");
			this.queryParameters.push([name, value]);
		},
		addMatrixParameter : function(name, value){
			REST.log("addMatrixParameter("+name+"="+value+")");
			this.matrixParameters.push([name, value]);
		},
		addFormParameter : function(name, value){
			REST.log("addFormParameter("+name+"="+value+")");
			this.formParameters.push([name, value]);
		},
		addHeader : function(name, value){
			REST.log("addHeader("+name+"="+value+")");
			this.headers.push([name, value]);
		},
		setSpecial : function(value) {
			REST.log("setSpecial(" + value + ")");
			this.isForSpecial = value;
		},
		setTimeoutHandle : function(value) {
			this.timeoutHandle = value;
		}
}

REST.log = function(string){
	if(REST.loglevel > 0)
		print(string);
}

REST._complete = function(request, callback){
	REST.log("Request ready state: "+request.readyState);
	if(request.readyState == 4) {
		var entity;
		REST.log("Request status: "+request.status);
		REST.log("Request response: "+request.responseText);
		if(request.status >= 200 && request.status < 300){
			var contentType = request.getResponseHeader("Content-Type");
			if(contentType != null){
				if(REST._isXMLMIME(contentType))
					entity = request.responseXML;
				else if(REST._isJSONMIME(contentType))
					entity = JSON.parse(request.responseText);
				else
					entity = request.responseText;
			}else
				entity = request.responseText;
			var jsonType = request.getResponseHeader("JSON-Type");
			if(jsonType != null){
				if(REST._isJSONMIME(jsonType))
					entity = JSON.parse(request.responseText);
			}
			var Cookie = request.getResponseHeader("Set-GUID");
			if (null != Cookie && "" != Cookie)
			{
				cookiestring = Cookie.split("=")[1];
			}
			jsonType =  null;
			contentType = null;
		}
		REST.log("Calling callback with: "+entity);
		callback(request.status, request, entity);
		entity = null;
		request = null;
		callback = null;
	}
}

REST._isXMLMIME = function(contentType){
	return contentType == "text/xml"
			|| contentType == "application/xml"
			|| (contentType.indexOf("application/") == 0
				&& contentType.lastIndexOf("+xml") == (contentType.length - 4));
}

REST._isJSONMIME = function(contentType){
	return contentType == "application/json"
			|| (contentType.indexOf("application/") == 0
				&& contentType.lastIndexOf("+json") == (contentType.length - 5));
}

/* Encoding */

REST.Encoding = {};

REST.Encoding.hash = function(a){
	var ret = {};
	for(var i=0;i<a.length;i++)
		ret[a[i]] = 1;
	return ret;
}

//
// rules

REST.Encoding.Alpha = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
                       'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

REST.Encoding.Numeric = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

REST.Encoding.AlphaNum = [].concat(REST.Encoding.Alpha, REST.Encoding.Numeric); 

REST.Encoding.AlphaNumHash = REST.Encoding.hash(REST.Encoding.AlphaNum);

/**
 * unreserved = ALPHA / DIGIT / "-" / "." / "_" / "~"
 */
REST.Encoding.Unreserved = [].concat(REST.Encoding.AlphaNum, ['-', '.', '_', '~']);

/**
 * gen-delims = ":" / "/" / "?" / "#" / "[" / "]" / "@"
 */
REST.Encoding.GenDelims = [':', '/', '?', '#', '[', ']', '@'];

/**
 * sub-delims = "!" / "$" / "&" / "'" / "(" / ")" / "*" / "+" / "," / ";" / "="
 */
REST.Encoding.SubDelims = ['!','$','&','\'','(', ')', '*','+',',',';','='];

/**
 * reserved = gen-delims | sub-delims
 */
REST.Encoding.Reserved = [].concat(REST.Encoding.GenDelims, REST.Encoding.SubDelims);

/**
 * pchar = unreserved | escaped | sub-delims | ":" | "@"
 * 
 * Note: we don't allow escaped here since we will escape it ourselves, so we don't want to allow them in the
 * unescaped sequences
 */
REST.Encoding.PChar = [].concat(REST.Encoding.Unreserved, REST.Encoding.SubDelims, [':', '@']);

/**
 * path_segment = pchar <without> ";"
 */
REST.Encoding.PathSegmentHash = REST.Encoding.hash(REST.Encoding.PChar);
delete REST.Encoding.PathSegmentHash[";"];

/**
 * path_param_name = pchar <without> ";" | "="
 */
REST.Encoding.PathParamHash = REST.Encoding.hash(REST.Encoding.PChar);
delete REST.Encoding.PathParamHash[";"];
delete REST.Encoding.PathParamHash["="];

/**
 * path_param_value = pchar <without> ";"
 */
REST.Encoding.PathParamValueHash = REST.Encoding.hash(REST.Encoding.PChar);
delete REST.Encoding.PathParamValueHash[";"];

/**
 * query = pchar / "/" / "?"
 */
REST.Encoding.QueryHash = REST.Encoding.hash([].concat(REST.Encoding.PChar, ['/', '?']));
// deviate from the RFC to disallow separators such as "=", "@" and the famous "+" which is treated as a space
// when decoding
delete REST.Encoding.QueryHash["="];
delete REST.Encoding.QueryHash["&"];
delete REST.Encoding.QueryHash["+"];

/**
 * fragment = pchar / "/" / "?"
 */
REST.Encoding.FragmentHash = REST.Encoding.hash([].concat(REST.Encoding.PChar, ['/', '?']));

// HTTP

REST.Encoding.HTTPSeparators = ["(" , ")" , "<" , ">" , "@"
                                , "," , ";" , ":" , "\\" , "\""
                                , "/" , "[" , "]" , "?" , "="
                                , "{" , "}" , ' ' , '\t'];

// This should also hold the CTLs but we never need them
REST.Encoding.HTTPChar = [];
(function(){
	for(var i=32;i<127;i++)
		REST.Encoding.HTTPChar.push(String.fromCharCode(i));
})()

// CHAR - separators
REST.Encoding.HTTPToken = REST.Encoding.hash(REST.Encoding.HTTPChar);
(function(){
	for(var i=0;i<REST.Encoding.HTTPSeparators.length;i++)
		delete REST.Encoding.HTTPToken[REST.Encoding.HTTPSeparators[i]];
})()

//
// functions

//see http://www.w3.org/TR/html4/interact/forms.html#h-17.13.4.1
//and http://www.apps.ietf.org/rfc/rfc1738.html#page-4
REST.Encoding.encodeFormNameOrValue = function (val){
	return REST.Encoding.encodeValue(val, REST.Encoding.AlphaNumHash, true);
}

//see http://www.w3.org/Protocols/rfc2616/rfc2616-sec4.html#sec4.2
REST.Encoding.encodeHeaderName = function (val){
	// token+ from http://www.w3.org/Protocols/rfc2616/rfc2616-sec2.html#sec2
	
	// There is no way to encode a header name. it is either a valid token or invalid and the 
	// XMLHttpRequest will fail (http://www.w3.org/TR/XMLHttpRequest/#the-setrequestheader-method)
	// What we could do here is throw if the value is invalid
	return val;
}

//see http://www.w3.org/Protocols/rfc2616/rfc2616-sec4.html#sec4.2
REST.Encoding.encodeHeaderValue = function (val){
	// *TEXT or combinations of token, separators, and quoted-string from http://www.w3.org/Protocols/rfc2616/rfc2616-sec2.html#sec2
	// FIXME: implement me. Stef has given up, since it involves latin1, quoted strings, MIME encoding (http://www.ietf.org/rfc/rfc2047.txt)
	// which mentions a limit on encoded value of 75 chars, which should be split into several lines. This is mad.
	return val;
}

// see http://www.ietf.org/rfc/rfc3986.txt
REST.Encoding.encodeQueryParamNameOrValue = function (val){
	return REST.Encoding.encodeValue(val, REST.Encoding.QueryHash);
}

//see http://www.ietf.org/rfc/rfc3986.txt
REST.Encoding.encodePathSegment = function (val){
	return REST.Encoding.encodeValue(val, REST.Encoding.PathSegmentHash);
}

//see http://www.ietf.org/rfc/rfc3986.txt
REST.Encoding.encodePathParamName = function (val){
	return REST.Encoding.encodeValue(val, REST.Encoding.PathParamHash);
}

//see http://www.ietf.org/rfc/rfc3986.txt
REST.Encoding.encodePathParamValue = function (val){
	return REST.Encoding.encodeValue(val, REST.Encoding.PathParamValueHash);
}

REST.Encoding.encodeValue = function (val, allowed, form){
	if(typeof val != "string"){
		REST.log("val is not a string");
		return val;
	}
	if(val.length == 0){
		REST.log("empty string");
		return val;
	}
	var ret = '';
	for(var i=0;i<val.length;i++){
		var first = val[i];
		if(allowed[first] == 1){
			REST.log("char allowed: "+first);
			ret = ret.concat(first);
		}else if(form && (first == ' ' || first == '\n')){
			// special rules for application/x-www-form-urlencoded
			if(first == ' ')
				ret += '+';
			else
				ret += '%0D%0A';
		}else{
			// See http://www.faqs.org/rfcs/rfc2781.html 2.2
			
			// switch to codepoint
			first = val.charCodeAt(i);
			// utf-16 pair?
			if(first < 0xD800 || first > 0xDFFF){
				// just a single utf-16 char
				ret = ret.concat(REST.Encoding.percentUTF8(first));
			}else{
				if(first > 0xDBFF || i+1 >= val.length)
					throw "Invalid UTF-16 value: " + val;
				var second = val.charCodeAt(++i);
				if(second < 0xDC00 || second > 0xDFFF)
					throw "Invalid UTF-16 value: " + val;
				// char = 10 lower bits of first shifted left + 10 lower bits of second 
				var c = ((first & 0x3FF) << 10) | (second & 0x3FF);
				// and add this
				c += 0x10000;
				// char is now 32 bit unicode
				ret = ret.concat(REST.Encoding.percentUTF8(c));
			}
		}
	}
	return ret;
}

// see http://tools.ietf.org/html/rfc3629
REST.Encoding.percentUTF8 = function(c){
	if(c < 0x80)
		return REST.Encoding.percentByte(c);
	if(c < 0x800){
		var first = 0xC0 | ((c & 0x7C0) >> 6);
		var second = 0x80 | (c & 0x3F);
		return REST.Encoding.percentByte(first, second);
	}
	if(c < 0x10000){
		var first = 0xE0 | ((c >> 12) & 0xF);
		var second = 0x80 | ((c >> 6) & 0x3F);
		var third = 0x80 | (c & 0x3F);
		return REST.Encoding.percentByte(first, second, third);
	}
	if(c < 0x110000){
		var first = 0xF0 | ((c >> 18) & 0x7);
		var second = 0x80 | ((c >> 12) & 0x3F);
		var third = 0x80 | ((c >> 6) & 0x3F);
		var fourth = 0x80 | (c & 0x3F);
		return REST.Encoding.percentByte(first, second, third, fourth);
	}
	throw "Invalid character for UTF-8: "+c;
}

REST.Encoding.percentByte = function(){
	var ret = '';
	for(var i=0;i<arguments.length;i++){
		var b = arguments[i];
		if (b >= 0 && b <= 15)
			ret += "%0" + b.toString(16);
		else
			ret += "%" + b.toString(16);
	}
	return ret;
}

REST.serialiseXML = function(node){
	if (typeof XMLSerializer != "undefined")
		return (new XMLSerializer()).serializeToString(node) ;
	else if (node.xml) return node.xml;
	else throw "XML.serialize is not supported or can't serialize " + node;
}
// start JAX-RS API
REST.apiURL = 'http://58.251.159.95:8000/agentgateway/resource/';
var OutBoundTask = {};
// GET /outboundtask/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/outboundtask
OutBoundTask.queryOutBoundTaskByWorkNo = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/outboundtask/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/outboundtask';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /outboundtask/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/outboudrecordbytaskid
OutBoundTask.queryOutBoundRecordByTaskId = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/outboundtask/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/outboudrecordbytaskid';
 if(params.taskid)
  request.addQueryParameter('taskid', params.taskid);
 if(params.querynum)
  request.addQueryParameter('querynum', params.querynum);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
var AgentGroup = {};
// GET /agentgroup/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/grouponvdn
AgentGroup.queryGroupInfoOnVdn = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/agentgroup/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/grouponvdn';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /agentgroup/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/groupbyagent/{workno:[1-9][\d]{0,3}|1[\d]{4}}
AgentGroup.queryGroupInfoByWorkNo = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/agentgroup/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/groupbyagent/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /agentgroup/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/onlineagentonvdn
AgentGroup.queryAllLoginedAgentInfoOnVdn = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/agentgroup/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/onlineagentonvdn';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /agentgroup/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/onlineagentonvdnbyattribute
AgentGroup.queryAllLoginedAgentInfoOnVdnByAttribute = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/agentgroup/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/onlineagentonvdnbyattribute';
 if(params.attribute)
  request.addQueryParameter('attribute', params.attribute);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /agentgroup/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/agentongroup
AgentGroup.queryAllAgentInfoOnMyGroup = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/agentgroup/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/agentongroup';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /agentgroup/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/agentongroupex
AgentGroup.queryAllAgentInfoOnMyGroupEx = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/agentgroup/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/agentongroupex';
 if(params.groupid)
  request.addQueryParameter('groupid', params.groupid);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /agentgroup/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/agentongroupbyattribute
AgentGroup.queryAllAgentInfoOnMyGroupByAttribute = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/agentgroup/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/agentongroupbyattribute';
 if(params.attribute)
  request.addQueryParameter('attribute', params.attribute);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /agentgroup/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/agentbyworkno/{workno:[1-9][\d]{0,3}|1[\d]{4}}
AgentGroup.queryAgentInfoByWorkNo = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/agentgroup/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/agentbyworkno/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /agentgroup/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/issystem
AgentGroup.isSystem = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/agentgroup/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/issystem';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /agentgroup/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/isspymonitor
AgentGroup.isSpyMonitor = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/agentgroup/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/isspymonitor';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /agentgroup/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/isreportmanager
AgentGroup.isReportManager = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/agentgroup/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/isreportmanager';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /agentgroup/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/ispickup
AgentGroup.isPickUp = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/agentgroup/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/ispickup';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /agentgroup/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/ismonitor
AgentGroup.isMonitor = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/agentgroup/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/ismonitor';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /agentgroup/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/iscensor
AgentGroup.isCensor = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/agentgroup/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/iscensor';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /agentgroup/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/iscallout
AgentGroup.isCallOut = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/agentgroup/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/iscallout';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /agentgroup/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/allagentstatus
AgentGroup.getAllStatusAgents = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/agentgroup/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/allagentstatus';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /agentgroup/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/allagentstatusbyattribute
AgentGroup.getAllStatusAgentsByAttribute = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/agentgroup/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/allagentstatusbyattribute';
 if(params.attribute)
  request.addQueryParameter('attribute', params.attribute);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /agentgroup/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/alllocalagentstatus
AgentGroup.getAllStatusLocalAgents = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/agentgroup/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/alllocalagentstatus';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /agentgroup/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/idleagent
AgentGroup.getIdleStatusAgents = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/agentgroup/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/idleagent';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /agentgroup/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/idleagentbyattribute
AgentGroup.getIdleStatusAgentsByAttribute = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/agentgroup/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/idleagentbyattribute';
 if(params.attribute)
  request.addQueryParameter('attribute', params.attribute);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /agentgroup/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/restreason
AgentGroup.getAgentRestReason = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/agentgroup/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/restreason';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /agentgroup/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/allchatagents
AgentGroup.getAllAgentsInTextChat = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/agentgroup/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/allchatagents';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /agentgroup/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/allchatagentsbyattribute
AgentGroup.getAllAgentsInTextChatByAttribute = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/agentgroup/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/allchatagentsbyattribute';
 if(params.attribute)
  request.addQueryParameter('attribute', params.attribute);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /agentgroup/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/agentbyskill/{skillid:[1-9][\d]{0,}}
AgentGroup.queryAgentInfoBySkillId = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/agentgroup/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/agentbyskill/';
 uri += REST.Encoding.encodePathSegment(params.skillid);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /agentgroup/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/agentbyskill/{skillid:[1-9][\d]{0,}}
AgentGroup.queryAgentInfoBySkillIdAndAttribute = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/agentgroup/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/agentbyskill/';
 uri += REST.Encoding.encodePathSegment(params.skillid);
 if(params.attribute)
  request.addQueryParameter('attribute', params.attribute);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /agentgroup/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/agentbyconfigedskill/{skillid:[1-9][\d]{0,}}
AgentGroup.queryAgentInfoByConfigedSkillId = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/agentgroup/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/agentbyconfigedskill/';
 uri += REST.Encoding.encodePathSegment(params.skillid);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /agentgroup/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/agentidsbyskill/{skillid:[1-9][\d]{0,}}
AgentGroup.queryAgentIdsBySkillId = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/agentgroup/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/agentidsbyskill/';
 uri += REST.Encoding.encodePathSegment(params.skillid);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /agentgroup/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/agentbyconfigedskillandattribute/{skillid:[1-9][\d]{0,}}
AgentGroup.queryAgentInfoByConfigedSkillIdAndAttribute = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/agentgroup/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/agentbyconfigedskillandattribute/';
 uri += REST.Encoding.encodePathSegment(params.skillid);
 if(params.attribute)
  request.addQueryParameter('attribute', params.attribute);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /agentgroup/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/loggedinagentphoneonvdn
AgentGroup.queryAllLoggedInAgentPhonesOnVdn = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/agentgroup/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/loggedinagentphoneonvdn';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /agentgroup/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/agentwasnameonvdn
AgentGroup.queryAllAgentWasNameOnVdn = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/agentgroup/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/agentwasnameonvdn';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /agentgroup/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/agentinfonoskills
AgentGroup.queryAgentInfoWithoutSkills = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/agentgroup/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/agentinfonoskills';
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /agentgroup/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/agentrestinfo
AgentGroup.queryAgentRestDetailInfo = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/agentgroup/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/agentrestinfo';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
var VoiceRecordEmployee = {};
// PUT /voicerecordemployee/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/createemployee
VoiceRecordEmployee.createEmployee = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('PUT');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/voicerecordemployee/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/createemployee';
 if(params.callid)
  request.addQueryParameter('callid', params.callid);
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /voicerecordemployee/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/queryemployeebycallid
VoiceRecordEmployee.queryEmployeeByCallId = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/voicerecordemployee/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/queryemployeebycallid';
 if(params.callid)
  request.addQueryParameter('callid', params.callid);
 if(params.language)
  request.addQueryParameter('language', params.language);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /voicerecordemployee/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/querydisplaynameofivrkey
VoiceRecordEmployee.queryDisplayNameOfIvrKey = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/voicerecordemployee/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/querydisplaynameofivrkey';
 if(params.language)
  request.addQueryParameter('language', params.language);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
var Question = {};
// GET /question/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/questionbyskill
Question.queryQuestionInfoBySkillName = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/question/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/questionbyskill';
 if(params.vdnid)
  request.addQueryParameter('vdnid', params.vdnid);
 if(params.skillname)
  request.addQueryParameter('skillname', params.skillname);
 if(params.opportunity)
  request.addQueryParameter('opportunity', params.opportunity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /question/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/questiontitlebyskill
Question.queryQuestionTitleBySkillName = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/question/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/questiontitlebyskill';
 if(params.vdnid)
  request.addQueryParameter('vdnid', params.vdnid);
 if(params.skillname)
  request.addQueryParameter('skillname', params.skillname);
 if(params.opportunity)
  request.addQueryParameter('opportunity', params.opportunity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /question/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/detailquestion
Question.queryDetailQuestionInfo = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/question/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/detailquestion';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /question/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/allquestion
Question.queryAllQuestionInfo = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/question/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/allquestion';
 if(params.opportunity)
  request.addQueryParameter('opportunity', params.opportunity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /question/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/querypopupquestiontitle
Question.queryPopUpQuestionTitle = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/question/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/querypopupquestiontitle';
 if(params.wasskillid)
  request.addQueryParameter('wasskillid', params.wasskillid);
 if(params.opportunity)
  request.addQueryParameter('opportunity', params.opportunity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /question/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/questionbyid
Question.queryQuestionInfoByID = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/question/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/questionbyid';
 if(params.id)
  request.addQueryParameter('id', params.id);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// PUT /question/{agentid:[1-9][\d]{0,3}|1[\d]{4}}
Question.submitQuestion = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('PUT');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/question/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /question/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/querycustomizeworksheetinfo
Question.queryCustomizeWorksheetInfo = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/question/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/querycustomizeworksheetinfo';
 if(params.wasskillid)
  request.addQueryParameter('wasskillid', params.wasskillid);
 if(params.opportunity)
  request.addQueryParameter('opportunity', params.opportunity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
var AuthorizationRequestService = {};
// GET /authorize
AuthorizationRequestService.authorize = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/authorize';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/xhtml+xml,text/html,application/xml,application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
var OAuthDefaultServices = {};
// GET /authorize
OAuthDefaultServices.authorize = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/authorize';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/xhtml+xml,text/html,application/xml,application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
var RedirectionBasedGrantService = {};
// GET /
RedirectionBasedGrantService.authorize = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/xhtml+xml,text/html,application/xml,application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /authorize/decision
AuthorizationRequestService.authorizeDecision = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/authorize/decision';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/xhtml+xml,text/html,application/xml;qs=0.9,application/json;qs=0.9,application/x-www-form-urlencoded');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /authorize/decision
AuthorizationRequestService.authorizeDecisionForm = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/authorize/decision';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/xhtml+xml,text/html,application/xml;qs=0.9,application/json;qs=0.9,application/x-www-form-urlencoded');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/x-www-form-urlencoded');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /authorize/decision
OAuthDefaultServices.authorizeDecision = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/authorize/decision';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /authorize/decision
OAuthDefaultServices.authorizeDecisionForm = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/authorize/decision';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/x-www-form-urlencoded');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /decision
RedirectionBasedGrantService.authorizeDecision = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/decision';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /decision
RedirectionBasedGrantService.authorizeDecisionForm = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/decision';
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/x-www-form-urlencoded');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
var FileDownLoadRest = {};
// GET /filedownload/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/webmsgrecordfiledownload
FileDownLoadRest.webMsgRecordFileDownLoad = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/filedownload/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/webmsgrecordfiledownload';
 if(params.callId)
  request.addQueryParameter('callId', params.callId);
 if(params.startTime)
  request.addQueryParameter('startTime', params.startTime);
 if(params.endTime)
  request.addQueryParameter('endTime', params.endTime);
 if(params.fileType)
  request.addQueryParameter('fileType', params.fileType);
 if(params.fileName)
  request.addQueryParameter('fileName', params.fileName);
 if(params.zoneOffset)
  request.addQueryParameter('zoneOffset', params.zoneOffset);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /filedownload/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/webmsgrecordfiledownloadex
FileDownLoadRest.webMsgRecordFileDownLoadEx = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/filedownload/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/webmsgrecordfiledownloadex';
 if(params.startDate)
  request.addQueryParameter('startDate', params.startDate);
 if(params.endDate)
  request.addQueryParameter('endDate', params.endDate);
 if(params.fileType)
  request.addQueryParameter('fileType', params.fileType);
 if(params.fileName)
  request.addQueryParameter('fileName', params.fileName);
 if(params.zoneOffset)
  request.addQueryParameter('zoneOffset', params.zoneOffset);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /filedownload/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/inboundcallrecordfiledownload
FileDownLoadRest.inboundCallRecordFileDownLoad = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/filedownload/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/inboundcallrecordfiledownload';
 if(params.phoneNo)
  request.addQueryParameter('phoneNo', params.phoneNo);
 if(params.beginTime)
  request.addQueryParameter('beginTime', params.beginTime);
 if(params.endTime)
  request.addQueryParameter('endTime', params.endTime);
 if(params.fileType)
  request.addQueryParameter('fileType', params.fileType);
 if(params.fileName)
  request.addQueryParameter('fileName', params.fileName);
 if(params.zoneOffset)
  request.addQueryParameter('zoneOffset', params.zoneOffset);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /filedownload/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/exportdispcoderesult
FileDownLoadRest.exportDispcodeResult = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/filedownload/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/exportdispcoderesult';
 if(params.phoneNo)
  request.addQueryParameter('phoneNo', params.phoneNo);
 if(params.beginTime)
  request.addQueryParameter('beginTime', params.beginTime);
 if(params.endTime)
  request.addQueryParameter('endTime', params.endTime);
 if(params.fileType)
  request.addQueryParameter('fileType', params.fileType);
 if(params.fileName)
  request.addQueryParameter('fileName', params.fileName);
 if(params.callType)
  request.addQueryParameter('callType', params.callType);
 if(params.zoneOffset)
  request.addQueryParameter('zoneOffset', params.zoneOffset);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
var SnsPublishData = {};
// PUT /snspublishdata/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/send
SnsPublishData.send = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('PUT');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/snspublishdata/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/send';
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /snspublishdata/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/queryauditlist
SnsPublishData.queryAuditDataByPage = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/snspublishdata/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/queryauditlist';
 if(params.sort)
  request.addQueryParameter('sort', params.sort);
 if(params.content)
  request.addQueryParameter('content', params.content);
 if(params.currentpage)
  request.addQueryParameter('currentpage', params.currentpage);
 if(params.rowsperpage)
  request.addQueryParameter('rowsperpage', params.rowsperpage);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /snspublishdata/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/querybyagent
SnsPublishData.queryPublishMsgListByPage = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/snspublishdata/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/querybyagent';
 if(params.type)
  request.addQueryParameter('type', params.type);
 if(params.content)
  request.addQueryParameter('content', params.content);
 if(params.from)
  request.addQueryParameter('from', params.from);
 if(params.state)
  request.addQueryParameter('state', params.state);
 if(params.sort)
  request.addQueryParameter('sort', params.sort);
 if(params.currentpage)
  request.addQueryParameter('currentpage', params.currentpage);
 if(params.rowsperpage)
  request.addQueryParameter('rowsperpage', params.rowsperpage);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /snspublishdata/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/publishdata/{publishid}
SnsPublishData.getPublishDetails = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/snspublishdata/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/publishdata/';
 uri += REST.Encoding.encodePathSegment(params.publishid);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /snspublishdata/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/replydata/{dataid}
SnsPublishData.getReplyDataByDataId = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/snspublishdata/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/replydata/';
 uri += REST.Encoding.encodePathSegment(params.dataid);
 if(params.datatype)
  request.addQueryParameter('datatype', params.datatype);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /snspublishdata/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/reply/{socialdataid}/replytype/{replytype}/replyparam/{replyparam}
SnsPublishData.replyDataById = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/snspublishdata/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/reply/';
 uri += REST.Encoding.encodePathSegment(params.socialdataid);
 uri += '/replytype/';
 uri += REST.Encoding.encodePathSegment(params.replytype);
 uri += '/replyparam/';
 uri += REST.Encoding.encodePathSegment(params.replyparam);
 if(params.replyvalue)
  request.addQueryParameter('replyvalue', params.replyvalue);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /snspublishdata/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/audit/{publishdataid}/state/{state}
SnsPublishData.auditDataById = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/snspublishdata/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/audit/';
 uri += REST.Encoding.encodePathSegment(params.publishdataid);
 uri += '/state/';
 uri += REST.Encoding.encodePathSegment(params.state);
 if(params.auditfailedreason)
  request.addQueryParameter('auditfailedreason', params.auditfailedreason);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /snspublishdata/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/republish/{publishdataid}/isreply/{isreply}
SnsPublishData.republish = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/snspublishdata/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/republish/';
 uri += REST.Encoding.encodePathSegment(params.publishdataid);
 uri += '/isreply/';
 uri += REST.Encoding.encodePathSegment(params.isreply);
 if(params.refdataid)
  request.addQueryParameter('refdataid', params.refdataid);
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /snspublishdata/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/replyhistorylistbypage
SnsPublishData.queryReplyHistoryListByPage = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/snspublishdata/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/replyhistorylistbypage';
 if(params.replycontent)
  request.addQueryParameter('replycontent', params.replycontent);
 if(params.originalcontent)
  request.addQueryParameter('originalcontent', params.originalcontent);
 if(params.starttime)
  request.addQueryParameter('starttime', params.starttime);
 if(params.endtime)
  request.addQueryParameter('endtime', params.endtime);
 if(params.currentpage)
  request.addQueryParameter('currentpage', params.currentpage);
 if(params.rowsperpage)
  request.addQueryParameter('rowsperpage', params.rowsperpage);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
var QueryMonitor = {};
// GET /querymonitor/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/servertime
QueryMonitor.queryServerTime = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/querymonitor/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/servertime';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /querymonitor/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/systemversion
QueryMonitor.querySysVersion = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/querymonitor/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/systemversion';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /querymonitor/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/systemstate
QueryMonitor.querySystemStateInfo = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/querymonitor/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/systemstate';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /querymonitor/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/changetosapmode
QueryMonitor.changeToSAPMode = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/querymonitor/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/changetosapmode';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /querymonitor/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/clusterinfo
QueryMonitor.queryClusterInfo = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/querymonitor/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/clusterinfo';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /querymonitor/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/agentclusterinfo/{workno:[1-9][\d]{0,3}|1[\d]{4}}
QueryMonitor.queryAgentClusterInfo = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/querymonitor/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/agentclusterinfo/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /querymonitor/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/allagentclusterinfo
QueryMonitor.queryAllAgentClusterInfo = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/querymonitor/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/allagentclusterinfo';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /querymonitor/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/clusterinfobyname/{clustername}
QueryMonitor.queryClusterInfoByName = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/querymonitor/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/clusterinfobyname/';
 uri += REST.Encoding.encodePathSegment(params.clustername);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /querymonitor/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/skillstatisticinfo/{skillid:[1-9][\d]{0,}}
QueryMonitor.querySkillsStatisticInfo = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/querymonitor/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/skillstatisticinfo/';
 uri += REST.Encoding.encodePathSegment(params.skillid);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /querymonitor/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/setagenttimeout/{flag}
QueryMonitor.setAgentTimeOut = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/querymonitor/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/setagenttimeout/';
 uri += REST.Encoding.encodePathSegment(params.flag);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /querymonitor/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/setmaxchatnum/{vdnid:[0-9][\d]{0,}}/{chatnum:[0-9][\d]{0,}}
QueryMonitor.setMaxChatNum = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/querymonitor/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/setmaxchatnum/';
 uri += REST.Encoding.encodePathSegment(params.vdnid);
 uri += '/';
 uri += REST.Encoding.encodePathSegment(params.chatnum);
 if(params.agents)
  request.addQueryParameter('agents', params.agents);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
var TextChatStats = {};
// POST /textstats/{workno:[1-9][\d]{0,3}|1[\d]{4}}/emailstats
TextChatStats.emailStats = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textstats/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/emailstats';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /textstats/{workno:[1-9][\d]{0,3}|1[\d]{4}}/onlinemsgstats
TextChatStats.onlinMessageStats = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textstats/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/onlinemsgstats';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
var AppointRest = {};
// PUT /appoint/{agentid:[1-9][\d]{0,3}|1[\d]{4}}
AppointRest.setAppoint = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('PUT');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/appoint/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /appoint/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/appointsbyagent
AppointRest.getAppointsByAgentNo = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/appoint/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/appointsbyagent';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /appoint/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/{appointId:[\d]{1,5}}/appointbyid
AppointRest.getAppointById = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/appoint/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/';
 uri += REST.Encoding.encodePathSegment(params.appointId);
 uri += '/appointbyid';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /appoint/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/appointstoagent
AppointRest.getAppointsToAgent = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/appoint/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/appointstoagent';
 if(params.begindate)
  request.addQueryParameter('begindate', params.begindate);
 if(params.enddate)
  request.addQueryParameter('enddate', params.enddate);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /appoint/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/currentpage/{currentPage}/rowsperpage/{rowsPerPage}/appointstoagentbypage
AppointRest.getAppointsToAgentByPage = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/appoint/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/currentpage/';
 uri += REST.Encoding.encodePathSegment(params.currentPage);
 uri += '/rowsperpage/';
 uri += REST.Encoding.encodePathSegment(params.rowsPerPage);
 uri += '/appointstoagentbypage';
 if(params.begindate)
  request.addQueryParameter('begindate', params.begindate);
 if(params.enddate)
  request.addQueryParameter('enddate', params.enddate);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /appoint/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/{wasVdnId:[\d]{1,5}}/appointstoskill
AppointRest.getAppointsToSkill = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/appoint/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/';
 uri += REST.Encoding.encodePathSegment(params.wasVdnId);
 uri += '/appointstoskill';
 if(params.wasSkillName)
  request.addQueryParameter('wasSkillName', params.wasSkillName);
 if(params.begindate)
  request.addQueryParameter('begindate', params.begindate);
 if(params.enddate)
  request.addQueryParameter('enddate', params.enddate);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /appoint/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/{wasVdnId:[\d]{1,5}}/currentpage/{currentPage}/rowsperpage/{rowsPerPage}/appointstoskill
AppointRest.getAppointsToSkillByPage = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/appoint/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/';
 uri += REST.Encoding.encodePathSegment(params.wasVdnId);
 uri += '/currentpage/';
 uri += REST.Encoding.encodePathSegment(params.currentPage);
 uri += '/rowsperpage/';
 uri += REST.Encoding.encodePathSegment(params.rowsPerPage);
 uri += '/appointstoskill';
 if(params.wasSkillName)
  request.addQueryParameter('wasSkillName', params.wasSkillName);
 if(params.begindate)
  request.addQueryParameter('begindate', params.begindate);
 if(params.enddate)
  request.addQueryParameter('enddate', params.enddate);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// DELETE /appoint/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/{appointId:[\d]{1,5}}
AppointRest.deleteAppointById = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('DELETE');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/appoint/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/';
 uri += REST.Encoding.encodePathSegment(params.appointId);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
var OnlineAgent = {};
// PUT /onlineagent/{agentid:[1-9][\d]{0,3}|1[\d]{4}}
OnlineAgent.login = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('PUT');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/onlineagent/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// DELETE /onlineagent/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/logout
OnlineAgent.logout = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('DELETE');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/onlineagent/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/logout';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// PUT /onlineagent/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/loginex
OnlineAgent.loginEx = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('PUT');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/onlineagent/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/loginex';
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// PUT /onlineagent/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/forcelogin
OnlineAgent.forceLogin = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('PUT');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/onlineagent/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/forcelogin';
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// PUT /onlineagent/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/forceloginex
OnlineAgent.forceLoginEx = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('PUT');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/onlineagent/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/forceloginex';
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// PUT /onlineagent/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/forceloginexwithoutphone
OnlineAgent.forceLoginExWithoutPhone = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('PUT');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/onlineagent/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/forceloginexwithoutphone';
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// DELETE /onlineagent/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/forcelogout
OnlineAgent.forceLogout = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('DELETE');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/onlineagent/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/forcelogout';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// DELETE /onlineagent/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/forcelogoutwithreason/{reason:[1-9]|[1-9][0-9]|2[5][0-5]|2[0-4][0-9]|1[\d]{2}}
OnlineAgent.forceLogoutWithReason = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('DELETE');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/onlineagent/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/forcelogoutwithreason/';
 uri += REST.Encoding.encodePathSegment(params.reason);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /onlineagent/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/autoanswer/{isautoanswer}
OnlineAgent.setAgentAutoAnswer = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/onlineagent/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/autoanswer/';
 uri += REST.Encoding.encodePathSegment(params.isautoanswer);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /onlineagent/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/saybusy
OnlineAgent.sayBusy = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/onlineagent/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/saybusy';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /onlineagent/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/sayfree
OnlineAgent.sayFree = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/onlineagent/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/sayfree';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /onlineagent/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/rest/{time:[1-9][\d]{0,3}|[1-7][\d]{4}|8[0-5][0-9][0-9][0-9]|86[0-3][0-9][0-9]}/{restcause:[0-9]|[1-9][0-9]|2[5][0-5]|2[0-4][0-9]|1[\d]{2}}
OnlineAgent.rest = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/onlineagent/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/rest/';
 uri += REST.Encoding.encodePathSegment(params.time);
 uri += '/';
 uri += REST.Encoding.encodePathSegment(params.restcause);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /onlineagent/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/cancelrest
OnlineAgent.cancelRest = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/onlineagent/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/cancelrest';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /onlineagent/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/cancelwork
OnlineAgent.cancelWork = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/onlineagent/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/cancelwork';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /onlineagent/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/cancelbusy
OnlineAgent.cancelBusy = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/onlineagent/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/cancelbusy';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /onlineagent/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/work
OnlineAgent.sayWork = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/onlineagent/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/work';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /onlineagent/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/agentskills
OnlineAgent.queryAgentSkills = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/onlineagent/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/agentskills';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /onlineagent/{agentid}/modifyaccountpwd
OnlineAgent.modifyAccountPwd = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/onlineagent/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/modifyaccountpwd';
 if(params.oldpassword)
  request.addQueryParameter('oldpassword', params.oldpassword);
 if(params.newpassword)
  request.addQueryParameter('newpassword', params.newpassword);
 if(params.repassword)
  request.addQueryParameter('repassword', params.repassword);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /onlineagent/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/setforwarding
OnlineAgent.setForwarding = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/onlineagent/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/setforwarding';
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /onlineagent/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/autoenteridle/{flag}
OnlineAgent.setAgentAutoEnterIdle = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/onlineagent/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/autoenteridle/';
 uri += REST.Encoding.encodePathSegment(params.flag);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /onlineagent/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/resetskill/{autoflag}
OnlineAgent.resetSkill = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/onlineagent/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/resetskill/';
 uri += REST.Encoding.encodePathSegment(params.autoflag);
 if(params.skillid)
  request.addQueryParameter('skillid', params.skillid);
 if(params.phonelinkage)
  request.addQueryParameter('phonelinkage', params.phonelinkage);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /onlineagent/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/bindphone
OnlineAgent.bindAgentPhone = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/onlineagent/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/bindphone';
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /onlineagent/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/setselfrecord/{recordflag:[0]|[1]}/{recordbeforetalking:[0]|[1]}
OnlineAgent.setAgentSelfRecord = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/onlineagent/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/setselfrecord/';
 uri += REST.Encoding.encodePathSegment(params.recordflag);
 uri += '/';
 uri += REST.Encoding.encodePathSegment(params.recordbeforetalking);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /onlineagent/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/notifybulletin
OnlineAgent.notifyBulletin = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/onlineagent/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/notifybulletin';
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /onlineagent/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/sendnotelet/{receiver:.{1,}}
OnlineAgent.sendNotelet = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/onlineagent/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/sendnotelet/';
 uri += REST.Encoding.encodePathSegment(params.receiver);
 if(params.content)
  request.addQueryParameter('content', params.content);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /onlineagent/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/privateconfig
OnlineAgent.getPrivateConfig = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/onlineagent/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/privateconfig';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /onlineagent/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/privateconfig
OnlineAgent.putPrivateConfig = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/onlineagent/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/privateconfig';
 if(params.config)
  request.addQueryParameter('config', params.config);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /onlineagent/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/agentskillsbyworkno/{workno:[1-9][\d]{0,3}|1[\d]{4}}
OnlineAgent.queryAgentSkillsByWorkNo = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/onlineagent/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/agentskillsbyworkno/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /onlineagent/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/settalkright
OnlineAgent.setTalkRight = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/onlineagent/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/settalkright';
 if(params.flag)
  request.addQueryParameter('flag', params.flag);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
var VideoPlay = {};
// POST /videoplay/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/sendvideoattach
VideoPlay.sendVideoAttach = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/videoplay/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/sendvideoattach';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('text/plain; charset=utf-8');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /videoplay/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/startplaymmfiletouser
VideoPlay.startPlayMMFileToUser = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/videoplay/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/startplaymmfiletouser';
 if(params.callid)
  request.addQueryParameter('callid', params.callid);
 if(params.filetype)
  request.addQueryParameter('filetype', params.filetype);
 if(params.playtimes)
  request.addQueryParameter('playtimes', params.playtimes);
 if(params.position)
  request.addQueryParameter('position', params.position);
 if(params.playtoagentflag)
  request.addQueryParameter('playtoagentflag', params.playtoagentflag);
 if(params.filename)
  request.addQueryParameter('filename', params.filename);
 if(params.videofileid)
  request.addQueryParameter('videofileid', params.videofileid);
 if(params.customerphone)
  request.addQueryParameter('customerphone', params.customerphone);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /videoplay/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/stopplaymmfiletouser
VideoPlay.stopPlayMMFileToUser = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/videoplay/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/stopplaymmfiletouser';
 if(params.callid)
  request.addQueryParameter('callid', params.callid);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /videoplay/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/queryvideofilelist
VideoPlay.queryVideoFileList = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/videoplay/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/queryvideofilelist';
 if(params.filename)
  request.addQueryParameter('filename', params.filename);
 if(params.customerphone)
  request.addQueryParameter('customerphone', params.customerphone);
 if(params.startuploadtime)
  request.addQueryParameter('startuploadtime', params.startuploadtime);
 if(params.enduploadtime)
  request.addQueryParameter('enduploadtime', params.enduploadtime);
 if(params.startposition)
  request.addQueryParameter('startposition', params.startposition);
 if(params.endposition)
  request.addQueryParameter('endposition', params.endposition);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /videoplay/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/deletevideofile
VideoPlay.deleteVideoFile = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/videoplay/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/deletevideofile';
 if(params.videofileid)
  request.addQueryParameter('videofileid', params.videofileid);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /videoplay/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/queryvideofileplaylist
VideoPlay.queryVideoFilePlayList = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/videoplay/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/queryvideofileplaylist';
 if(params.videofileid)
  request.addQueryParameter('videofileid', params.videofileid);
 if(params.customerphone)
  request.addQueryParameter('customerphone', params.customerphone);
 if(params.startplaytime)
  request.addQueryParameter('startplaytime', params.startplaytime);
 if(params.endplaytime)
  request.addQueryParameter('endplaytime', params.endplaytime);
 if(params.startposition)
  request.addQueryParameter('startposition', params.startposition);
 if(params.endposition)
  request.addQueryParameter('endposition', params.endposition);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /
RedirectionBasedGrantService.authorize = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/xhtml+xml,text/html,application/xml,application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /decision
RedirectionBasedGrantService.authorizeDecision = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/decision';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /decision
RedirectionBasedGrantService.authorizeDecisionForm = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/decision';
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/x-www-form-urlencoded');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
var Knowledge = {};
// GET /knowledge/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/indexlist
Knowledge.queryKnowledgeIndexList = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/knowledge/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/indexlist';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /knowledge/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/queryknowledgeitem
Knowledge.queryKnowledgeItem = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/knowledge/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/queryknowledgeitem';
 if(params.title)
  request.addQueryParameter('title', params.title);
 if(params.indexid)
  request.addQueryParameter('indexid', params.indexid);
 if(params.startposition)
  request.addQueryParameter('startposition', params.startposition);
 if(params.endposition)
  request.addQueryParameter('endposition', params.endposition);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /knowledge/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/queryknowledgeitemsdetail
Knowledge.queryKnowledgeItemsDetail = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/knowledge/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/queryknowledgeitemsdetail';
 if(params.id)
  request.addQueryParameter('id', params.id);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /initiate
OAuthDefaultServices.getRequestToken = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/initiate';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/x-www-form-urlencoded');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /initiate
OAuthDefaultServices.getRequestTokenWithGET = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/initiate';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/x-www-form-urlencoded');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
var RequestTokenService = {};
// POST /initiate
RequestTokenService.getRequestToken = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/initiate';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/x-www-form-urlencoded');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /initiate
RequestTokenService.getRequestTokenWithGET = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/initiate';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/x-www-form-urlencoded');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /token
OAuthDefaultServices.getAccessTokenWithGET = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/token';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/x-www-form-urlencoded');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /token
OAuthDefaultServices.getAccessToken = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/token';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/x-www-form-urlencoded');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
var AccessTokenService = {};
// GET /token
AccessTokenService.getAccessTokenWithGET = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/token';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/x-www-form-urlencoded');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /token
AccessTokenService.getAccessToken = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/token';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/x-www-form-urlencoded');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /token
AccessTokenService.handleTokenRequest = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/token';
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/x-www-form-urlencoded');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
var RecordPlayVoice = {};
// PUT /recordplay/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/record
RecordPlayVoice.beginRecord = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('PUT');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/recordplay/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/record';
 if(params.filename)
  request.addQueryParameter('filename', params.filename);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// PUT /recordplay/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/recordwithoutfilename
RecordPlayVoice.beginRecordWithoutFilename = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('PUT');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/recordplay/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/recordwithoutfilename';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /recordplay/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/pauserecord
RecordPlayVoice.pauseRecord = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/recordplay/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/pauserecord';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /recordplay/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/resumerecord
RecordPlayVoice.resumeRecord = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/recordplay/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/resumerecord';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// DELETE /recordplay/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/stoprecord
RecordPlayVoice.stopRecord = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('DELETE');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/recordplay/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/stoprecord';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// PUT /recordplay/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/play
RecordPlayVoice.beginPlay = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('PUT');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/recordplay/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/play';
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /recordplay/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/pauseplay
RecordPlayVoice.pausePlay = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/recordplay/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/pauseplay';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /recordplay/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/resumeplay
RecordPlayVoice.resumePlay = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/recordplay/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/resumeplay';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /recordplay/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/forefast/{time:[1-9][\d]{0,}}
RecordPlayVoice.foreFastPlay = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/recordplay/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/forefast/';
 uri += REST.Encoding.encodePathSegment(params.time);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /recordplay/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/backfast/{time:[1-9][\d]{0,}}
RecordPlayVoice.backFastPlay = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/recordplay/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/backfast/';
 uri += REST.Encoding.encodePathSegment(params.time);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// DELETE /recordplay/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/stopplay
RecordPlayVoice.stopPlay = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('DELETE');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/recordplay/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/stopplay';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /recordplay/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/recordfile
RecordPlayVoice.queryRecordFile = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/recordplay/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/recordfile';
 if(params.workno)
  request.addQueryParameter('workno', params.workno);
 if(params.skillid)
  request.addQueryParameter('skillid', params.skillid);
 if(params.startdate)
  request.addQueryParameter('startdate', params.startdate);
 if(params.enddate)
  request.addQueryParameter('enddate', params.enddate);
 if(params.startposition)
  request.addQueryParameter('startposition', params.startposition);
 if(params.endposition)
  request.addQueryParameter('endposition', params.endposition);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /recordplay/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/queryselfrecordfile
RecordPlayVoice.querySelfRecordFile = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/recordplay/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/queryselfrecordfile';
 if(params.skillid)
  request.addQueryParameter('skillid', params.skillid);
 if(params.startdate)
  request.addQueryParameter('startdate', params.startdate);
 if(params.enddate)
  request.addQueryParameter('enddate', params.enddate);
 if(params.startposition)
  request.addQueryParameter('startposition', params.startposition);
 if(params.endposition)
  request.addQueryParameter('endposition', params.endposition);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /recordplay/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/queryrecordfilebycallid
RecordPlayVoice.queryRecordFileByCallId = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/recordplay/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/queryrecordfilebycallid';
 if(params.workno)
  request.addQueryParameter('workno', params.workno);
 if(params.callid)
  request.addQueryParameter('callid', params.callid);
 if(params.calltime)
  request.addQueryParameter('calltime', params.calltime);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /recordplay/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/recordfileurl
RecordPlayVoice.queryRecordFileURL = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/recordplay/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/recordfileurl';
 if(params.filepath)
  request.addQueryParameter('filepath', params.filepath);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /recordplay/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/recordzipfileurl
RecordPlayVoice.queryRecordZipFileURL = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/recordplay/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/recordzipfileurl';
 if(params.filepath)
  request.addQueryParameter('filepath', params.filepath);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /recordplay/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/batchrecordzipfileurl
RecordPlayVoice.queryBatchRecordZipFileURL = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/recordplay/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/batchrecordzipfileurl';
 if(params.filepath)
  request.addQueryParameter('filepath', params.filepath);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /recordplay/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/recordfilefromrecordid
RecordPlayVoice.queryRecordFileFromRecordID = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/recordplay/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/recordfilefromrecordid';
 if(params.recordid)
  request.addQueryParameter('recordid', params.recordid);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /recordplay/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/queryrecordscore
RecordPlayVoice.queryVoiceRecordScore = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/recordplay/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/queryrecordscore';
 if(params.workno)
  request.addQueryParameter('workno', params.workno);
 if(params.recordstartdate)
  request.addQueryParameter('recordstartdate', params.recordstartdate);
 if(params.recordenddate)
  request.addQueryParameter('recordenddate', params.recordenddate);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
var QualityControl = {};
// POST /qualitycontrol/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/forcebusy/{workNo:[1-9][\d]{0,3}|1[\d]{4}}
QualityControl.forceBusy = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/qualitycontrol/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/forcebusy/';
 uri += REST.Encoding.encodePathSegment(params.workNo);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /qualitycontrol/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/forceidle/{workNo:[1-9][\d]{0,3}|1[\d]{4}}
QualityControl.forceIdle = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/qualitycontrol/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/forceidle/';
 uri += REST.Encoding.encodePathSegment(params.workNo);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /qualitycontrol/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/forcerest/{workNo:[1-9][\d]{0,3}|1[\d]{4}}/{time}/{reason}
QualityControl.forceRest = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/qualitycontrol/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/forcerest/';
 uri += REST.Encoding.encodePathSegment(params.workNo);
 uri += '/';
 uri += REST.Encoding.encodePathSegment(params.time);
 uri += '/';
 uri += REST.Encoding.encodePathSegment(params.reason);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /qualitycontrol/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/forcelogout/{workNo:[1-9][\d]{0,3}|1[\d]{4}}
QualityControl.forceLogOutAgent = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/qualitycontrol/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/forcelogout/';
 uri += REST.Encoding.encodePathSegment(params.workNo);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /qualitycontrol/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/forcedropcall/{callid:.{1,}}
QualityControl.forceDropCall = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/qualitycontrol/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/forcedropcall/';
 uri += REST.Encoding.encodePathSegment(params.callid);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// PUT /qualitycontrol/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/addsupervise/{workNo:[1-9][\d]{0,3}|1[\d]{4}}
QualityControl.addSupervise = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('PUT');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/qualitycontrol/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/addsupervise/';
 uri += REST.Encoding.encodePathSegment(params.workNo);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// PUT /qualitycontrol/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/addinsert/{workNo:[1-9][\d]{0,3}|1[\d]{4}}
QualityControl.addInsert = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('PUT');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/qualitycontrol/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/addinsert/';
 uri += REST.Encoding.encodePathSegment(params.workNo);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /qualitycontrol/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/switch/{workNo:[1-9][\d]{0,3}|1[\d]{4}}
QualityControl.switchSuperviseOrInsert = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/qualitycontrol/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/switch/';
 uri += REST.Encoding.encodePathSegment(params.workNo);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// DELETE /qualitycontrol/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/{workNo:[1-9][\d]{0,3}|1[\d]{4}}
QualityControl.stopSuperviseOrInsert = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('DELETE');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/qualitycontrol/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/';
 uri += REST.Encoding.encodePathSegment(params.workNo);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// PUT /qualitycontrol/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/intercept/{workNo:[1-9][\d]{0,3}|1[\d]{4}}
QualityControl.intercept = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('PUT');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/qualitycontrol/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/intercept/';
 uri += REST.Encoding.encodePathSegment(params.workNo);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /qualitycontrol/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/allagent
QualityControl.queryAllMonitoredAgents = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/qualitycontrol/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/allagent';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /qualitycontrol/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/setselfrecord/{recordflag:[0]|[1]}/{recordbeforetalking:[0]|[1]}
QualityControl.qcSetAgentSelfRecord = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/qualitycontrol/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/setselfrecord/';
 uri += REST.Encoding.encodePathSegment(params.recordflag);
 uri += '/';
 uri += REST.Encoding.encodePathSegment(params.recordbeforetalking);
 if(params.agents)
  request.addQueryParameter('agents', params.agents);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /qualitycontrol/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/cancelselfrecord
QualityControl.qcCancelAgentSelfRecord = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/qualitycontrol/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/cancelselfrecord';
 if(params.agents)
  request.addQueryParameter('agents', params.agents);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /qualitycontrol/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/beginmonitor
QualityControl.beginMonitor = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/qualitycontrol/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/beginmonitor';
 if(params.agents)
  request.addQueryParameter('agents', params.agents);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /qualitycontrol/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/endmonitor
QualityControl.endMonitor = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/qualitycontrol/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/endmonitor';
 if(params.agents)
  request.addQueryParameter('agents', params.agents);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /qualitycontrol/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/forcerecord
QualityControl.forceRecord = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/qualitycontrol/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/forcerecord';
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /qualitycontrol/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/forcestoprecord
QualityControl.forceStopRecord = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/qualitycontrol/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/forcestoprecord';
 if(params.agents)
  request.addQueryParameter('agents', params.agents);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /qualitycontrol/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/registerDataToServer
QualityControl.registerDataToServer = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/qualitycontrol/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/registerDataToServer';
 if(params.port)
  request.addQueryParameter('port', params.port);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /qualitycontrol/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/startVideoMonitor
QualityControl.startVideoMonitor = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/qualitycontrol/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/startVideoMonitor';
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /qualitycontrol/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/stopVideoMonitor
QualityControl.stopVideoMonitor = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/qualitycontrol/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/stopVideoMonitor';
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /qualitycontrol/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/startOrStopVideoPlay
QualityControl.startOrStopVideoPlay = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/qualitycontrol/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/startOrStopVideoPlay';
 if(params.monitoragent)
  request.addQueryParameter('monitoragent', params.monitoragent);
 if(params.isstart)
  request.addQueryParameter('isstart', params.isstart);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /qualitycontrol/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/deleteVideoTask
QualityControl.deleteVideoTask = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/qualitycontrol/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/deleteVideoTask';
 if(params.monitoragent)
  request.addQueryParameter('monitoragent', params.monitoragent);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /qualitycontrol/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/startVideoOperation
QualityControl.startVideoOperation = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/qualitycontrol/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/startVideoOperation';
 if(params.monitoragent)
  request.addQueryParameter('monitoragent', params.monitoragent);
 if(params.result)
  request.addQueryParameter('result', params.result);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /qualitycontrol/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/queryqctasks
QualityControl.queryQcTasks = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/qualitycontrol/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/queryqctasks';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// DELETE /qualitycontrol/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/deleteqctask
QualityControl.deleteQcTask = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('DELETE');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/qualitycontrol/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/deleteqctask';
 if(params.taskdsn)
  request.addQueryParameter('taskdsn', params.taskdsn);
 if(params.begintime)
  request.addQueryParameter('begintime', params.begintime);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /qualitycontrol/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/queryvideorecordfile
QualityControl.queryVideoRecordFile = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/qualitycontrol/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/queryvideorecordfile';
 if(params.workno)
  request.addQueryParameter('workno', params.workno);
 if(params.startdate)
  request.addQueryParameter('startdate', params.startdate);
 if(params.enddate)
  request.addQueryParameter('enddate', params.enddate);
 if(params.startposition)
  request.addQueryParameter('startposition', params.startposition);
 if(params.endposition)
  request.addQueryParameter('endposition', params.endposition);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /qualitycontrol/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/queryurlinfo
QualityControl.queryUrlInfo = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/qualitycontrol/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/queryurlinfo';
 if(params.urlname)
  request.addQueryParameter('urlname', params.urlname);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /qualitycontrol/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/requestwhisperagent
QualityControl.requestWhisperAgent = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/qualitycontrol/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/requestwhisperagent';
 if(params.whisperagentid)
  request.addQueryParameter('whisperagentid', params.whisperagentid);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /qualitycontrol/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/requeststopwhisperagent
QualityControl.requestStopWhisperAgent = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/qualitycontrol/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/requeststopwhisperagent';
 if(params.whisperagentid)
  request.addQueryParameter('whisperagentid', params.whisperagentid);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /qualitycontrol/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/requestswitchinsertwhisperagent
QualityControl.requestSwitchInsertWhisperAgent = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/qualitycontrol/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/requestswitchinsertwhisperagent';
 if(params.whisperagentid)
  request.addQueryParameter('whisperagentid', params.whisperagentid);
 if(params.switchtype)
  request.addQueryParameter('switchtype', params.switchtype);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
var Note = {};
// PUT /note/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/createnote
Note.createNote = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('PUT');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/note/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/createnote';
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// PUT /note/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/createnoteforcms
Note.createNoteForCMS = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('PUT');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/note/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/createnoteforcms';
 if(params.sender)
  request.addQueryParameter('sender', params.sender);
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /note/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/querynote
Note.queryNote = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/note/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/querynote';
 if(params.startdate)
  request.addQueryParameter('startdate', params.startdate);
 if(params.enddate)
  request.addQueryParameter('enddate', params.enddate);
 if(params.type)
  request.addQueryParameter('type', params.type);
 if(params.status)
  request.addQueryParameter('status', params.status);
 if(params.startposition)
  request.addQueryParameter('startposition', params.startposition);
 if(params.endposition)
  request.addQueryParameter('endposition', params.endposition);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /note/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/querynotedetail
Note.queryNoteDetail = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/note/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/querynotedetail';
 if(params.noteid)
  request.addQueryParameter('noteid', params.noteid);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /note/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/querytotalnotecount
Note.queryTotalUnReadNoteCount = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/note/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/querytotalnotecount';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// DELETE /note/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/deletenote
Note.deleteNote = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('DELETE');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/note/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/deletenote';
 if(params.noteids)
  request.addQueryParameter('noteids', params.noteids);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// DELETE /note/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/updatenotestatus
Note.updateNoteStatusToReaded = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('DELETE');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/note/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/updatenotestatus';
 if(params.noteid)
  request.addQueryParameter('noteid', params.noteid);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
var CallTableRest = {};
// GET /calltable/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/{callDataId}/taskid/{taskId}/callinfo
CallTableRest.getCallInfo = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/calltable/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/';
 uri += REST.Encoding.encodePathSegment(params.callDataId);
 uri += '/taskid/';
 uri += REST.Encoding.encodePathSegment(params.taskId);
 uri += '/callinfo';
 if(params.isappoint)
  request.addQueryParameter('isappoint', params.isappoint);
 if(params.appointid)
  request.addQueryParameter('appointid', params.appointid);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /calltable/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/{callDataId}/taskid/{taskId}
CallTableRest.getUserDefineInfo = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/calltable/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/';
 uri += REST.Encoding.encodePathSegment(params.callDataId);
 uri += '/taskid/';
 uri += REST.Encoding.encodePathSegment(params.taskId);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /calltable/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/{callDataId}/taskid/{taskId}/phonenumbers
CallTableRest.getPhoneNumberOnManualPreview = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/calltable/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/';
 uri += REST.Encoding.encodePathSegment(params.callDataId);
 uri += '/taskid/';
 uri += REST.Encoding.encodePathSegment(params.taskId);
 uri += '/phonenumbers';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
var ScreenPop = {};
// GET /screenpop/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/queryscreenpoplist
ScreenPop.queryScreenPopList = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/screenpop/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/queryscreenpoplist';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /screenpop/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/queryscreenpopbyid
ScreenPop.queryScreenPopById = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/screenpop/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/queryscreenpopbyid';
 if(params.popid)
  request.addQueryParameter('popid', params.popid);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /screenpop/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/queryscreenpopparamlist
ScreenPop.queryScreenPopParamList = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/screenpop/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/queryscreenpopparamlist';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
var AgentAttribute = {};
// GET /attribute/{user}/buttons
AgentAttribute.getAgentButtonAttribute = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/attribute/';
 uri += REST.Encoding.encodePathSegment(params.user);
 uri += '/buttons';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /attribute/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/vdnattribute
AgentAttribute.getVDNAttribute = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/attribute/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/vdnattribute';
 if(params.atttype)
  request.addQueryParameter('atttype', params.atttype);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
var QueueDevice = {};
// GET /queuedevice/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/innoinfo
QueueDevice.queryInNoOnVDN = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/queuedevice/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/innoinfo';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /queuedevice/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/ivrinfo
QueueDevice.queryIVRInfoOnVdn = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/queuedevice/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/ivrinfo';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /queuedevice/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/waitnum
QueueDevice.queryQueueLengthOnAgent = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/queuedevice/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/waitnum';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /queuedevice/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/waitnumbyagent
QueueDevice.queryQueueLengthOnAgentSkills = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/queuedevice/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/waitnumbyagent';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /queuedevice/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/skillwaitnum/{skillid:[1-9][\d]{0,}}
QueueDevice.queryQueueLengthBySkillId = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/queuedevice/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/skillwaitnum/';
 uri += REST.Encoding.encodePathSegment(params.skillid);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /queuedevice/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/agentskill/{workNo:[1-9][\d]{0,3}|1[\d]{4}}
QueueDevice.querySkillQueueOnAgent = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/queuedevice/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/agentskill/';
 uri += REST.Encoding.encodePathSegment(params.workNo);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /queuedevice/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/vdnskill/{vdnid:[1-9][\d]{0,1}|[1-4][0-9][0-9]|5[0][0-9]|5[1][0-2]}
QueueDevice.querySkillQueueOnVDN = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/queuedevice/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/vdnskill/';
 uri += REST.Encoding.encodePathSegment(params.vdnid);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /queuedevice/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/agentvdnskill
QueueDevice.querySkillQueueOnAgentVDN = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/queuedevice/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/agentvdnskill';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /queuedevice/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/queryacdstat
QueueDevice.queryStatInfoOfAcd = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/queuedevice/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/queryacdstat';
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /queuedevice/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/queryskillstat
QueueDevice.querySkillStatWithVdn = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/queuedevice/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/queryskillstat';
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
var SnsData = {};
// GET /snsdata/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/applist
SnsData.getSnsPlatform = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/snsdata/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/applist';
 if(params.id)
  request.addQueryParameter('id', params.id);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /snsdata/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/accountlist
SnsData.getAccountList = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/snsdata/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/accountlist';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /snsdata/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/getphoto/{picFileName}
SnsData.getPhoto = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/snsdata/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/getphoto/';
 uri += REST.Encoding.encodePathSegment(params.picFileName);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /snsdata/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/getphotobyid/{picid}
SnsData.getPhotoById = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/snsdata/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/getphotobyid/';
 uri += REST.Encoding.encodePathSegment(params.picid);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /snsdata/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/accountlistbysocialdataid/{socialdataid}
SnsData.getAccountListBySocialDataId = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/snsdata/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/accountlistbysocialdataid/';
 uri += REST.Encoding.encodePathSegment(params.socialdataid);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /snsdata/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/senderid/{senderid}/recipientid/{recipientid}/list
SnsData.queryToDispatchDirectMessagDetails = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/snsdata/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/senderid/';
 uri += REST.Encoding.encodePathSegment(params.senderid);
 uri += '/recipientid/';
 uri += REST.Encoding.encodePathSegment(params.recipientid);
 uri += '/list';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /snsdata/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/senderid/{senderid}/recipientid/{recipientid}/detail
SnsData.queryCompositiveDirectMessagDetails = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/snsdata/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/senderid/';
 uri += REST.Encoding.encodePathSegment(params.senderid);
 uri += '/recipientid/';
 uri += REST.Encoding.encodePathSegment(params.recipientid);
 uri += '/detail';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /snsdata/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/dispatchlistbypage
SnsData.queryWaitingReplyListByPage = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/snsdata/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/dispatchlistbypage';
 if(params.content)
  request.addQueryParameter('content', params.content);
 if(params.sort)
  request.addQueryParameter('sort', params.sort);
 if(params.state)
  request.addQueryParameter('state', params.state);
 if(params.currentpage)
  request.addQueryParameter('currentpage', params.currentpage);
 if(params.rowsperpage)
  request.addQueryParameter('rowsperpage', params.rowsperpage);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /snsdata/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/listbypage
SnsData.querySocialDataListByPage = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/snsdata/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/listbypage';
 if(params.tasktype)
  request.addQueryParameter('tasktype', params.tasktype);
 if(params.datatype)
  request.addQueryParameter('datatype', params.datatype);
 if(params.content)
  request.addQueryParameter('content', params.content);
 if(params.recipientscreenName)
  request.addQueryParameter('recipientscreenName', params.recipientscreenName);
 if(params.status)
  request.addQueryParameter('status', params.status);
 if(params.from)
  request.addQueryParameter('from', params.from);
 if(params.sort)
  request.addQueryParameter('sort', params.sort);
 if(params.currentpage)
  request.addQueryParameter('currentpage', params.currentpage);
 if(params.rowsperpage)
  request.addQueryParameter('rowsperpage', params.rowsperpage);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /snsdata/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/dispatch/{socialdataid}
SnsData.dispatchBySocialDataId = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/snsdata/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/dispatch/';
 uri += REST.Encoding.encodePathSegment(params.socialdataid);
 if(params.towasvdnid)
  request.addQueryParameter('towasvdnid', params.towasvdnid);
 if(params.towasagentid)
  request.addQueryParameter('towasagentid', params.towasagentid);
 if(params.towasskillid)
  request.addQueryParameter('towasskillid', params.towasskillid);
 if(params.towasskillname)
  request.addQueryParameter('towasskillname', params.towasskillname);
 if(params.isaudit)
  request.addQueryParameter('isaudit', params.isaudit);
 if(params.accountid)
  request.addQueryParameter('accountid', params.accountid);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /snsdata/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/sendphoto/{lastpicid}
SnsData.sendPhoto = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/snsdata/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/sendphoto/';
 uri += REST.Encoding.encodePathSegment(params.lastpicid);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('text/plain; charset=utf-8');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// DELETE /snsdata/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/discard/{socialdataid}
SnsData.discardBySocialDataId = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('DELETE');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/snsdata/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/discard/';
 uri += REST.Encoding.encodePathSegment(params.socialdataid);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /snsdata/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/requestdispatch
SnsData.requestDispatch = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/snsdata/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/requestdispatch';
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /snsdata/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/todispatchlistbypage
SnsData.queryToDispatchDataListByPage = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/snsdata/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/todispatchlistbypage';
 if(params.datatype)
  request.addQueryParameter('datatype', params.datatype);
 if(params.content)
  request.addQueryParameter('content', params.content);
 if(params.from)
  request.addQueryParameter('from', params.from);
 if(params.sort)
  request.addQueryParameter('sort', params.sort);
 if(params.currentpage)
  request.addQueryParameter('currentpage', params.currentpage);
 if(params.rowsperpage)
  request.addQueryParameter('rowsperpage', params.rowsperpage);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /snsdata/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/replyfailedlistbypage
SnsData.queryReplyFailedDataListByPage = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/snsdata/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/replyfailedlistbypage';
 if(params.datatype)
  request.addQueryParameter('datatype', params.datatype);
 if(params.content)
  request.addQueryParameter('content', params.content);
 if(params.from)
  request.addQueryParameter('from', params.from);
 if(params.sort)
  request.addQueryParameter('sort', params.sort);
 if(params.currentpage)
  request.addQueryParameter('currentpage', params.currentpage);
 if(params.rowsperpage)
  request.addQueryParameter('rowsperpage', params.rowsperpage);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /snsdata/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/replydiscardedlistbypage
SnsData.queryDiscardedDataListByPage = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/snsdata/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/replydiscardedlistbypage';
 if(params.datatype)
  request.addQueryParameter('datatype', params.datatype);
 if(params.content)
  request.addQueryParameter('content', params.content);
 if(params.from)
  request.addQueryParameter('from', params.from);
 if(params.sort)
  request.addQueryParameter('sort', params.sort);
 if(params.currentpage)
  request.addQueryParameter('currentpage', params.currentpage);
 if(params.rowsperpage)
  request.addQueryParameter('rowsperpage', params.rowsperpage);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /snsdata/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/replysucceedlistbypage
SnsData.queryReplySucceedDataListByPage = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/snsdata/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/replysucceedlistbypage';
 if(params.datatype)
  request.addQueryParameter('datatype', params.datatype);
 if(params.content)
  request.addQueryParameter('content', params.content);
 if(params.from)
  request.addQueryParameter('from', params.from);
 if(params.sort)
  request.addQueryParameter('sort', params.sort);
 if(params.currentpage)
  request.addQueryParameter('currentpage', params.currentpage);
 if(params.rowsperpage)
  request.addQueryParameter('rowsperpage', params.rowsperpage);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /snsdata/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/querytoreplycount
SnsData.queryToReplyCount = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/snsdata/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/querytoreplycount';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /snsdata/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/multistatelistbypage
SnsData.queryMultiStateDataListByPage = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/snsdata/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/multistatelistbypage';
 if(params.tasktype)
  request.addQueryParameter('tasktype', params.tasktype);
 if(params.datatype)
  request.addQueryParameter('datatype', params.datatype);
 if(params.content)
  request.addQueryParameter('content', params.content);
 if(params.from)
  request.addQueryParameter('from', params.from);
 if(params.state)
  request.addQueryParameter('state', params.state);
 if(params.sort)
  request.addQueryParameter('sort', params.sort);
 if(params.currentpage)
  request.addQueryParameter('currentpage', params.currentpage);
 if(params.rowsperpage)
  request.addQueryParameter('rowsperpage', params.rowsperpage);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /snsdata/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/snsadapter/{user}
SnsData.getReplyTipsIsEnable = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/snsdata/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/snsadapter/';
 uri += REST.Encoding.encodePathSegment(params.user);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
var FrequentContactRest = {};
// GET /frequentcontact/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/currentPage/{currentPage}/rowsPerPage/{rowsPerPage}/allfrequentcontact
FrequentContactRest.getAllFrequentContact = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/frequentcontact/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/currentPage/';
 uri += REST.Encoding.encodePathSegment(params.currentPage);
 uri += '/rowsPerPage/';
 uri += REST.Encoding.encodePathSegment(params.rowsPerPage);
 uri += '/allfrequentcontact';
 if(params.clientName)
  request.addQueryParameter('clientName', params.clientName);
 if(params.phoneNo)
  request.addQueryParameter('phoneNo', params.phoneNo);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /frequentcontact/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/iscontactexist
FrequentContactRest.isContactExist = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/frequentcontact/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/iscontactexist';
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// PUT /frequentcontact/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/createfrequentcontact
FrequentContactRest.createFrequentContact = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('PUT');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/frequentcontact/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/createfrequentcontact';
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// DELETE /frequentcontact/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/{frequentContactId}/deletefrequentcontact
FrequentContactRest.deleteFrequentContact = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('DELETE');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/frequentcontact/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/';
 uri += REST.Encoding.encodePathSegment(params.frequentContactId);
 uri += '/deletefrequentcontact';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
var AccessTokenValidatorService = {};
// GET /validate
AccessTokenValidatorService.getTokenValidationInfo = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/validate';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/xml,application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
var AgentFrequentContact = {};
// GET /agentfrequentcontact/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/queryagentfrequentcontact
AgentFrequentContact.queryAgentFrequentContact = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/agentfrequentcontact/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/queryagentfrequentcontact';
 if(params.customerName)
  request.addQueryParameter('customerName', params.customerName);
 if(params.phoneNo)
  request.addQueryParameter('phoneNo', params.phoneNo);
 if(params.startposition)
  request.addQueryParameter('startposition', params.startposition);
 if(params.endposition)
  request.addQueryParameter('endposition', params.endposition);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /agentfrequentcontact/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/queryagentfrequentcontactbyid
AgentFrequentContact.queryAgentFrequentContactById = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/agentfrequentcontact/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/queryagentfrequentcontactbyid';
 if(params.contactid)
  request.addQueryParameter('contactid', params.contactid);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// PUT /agentfrequentcontact/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/createagentfrequentcontact
AgentFrequentContact.createAgentFrequentContact = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('PUT');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/agentfrequentcontact/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/createagentfrequentcontact';
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /agentfrequentcontact/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/modifyagentfrequentcontact
AgentFrequentContact.modifyAgentFrequentContact = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/agentfrequentcontact/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/modifyagentfrequentcontact';
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// DELETE /agentfrequentcontact/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/delagentfrequentcontact
AgentFrequentContact.deleteAgentFrequentContact = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('DELETE');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/agentfrequentcontact/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/delagentfrequentcontact';
 if(params.frequentContactIds)
  request.addQueryParameter('frequentContactIds', params.frequentContactIds);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
var CampaignTaskRest = {};
// GET /campaigntask/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/taskId/{taskId}/callDataId/{callDataId}/phonenumberonmanualpreview
CampaignTaskRest.getPhoneNumberOnManualPreview = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/campaigntask/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/taskId/';
 uri += REST.Encoding.encodePathSegment(params.taskId);
 uri += '/callDataId/';
 uri += REST.Encoding.encodePathSegment(params.callDataId);
 uri += '/phonenumberonmanualpreview';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /campaigntask/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/{wasAgentId}/currentpage/{currentPage}/rowsperpage/{rowsPerPage}/camptaskbyagent
CampaignTaskRest.getCampaignTaskInfoByAgentNo = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/campaigntask/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/';
 uri += REST.Encoding.encodePathSegment(params.wasAgentId);
 uri += '/currentpage/';
 uri += REST.Encoding.encodePathSegment(params.currentPage);
 uri += '/rowsperpage/';
 uri += REST.Encoding.encodePathSegment(params.rowsPerPage);
 uri += '/camptaskbyagent';
 if(params.campName)
  request.addQueryParameter('campName', params.campName);
 if(params.outboundType)
  request.addQueryParameter('outboundType', params.outboundType);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
var CallData = {};
// GET /calldata/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/callinfo
CallData.queryCallInfo = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/calldata/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/callinfo';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /calldata/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/isprocesscall
CallData.isProcessCall = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/calldata/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/isprocesscall';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /calldata/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/callinfobeforeanswer
CallData.queryCallInfoBeforeAnswer = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/calldata/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/callinfobeforeanswer';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /calldata/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/appdata
CallData.queryCallAppData = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/calldata/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/appdata';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// PUT /calldata/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/setcallbusinessdata
CallData.setCallBusinessData = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('PUT');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/calldata/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/setcallbusinessdata';
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// PUT /calldata/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/getcallbusinessdata
CallData.getCallBusinessData = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('PUT');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/calldata/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/getcallbusinessdata';
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /calldata/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/callnums
CallData.queryCallNumsOnAgent = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/calldata/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/callnums';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /calldata/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/statistics
CallData.queryCallStatisticsInfo = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/calldata/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/statistics';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /calldata/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/holdlist
CallData.queryHoldListInfo = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/calldata/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/holdlist';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /calldata/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/holdlistex/{workno:[1-9][\d]{0,3}|1[\d]{4}}
CallData.queryHoldListInfoEx = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/calldata/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/holdlistex/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /calldata/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/agentholdnum/{workno:[1-9][\d]{0,3}|1[\d]{4}}
CallData.queryAgentHoldNum = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/calldata/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/agentholdnum/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// PUT /calldata/{agentid:[1-9][\d]{0,3}|1[\d]{4}}
CallData.setCallAppData = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('PUT');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/calldata/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 if(params.calldata)
  request.addQueryParameter('calldata', params.calldata);
 if(params.callid)
  request.addQueryParameter('callid', params.callid);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// PUT /calldata/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/setcalldataex
CallData.setCallAppDataEx = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('PUT');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/calldata/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/setcalldataex';
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /calldata/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/allcallid
CallData.queryAllCallID = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/calldata/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/allcallid';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /calldata/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/allcallinfo/{workno:[1-9][\d]{0,3}|1[\d]{4}}
CallData.queryAllCallInfoByAgentWorkNo = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/calldata/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/allcallinfo/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /calldata/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/waitcallinfo/{skillid:[1-9][\d]{0,}}
CallData.queryWaitCallInfoBySkillId = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/calldata/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/waitcallinfo/';
 uri += REST.Encoding.encodePathSegment(params.skillid);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /calldata/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/ivrcallinfo/{ivrid:[1-9][\d]{0,}}
CallData.queryWaitCallInfoByIVRId = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/calldata/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/ivrcallinfo/';
 uri += REST.Encoding.encodePathSegment(params.ivrid);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /calldata/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/privatecallinfo
CallData.queryPrivateCallInfo = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/calldata/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/privatecallinfo';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /calldata/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/remotenumbers
CallData.queryRemoteNumbers = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/calldata/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/remotenumbers';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /calldata/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/callinfobycallid/{callid:.{1,}}
CallData.queryCallInfoByCallId = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/calldata/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/callinfobycallid/';
 uri += REST.Encoding.encodePathSegment(params.callid);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /calldata/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/callRecordInfoList
CallData.queryCallRecordList = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/calldata/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/callRecordInfoList';
 if(params.workno)
  request.addQueryParameter('workno', params.workno);
 if(params.skillid)
  request.addQueryParameter('skillid', params.skillid);
 if(params.startdate)
  request.addQueryParameter('startdate', params.startdate);
 if(params.enddate)
  request.addQueryParameter('enddate', params.enddate);
 if(params.startposition)
  request.addQueryParameter('startposition', params.startposition);
 if(params.endposition)
  request.addQueryParameter('endposition', params.endposition);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /calldata/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/queryselfcallrecordinfolist
CallData.querySelfCallRecordInfo = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/calldata/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/queryselfcallrecordinfolist';
 if(params.skillid)
  request.addQueryParameter('skillid', params.skillid);
 if(params.startdate)
  request.addQueryParameter('startdate', params.startdate);
 if(params.enddate)
  request.addQueryParameter('enddate', params.enddate);
 if(params.startposition)
  request.addQueryParameter('startposition', params.startposition);
 if(params.endposition)
  request.addQueryParameter('endposition', params.endposition);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /calldata/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/querycallrecordandemployee
CallData.queryCallRecordAndEmployee = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/calldata/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/querycallrecordandemployee';
 if(params.workno)
  request.addQueryParameter('workno', params.workno);
 if(params.skillid)
  request.addQueryParameter('skillid', params.skillid);
 if(params.startdate)
  request.addQueryParameter('startdate', params.startdate);
 if(params.enddate)
  request.addQueryParameter('enddate', params.enddate);
 if(params.startposition)
  request.addQueryParameter('startposition', params.startposition);
 if(params.endposition)
  request.addQueryParameter('endposition', params.endposition);
 if(params.language)
  request.addQueryParameter('language', params.language);
 if(params.employeename)
  request.addQueryParameter('employeename', params.employeename);
 if(params.phoneno)
  request.addQueryParameter('phoneno', params.phoneno);
 if(params.employeeno)
  request.addQueryParameter('employeeno', params.employeeno);
 if(params.employeetype)
  request.addQueryParameter('employeetype', params.employeetype);
 if(params.identifycardno)
  request.addQueryParameter('identifycardno', params.identifycardno);
 if(params.country)
  request.addQueryParameter('country', params.country);
 if(params.mobileno)
  request.addQueryParameter('mobileno', params.mobileno);
 if(params.param1)
  request.addQueryParameter('param1', params.param1);
 if(params.param2)
  request.addQueryParameter('param2', params.param2);
 if(params.param3)
  request.addQueryParameter('param3', params.param3);
 if(params.param4)
  request.addQueryParameter('param4', params.param4);
 if(params.param5)
  request.addQueryParameter('param5', params.param5);
 if(params.param6)
  request.addQueryParameter('param6', params.param6);
 if(params.param7)
  request.addQueryParameter('param7', params.param7);
 if(params.param8)
  request.addQueryParameter('param8', params.param8);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /calldata/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/queryselfcallrecordandemployee
CallData.querySelfCallRecordAndEmployee = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/calldata/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/queryselfcallrecordandemployee';
 if(params.skillid)
  request.addQueryParameter('skillid', params.skillid);
 if(params.startdate)
  request.addQueryParameter('startdate', params.startdate);
 if(params.enddate)
  request.addQueryParameter('enddate', params.enddate);
 if(params.startposition)
  request.addQueryParameter('startposition', params.startposition);
 if(params.endposition)
  request.addQueryParameter('endposition', params.endposition);
 if(params.language)
  request.addQueryParameter('language', params.language);
 if(params.employeename)
  request.addQueryParameter('employeename', params.employeename);
 if(params.phoneno)
  request.addQueryParameter('phoneno', params.phoneno);
 if(params.employeeno)
  request.addQueryParameter('employeeno', params.employeeno);
 if(params.employeetype)
  request.addQueryParameter('employeetype', params.employeetype);
 if(params.identifycardno)
  request.addQueryParameter('identifycardno', params.identifycardno);
 if(params.country)
  request.addQueryParameter('country', params.country);
 if(params.mobileno)
  request.addQueryParameter('mobileno', params.mobileno);
 if(params.param1)
  request.addQueryParameter('param1', params.param1);
 if(params.param2)
  request.addQueryParameter('param2', params.param2);
 if(params.param3)
  request.addQueryParameter('param3', params.param3);
 if(params.param4)
  request.addQueryParameter('param4', params.param4);
 if(params.param5)
  request.addQueryParameter('param5', params.param5);
 if(params.param6)
  request.addQueryParameter('param6', params.param6);
 if(params.param7)
  request.addQueryParameter('param7', params.param7);
 if(params.param8)
  request.addQueryParameter('param8', params.param8);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /calldata/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/querycustomercontactInfo
CallData.queryCustomerContactInfo = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/calldata/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/querycustomercontactInfo';
 if(params.callid)
  request.addQueryParameter('callid', params.callid);
 if(params.username)
  request.addQueryParameter('username', params.username);
 if(params.startdate)
  request.addQueryParameter('startdate', params.startdate);
 if(params.enddate)
  request.addQueryParameter('enddate', params.enddate);
 if(params.locale)
  request.addQueryParameter('locale', params.locale);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /calldata/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/ivrcallcount/{ivrid:[1-9][\d]{0,}}
CallData.queryCallCountByIVRId = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/calldata/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/ivrcallcount/';
 uri += REST.Encoding.encodePathSegment(params.ivrid);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /calldata/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/allcallinfoEx/{workno:[1-9][\d]{0,3}|1[\d]{4}}
CallData.queryAllCallInfoByAgentWorkNoEx = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/calldata/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/allcallinfoEx/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /calldata/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/allcallinfoinvdn
CallData.queryAllCallInfoOnVdn = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/calldata/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/allcallinfoinvdn';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /calldata/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/querycalloutprefix
CallData.queryCalloutPrefix = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/calldata/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/querycalloutprefix';
 if(params.skillid)
  request.addQueryParameter('skillid', params.skillid);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
var ExpertAgent = {};
// GET /expertagent/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/ucstatusflag
ExpertAgent.queryUCStatusFlag = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/expertagent/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/ucstatusflag';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /expertagent/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/allexpertgroup
ExpertAgent.queryAllExpertGroup = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/expertagent/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/allexpertgroup';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /expertagent/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/expertagentbycondition
ExpertAgent.queryExpertAgentByCondition = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/expertagent/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/expertagentbycondition';
 if(params.groupid)
  request.addQueryParameter('groupid', params.groupid);
 if(params.expertname)
  request.addQueryParameter('expertname', params.expertname);
 if(params.startposition)
  request.addQueryParameter('startposition', params.startposition);
 if(params.endposition)
  request.addQueryParameter('endposition', params.endposition);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /expertagent/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/expertagentstatus
ExpertAgent.queryExpertAgentStatusByAccountName = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/expertagent/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/expertagentstatus';
 if(params.account)
  request.addQueryParameter('account', params.account);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /expertagent/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/calloutprefix
ExpertAgent.queryExpertAgentCalloutPrefix = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/expertagent/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/calloutprefix';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
var CallLogRest = {};
// POST /calllog/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/currentPage/{currentPage}/rowsPerPage/{rowsPerPage}/callloglist
CallLogRest.getCallLogList = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/calllog/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/currentPage/';
 uri += REST.Encoding.encodePathSegment(params.currentPage);
 uri += '/rowsPerPage/';
 uri += REST.Encoding.encodePathSegment(params.rowsPerPage);
 uri += '/callloglist';
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// PUT /calllog/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/writeAfterRelease
CallLogRest.writeAfterRelease = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('PUT');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/calllog/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/writeAfterRelease';
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /calllog/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/calllogbyid/{id}
CallLogRest.getCallLogById = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/calllog/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/calllogbyid/';
 uri += REST.Encoding.encodePathSegment(params.id);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
var SnsReport = {};
// GET /snsreport/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/summarydailyreport/{querydate}
SnsReport.querySummaryDailyReport = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/snsreport/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/summarydailyreport/';
 uri += REST.Encoding.encodePathSegment(params.querydate);
 if(params.datatype)
  request.addQueryParameter('datatype', params.datatype);
 if(params.from)
  request.addQueryParameter('from', params.from);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /snsreport/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/summarymonthlyreport/{querystartdate}/querystartdate/{queryenddate}
SnsReport.querySummaryMonthlyReport = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/snsreport/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/summarymonthlyreport/';
 uri += REST.Encoding.encodePathSegment(params.querystartdate);
 uri += '/querystartdate/';
 uri += REST.Encoding.encodePathSegment(params.queryenddate);
 if(params.datatype)
  request.addQueryParameter('datatype', params.datatype);
 if(params.from)
  request.addQueryParameter('from', params.from);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
var PhoneRuleRest = {};
// GET /phonerule/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/{wasVdnId}/phonerulebyvdnid
PhoneRuleRest.getPhoneRuleByVdnId = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/phonerule/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/';
 uri += REST.Encoding.encodePathSegment(params.wasVdnId);
 uri += '/phonerulebyvdnid';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
var Bulletin = {};
// PUT /bulletin/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/createbulletin
Bulletin.createBulletin = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('PUT');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/bulletin/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/createbulletin';
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /bulletin/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/querybulletin
Bulletin.queryBulletin = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/bulletin/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/querybulletin';
 if(params.startdate)
  request.addQueryParameter('startdate', params.startdate);
 if(params.enddate)
  request.addQueryParameter('enddate', params.enddate);
 if(params.status)
  request.addQueryParameter('status', params.status);
 if(params.startposition)
  request.addQueryParameter('startposition', params.startposition);
 if(params.endposition)
  request.addQueryParameter('endposition', params.endposition);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /bulletin/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/querybulletinbycreator
Bulletin.queryBulletinByCreator = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/bulletin/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/querybulletinbycreator';
 if(params.startdate)
  request.addQueryParameter('startdate', params.startdate);
 if(params.enddate)
  request.addQueryParameter('enddate', params.enddate);
 if(params.startposition)
  request.addQueryParameter('startposition', params.startposition);
 if(params.endposition)
  request.addQueryParameter('endposition', params.endposition);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /bulletin/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/querybulletindetail
Bulletin.queryBulletinDetail = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/bulletin/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/querybulletindetail';
 if(params.bulletinid)
  request.addQueryParameter('bulletinid', params.bulletinid);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /bulletin/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/queryunreadbulletincount
Bulletin.queryUnReadBulletinCount = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/bulletin/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/queryunreadbulletincount';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// PUT /bulletin/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/createbulletinreadhistory
Bulletin.createBulletinReadHistory = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('PUT');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/bulletin/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/createbulletinreadhistory';
 if(params.bulletinid)
  request.addQueryParameter('bulletinid', params.bulletinid);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /bulletin/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/queryagentbulletin
Bulletin.queryAgentBulletin = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/bulletin/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/queryagentbulletin';
 if(params.bulletinid)
  request.addQueryParameter('bulletinid', params.bulletinid);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /bulletin/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/updatebulletinreadhistory
Bulletin.deleteBulletinForReceiver = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/bulletin/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/updatebulletinreadhistory';
 if(params.bulletinid)
  request.addQueryParameter('bulletinid', params.bulletinid);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// DELETE /bulletin/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/deletebulletin
Bulletin.deleteBulletin = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('DELETE');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/bulletin/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/deletebulletin';
 if(params.bulletinids)
  request.addQueryParameter('bulletinids', params.bulletinids);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
var DispositionCodeRest = {};
// POST /dispositioncode/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/currentPage/{currentPage}/rowsPerPage/{rowsPerPage}/dispdetail
DispositionCodeRest.getDispDetail = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/dispositioncode/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/currentPage/';
 uri += REST.Encoding.encodePathSegment(params.currentPage);
 uri += '/rowsPerPage/';
 uri += REST.Encoding.encodePathSegment(params.rowsPerPage);
 uri += '/dispdetail';
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /dispositioncode/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/{taskId:[\d]{1,5}}/dispcodesbytask
DispositionCodeRest.getDispositionCodesByTaskId = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/dispositioncode/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/';
 uri += REST.Encoding.encodePathSegment(params.taskId);
 uri += '/dispcodesbytask';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /dispositioncode/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/{wasSkillId:[\d]{1,5}}/vdnid/{wasVdnId:[\d]{1,5}}/dispcodesbyskill
DispositionCodeRest.getDispositionCodesBySkillId = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/dispositioncode/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/';
 uri += REST.Encoding.encodePathSegment(params.wasSkillId);
 uri += '/vdnid/';
 uri += REST.Encoding.encodePathSegment(params.wasVdnId);
 uri += '/dispcodesbyskill';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /dispositioncode/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/{wasVdnId:[\d]{1,5}}/skillids/{skillids}/dispcodesbyskillids
DispositionCodeRest.getDispositionCodesBySkillIdList = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/dispositioncode/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/';
 uri += REST.Encoding.encodePathSegment(params.wasVdnId);
 uri += '/skillids/';
 uri += REST.Encoding.encodePathSegment(params.skillids);
 uri += '/dispcodesbyskillids';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /dispositioncode/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/{wasVdnId:[\d]{1,5}}/dispcodesbyvdn
DispositionCodeRest.getDispositionCodesByVdnId = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/dispositioncode/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/';
 uri += REST.Encoding.encodePathSegment(params.wasVdnId);
 uri += '/dispcodesbyvdn';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /dispositioncode/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/vdnid/{wasVdnId}/dispcodesbyskillname
DispositionCodeRest.getDispositionCodesBySkillName = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/dispositioncode/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/vdnid/';
 uri += REST.Encoding.encodePathSegment(params.wasVdnId);
 uri += '/dispcodesbyskillname';
 if(params.skillName)
  request.addQueryParameter('skillName', params.skillName);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// PUT /dispositioncode/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/{callFeature}/submitdispositioncode
DispositionCodeRest.submitDispositionCode = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('PUT');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/dispositioncode/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/';
 uri += REST.Encoding.encodePathSegment(params.callFeature);
 uri += '/submitdispositioncode';
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// PUT /dispositioncode/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/{callFeature}/submitdiscodeex
DispositionCodeRest.submitDispositionCodeEX = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('PUT');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/dispositioncode/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/';
 uri += REST.Encoding.encodePathSegment(params.callFeature);
 uri += '/submitdiscodeex';
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /dispositioncode/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/currentPage/{currentPage}/rowsPerPage/{rowsPerPage}/dispdetailex
DispositionCodeRest.getDispDetailEx = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/dispositioncode/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/currentPage/';
 uri += REST.Encoding.encodePathSegment(params.currentPage);
 uri += '/rowsPerPage/';
 uri += REST.Encoding.encodePathSegment(params.rowsPerPage);
 uri += '/dispdetailex';
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /dispositioncode/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/dispdetailbyid/{id}
DispositionCodeRest.getDispDetailById = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/dispositioncode/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/dispdetailbyid/';
 uri += REST.Encoding.encodePathSegment(params.id);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
var AgentPortrait = {};
// POST /agentportait/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/agentportait
AgentPortrait.uploadAgentPortrait = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/agentportait/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/agentportait';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('text/plain; charset=utf-8');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /agentportait/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/getportait/{workno:[1-9][\d]{0,3}|1[\d]{4}}
AgentPortrait.getPortait = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/agentportait/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/getportait/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
var QuestionnaireRest = {};
// GET /questionnaire/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/taskId/{taskId}/questionnairebytaskid
QuestionnaireRest.getQuestionnaireByTaskId = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/questionnaire/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/taskId/';
 uri += REST.Encoding.encodePathSegment(params.taskId);
 uri += '/questionnairebytaskid';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// PUT /questionnaire/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/createanswer
QuestionnaireRest.createAnswer = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('PUT');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/questionnaire/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/createanswer';
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
var ThirdPartyUser = {};
// GET /thirdparty/loginconfig
ThirdPartyUser.getLoginConfig = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/thirdparty/loginconfig';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /thirdparty/loginmode
ThirdPartyUser.getUserLoginMode = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/thirdparty/loginmode';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /thirdparty/{user}/authtype
ThirdPartyUser.getUserAuthType = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/thirdparty/';
 uri += REST.Encoding.encodePathSegment(params.user);
 uri += '/authtype';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// PUT /thirdparty/{user}
ThirdPartyUser.agentUserLogin = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('PUT');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/thirdparty/';
 uri += REST.Encoding.encodePathSegment(params.user);
 if(params.password)
  request.addQueryParameter('password', params.password);
 if(params.ip)
  request.addQueryParameter('ip', params.ip);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// PUT /thirdparty/{user}/forcelogin
ThirdPartyUser.agentUserForceLogin = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('PUT');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/thirdparty/';
 uri += REST.Encoding.encodePathSegment(params.user);
 uri += '/forcelogin';
 if(params.password)
  request.addQueryParameter('password', params.password);
 if(params.ip)
  request.addQueryParameter('ip', params.ip);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /thirdparty/agentbyattribute
ThirdPartyUser.getAgentByAttributeID = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/thirdparty/agentbyattribute';
 if(params.attribute)
  request.addQueryParameter('attribute', params.attribute);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /thirdparty/agentusersvdn
ThirdPartyUser.queryAgentUsersOnAgentVDN = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/thirdparty/agentusersvdn';
 if(params.wasVdnId)
  request.addQueryParameter('wasVdnId', params.wasVdnId);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
var BulletinRest = {};
// GET /bulletin/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/wasVdnId/{wasVdnId}/top10bulletinlist
BulletinRest.getTop10BulletinList = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/bulletin/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/wasVdnId/';
 uri += REST.Encoding.encodePathSegment(params.wasVdnId);
 uri += '/top10bulletinlist';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /bulletin/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/bulletinId/{bulletinId}/bulletinbyid
BulletinRest.getBulletinById = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/bulletin/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/bulletinId/';
 uri += REST.Encoding.encodePathSegment(params.bulletinId);
 uri += '/bulletinbyid';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /bulletin/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/wasVdnId/{wasVdnId}/currentPage/{currentPage}/rowsPerPage/{rowsPerPage}/bulletinlistbypage
BulletinRest.getBulletinListByPage = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/bulletin/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/wasVdnId/';
 uri += REST.Encoding.encodePathSegment(params.wasVdnId);
 uri += '/currentPage/';
 uri += REST.Encoding.encodePathSegment(params.currentPage);
 uri += '/rowsPerPage/';
 uri += REST.Encoding.encodePathSegment(params.rowsPerPage);
 uri += '/bulletinlistbypage';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
var VoiceCall = {};
// POST /voicecall/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/transfer
VoiceCall.transfer = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/voicecall/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/transfer';
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// DELETE /voicecall/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/release
VoiceCall.release = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('DELETE');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/voicecall/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/release';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /voicecall/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/disconnect/{number:[0-9][\d]{1,24}}
VoiceCall.disconnect = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/voicecall/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/disconnect/';
 uri += REST.Encoding.encodePathSegment(params.number);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// PUT /voicecall/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/answer
VoiceCall.answer = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('PUT');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/voicecall/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/answer';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// PUT /voicecall/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/callout
VoiceCall.callout = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('PUT');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/voicecall/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/callout';
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// PUT /voicecall/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/previewcallout
VoiceCall.previewCallOut = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('PUT');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/voicecall/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/previewcallout';
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// PUT /voicecall/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/callinner
VoiceCall.callInner = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('PUT');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/voicecall/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/callinner';
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /voicecall/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/innerhelp
VoiceCall.innerHelp = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/voicecall/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/innerhelp';
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /voicecall/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/canceltransfer
VoiceCall.cancelTransfer = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/voicecall/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/canceltransfer';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /voicecall/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/reportsound
VoiceCall.reportSound = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/voicecall/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/reportsound';
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /voicecall/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/seconddial/{number:[0-9,%*]{1,24}}
VoiceCall.secondDial = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/voicecall/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/seconddial/';
 uri += REST.Encoding.encodePathSegment(params.number);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /voicecall/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/connecthold/{callid:.{1,}}
VoiceCall.connectHold = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/voicecall/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/connecthold/';
 uri += REST.Encoding.encodePathSegment(params.callid);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /voicecall/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/confjoin
VoiceCall.confJoin = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/voicecall/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/confjoin';
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /voicecall/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/beginmute
VoiceCall.beginMute = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/voicecall/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/beginmute';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /voicecall/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/endmute
VoiceCall.endMute = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/voicecall/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/endmute';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// DELETE /voicecall/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/releasephone
VoiceCall.releasePhone = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('DELETE');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/voicecall/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/releasephone';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /voicecall/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/hold
VoiceCall.hold = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/voicecall/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/hold';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /voicecall/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/gethold
VoiceCall.getHold = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/voicecall/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/gethold';
 if(params.callid)
  request.addQueryParameter('callid', params.callid);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /voicecall/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/beginmutevideo
VoiceCall.beginMuteVideo = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/voicecall/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/beginmutevideo';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /voicecall/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/endmutevideo
VoiceCall.endMuteVideo = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/voicecall/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/endmutevideo';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /voicecall/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/requestcall/{callid:.{1,}}/{skilltype:[0]|[1]}
VoiceCall.requestAppointedCall = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/voicecall/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/requestcall/';
 uri += REST.Encoding.encodePathSegment(params.callid);
 uri += '/';
 uri += REST.Encoding.encodePathSegment(params.skilltype);
 if(params.skillid)
  request.addQueryParameter('skillid', params.skillid);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /voicecall/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/dropcall/{callid:.{1,}}
VoiceCall.dropCall = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/voicecall/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/dropcall/';
 uri += REST.Encoding.encodePathSegment(params.callid);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// PUT /voicecall/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/phonepickup
VoiceCall.phonePickup = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('PUT');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/voicecall/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/phonepickup';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// PUT /voicecall/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/phonehangup
VoiceCall.phoneHangUp = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('PUT');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/voicecall/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/phonehangup';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
var SnsMonitor = {};
// GET /snsmonitor/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/getaccountlist
SnsMonitor.getAccountList = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/snsmonitor/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/getaccountlist';
 if(params.platform)
  request.addQueryParameter('platform', params.platform);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /snsmonitor/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/accountbyhour
SnsMonitor.accountByHour = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/snsmonitor/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/accountbyhour';
 if(params.platform)
  request.addQueryParameter('platform', params.platform);
 if(params.accountuid)
  request.addQueryParameter('accountuid', params.accountuid);
 if(params.accountparam1)
  request.addQueryParameter('accountparam1', params.accountparam1);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /snsmonitor/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/accountbyday
SnsMonitor.accountByDay = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/snsmonitor/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/accountbyday';
 if(params.platform)
  request.addQueryParameter('platform', params.platform);
 if(params.accountuid)
  request.addQueryParameter('accountuid', params.accountuid);
 if(params.accountparam1)
  request.addQueryParameter('accountparam1', params.accountparam1);
 if(params.zoneoffset)
  request.addQueryParameter('zoneoffset', params.zoneoffset);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /snsmonitor/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/getlistentasklist
SnsMonitor.getListenTaskList = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/snsmonitor/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/getlistentasklist';
 if(params.tasktype)
  request.addQueryParameter('tasktype', params.tasktype);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /snsmonitor/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/listentaskbyhour
SnsMonitor.listenTaskByHour = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/snsmonitor/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/listentaskbyhour';
 if(params.listentaskid)
  request.addQueryParameter('listentaskid', params.listentaskid);
 if(params.tasktype)
  request.addQueryParameter('tasktype', params.tasktype);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /snsmonitor/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/listentaskbyday
SnsMonitor.listenTaskByDay = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/snsmonitor/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/listentaskbyday';
 if(params.listentaskid)
  request.addQueryParameter('listentaskid', params.listentaskid);
 if(params.tasktype)
  request.addQueryParameter('tasktype', params.tasktype);
 if(params.zoneoffset)
  request.addQueryParameter('zoneoffset', params.zoneoffset);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /snsmonitor/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/trendbyhour
SnsMonitor.trendByHour = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/snsmonitor/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/trendbyhour';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /snsmonitor/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/trendbyday
SnsMonitor.trendByDay = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/snsmonitor/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/trendbyday';
 if(params.zoneoffset)
  request.addQueryParameter('zoneoffset', params.zoneoffset);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /snsmonitor/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/getzonemsg
SnsMonitor.getZoneMsg = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/snsmonitor/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/getzonemsg';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
var AgentEventPushlet = {};
// PUT /agenteventpushlet/{workno:[1-9][\d]{0,3}|1[\d]{4}}/agentskillqueuefresh
AgentEventPushlet.setAgentSkillQueueFresh = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('PUT');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/agenteventpushlet/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/agentskillqueuefresh';
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
var AgentEventDispatcher = {};
// PUT /agentevent/{workno:[1-9][\d]{0,3}|1[\d]{4}}/agentskillqueuefresh
AgentEventDispatcher.setAgentSkillQueueFresh = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('PUT');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/agentevent/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/agentskillqueuefresh';
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /agentevent/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/jsonp
AgentEventDispatcher.getJsonpAgentEvent = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/agentevent/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/jsonp';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('text/plain');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /agentevent/{agentid:[1-9][\d]{0,3}|1[\d]{4}}
AgentEventDispatcher.getAgentEvent = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/agentevent/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /agentevent/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/async
AgentEventDispatcher.getAgentEventInAsync = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/agentevent/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/async';
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /agentevent/allagentevent
AgentEventDispatcher.getAllAgentEvent = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/agentevent/allagentevent';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /agentevent/reportagentsisalive
AgentEventDispatcher.reportAgentsIsAlive = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/agentevent/reportagentsisalive';
 if(params.agents)
  request.addQueryParameter('agents', params.agents);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
var SnsHistory = {};
// GET /snshistory/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/socialdataid/{socialdataid}/historylist
SnsHistory.querySociaDataHistoryListById = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/snshistory/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/socialdataid/';
 uri += REST.Encoding.encodePathSegment(params.socialdataid);
 uri += '/historylist';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /snshistory/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/dataid/{dataid}/historylist
SnsHistory.querySociaDataHistoryListByDataId = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/snshistory/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/dataid/';
 uri += REST.Encoding.encodePathSegment(params.dataid);
 uri += '/historylist';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
var Customer = {};
// GET /customer/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/querycustomerInfo
Customer.queryCustomerInfo = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/customer/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/querycustomerInfo';
 if(params.phoneno)
  request.addQueryParameter('phoneno', params.phoneno);
 if(params.email)
  request.addQueryParameter('email', params.email);
 if(params.mode)
  request.addQueryParameter('mode', params.mode);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /customer/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/queryldapuserforhw
Customer.queryLdapUserForHW = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/customer/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/queryldapuserforhw';
 if(params.searchkey)
  request.addQueryParameter('searchkey', params.searchkey);
 if(params.searchvalue)
  request.addQueryParameter('searchvalue', params.searchvalue);
 if(params.language)
  request.addQueryParameter('language', params.language);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /customer/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/queryuserbythirdpartyproc
Customer.queryUserByThirdPartyProc = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/customer/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/queryuserbythirdpartyproc';
 if(params.searchkey)
  request.addQueryParameter('searchkey', params.searchkey);
 if(params.searchvalue)
  request.addQueryParameter('searchvalue', params.searchvalue);
 if(params.language)
  request.addQueryParameter('language', params.language);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /customer/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/queryuserbyhwhrservice
Customer.queryUserByHWHRService = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/customer/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/queryuserbyhwhrservice';
 if(params.searchkey)
  request.addQueryParameter('searchkey', params.searchkey);
 if(params.searchvalue)
  request.addQueryParameter('searchvalue', params.searchvalue);
 if(params.language)
  request.addQueryParameter('language', params.language);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
var RobotChat = {};
// GET /robotchat/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/getRobotChatMessage/{sessionId}
RobotChat.getRobotChatMessage = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/robotchat/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/getRobotChatMessage/';
 uri += REST.Encoding.encodePathSegment(params.sessionId);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /robotchat/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/queryrobotchatmessage/{sessionId}
RobotChat.queryRobotChatMessage = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/robotchat/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/queryrobotchatmessage/';
 uri += REST.Encoding.encodePathSegment(params.sessionId);
 if(params.cursor)
  request.addQueryParameter('cursor', params.cursor);
 if(params.count)
  request.addQueryParameter('count', params.count);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /robotchat/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/getrobotphoto
RobotChat.getRobotPhoto = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/robotchat/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/getrobotphoto';
 if(params.src)
  request.addQueryParameter('src', params.src);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
var TextChat = {};
// DELETE /textchat/{workno:[1-9][\d]{0,3}|1[\d]{4}}/reject/{callid}
TextChat.reject = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('DELETE');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/reject/';
 uri += REST.Encoding.encodePathSegment(params.callid);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// PUT /textchat/{workno:[1-9][\d]{0,3}|1[\d]{4}}/answer/{callid}
TextChat.answer = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('PUT');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/answer/';
 uri += REST.Encoding.encodePathSegment(params.callid);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /textchat/{workno:[1-9][\d]{0,3}|1[\d]{4}}/getemail/{msgId}
TextChat.getEmail = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/getemail/';
 uri += REST.Encoding.encodePathSegment(params.msgId);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /textchat/{workno:[1-9][\d]{0,3}|1[\d]{4}}/querychatcall
TextChat.queryChatCallHistory = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/querychatcall';
 if(params.sender)
  request.addQueryParameter('sender', params.sender);
 if(params.receiver)
  request.addQueryParameter('receiver', params.receiver);
 if(params.rela)
  request.addQueryParameter('rela', params.rela);
 if(params.type)
  request.addQueryParameter('type', params.type);
 if(params.startdate)
  request.addQueryParameter('startdate', params.startdate);
 if(params.enddate)
  request.addQueryParameter('enddate', params.enddate);
 if(params.cursor)
  request.addQueryParameter('cursor', params.cursor);
 if(params.count)
  request.addQueryParameter('count', params.count);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /textchat/{workno:[1-9][\d]{0,3}|1[\d]{4}}/querychat
TextChat.queryChatMessage = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/querychat';
 if(params.sender)
  request.addQueryParameter('sender', params.sender);
 if(params.receiver)
  request.addQueryParameter('receiver', params.receiver);
 if(params.rela)
  request.addQueryParameter('rela', params.rela);
 if(params.callid)
  request.addQueryParameter('callid', params.callid);
 if(params.startdate)
  request.addQueryParameter('startdate', params.startdate);
 if(params.enddate)
  request.addQueryParameter('enddate', params.enddate);
 if(params.cursor)
  request.addQueryParameter('cursor', params.cursor);
 if(params.count)
  request.addQueryParameter('count', params.count);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /textchat/{workno:[1-9][\d]{0,3}|1[\d]{4}}/getclient/{clientId}
TextChat.getClient = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/getclient/';
 uri += REST.Encoding.encodePathSegment(params.clientId);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /textchat/{workno:[1-9][\d]{0,3}|1[\d]{4}}/getphoto/{picId}
TextChat.getPhoto = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/getphoto/';
 uri += REST.Encoding.encodePathSegment(params.picId);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// PUT /textchat/{workno:[1-9][\d]{0,3}|1[\d]{4}}/sendphoto
TextChat.sendPhoto = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('PUT');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/sendphoto';
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// PUT /textchat/{workno:[1-9][\d]{0,3}|1[\d]{4}}/internalcall/{destno:[1-9][\d]{0,3}|1[\d]{4}}
TextChat.callout = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('PUT');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/internalcall/';
 uri += REST.Encoding.encodePathSegment(params.destno);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// PUT /textchat/{workno:[1-9][\d]{0,3}|1[\d]{4}}/chatmessage
TextChat.chat = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('PUT');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/chatmessage';
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// DELETE /textchat/{workno:[1-9][\d]{0,3}|1[\d]{4}}/drop/{callid}
TextChat.drop = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('DELETE');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/drop/';
 uri += REST.Encoding.encodePathSegment(params.callid);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// DELETE /textchat/{workno:[1-9][\d]{0,3}|1[\d]{4}}/forcedrop/{callid}
TextChat.forceDrop = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('DELETE');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/forcedrop/';
 uri += REST.Encoding.encodePathSegment(params.callid);
 if(params.selectworkno)
  request.addQueryParameter('selectworkno', params.selectworkno);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /textchat/{workno:[1-9][\d]{0,3}|1[\d]{4}}/transfer
TextChat.transer = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/transfer';
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /textchat/{workno:[1-9][\d]{0,3}|1[\d]{4}}/forcetransfer
TextChat.forceTranser = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/forcetransfer';
 if(params.$entity)
  request.setEntity(params.$entity);
 if(params.selectworkno)
  request.addQueryParameter('selectworkno', params.selectworkno);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /textchat/{workno:[1-9][\d]{0,3}|1[\d]{4}}/getchat/{chatid}
TextChat.getChatMessage = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/getchat/';
 uri += REST.Encoding.encodePathSegment(params.chatid);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /textchat/{workno:[1-9][\d]{0,3}|1[\d]{4}}/getchatbycallid/{callid}
TextChat.getChatMessageByCallId = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/getchatbycallid/';
 uri += REST.Encoding.encodePathSegment(params.callid);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /textchat/{workno:[1-9][\d]{0,3}|1[\d]{4}}/getcallrecordbycallid/{callid}
TextChat.getCallRecordByCallId = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/getcallrecordbycallid/';
 uri += REST.Encoding.encodePathSegment(params.callid);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /textchat/{workno:[1-9][\d]{0,3}|1[\d]{4}}/getattach/{fileId}
TextChat.getAttach = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/getattach/';
 uri += REST.Encoding.encodePathSegment(params.fileId);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /textchat/{workno:[1-9][\d]{0,3}|1[\d]{4}}/getemailattach/{fileId}
TextChat.getEmailAttach = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/getemailattach/';
 uri += REST.Encoding.encodePathSegment(params.fileId);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /textchat/{workno:[1-9][\d]{0,3}|1[\d]{4}}/getemaileml/{fileId}
TextChat.getEmailEml = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/getemaileml/';
 uri += REST.Encoding.encodePathSegment(params.fileId);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /textchat/{workno:[1-9][\d]{0,3}|1[\d]{4}}/getemailbymessageid/{messageid}
TextChat.getEmailByMessageId = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/getemailbymessageid/';
 uri += REST.Encoding.encodePathSegment(params.messageid);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /textchat/{workno:[1-9][\d]{0,3}|1[\d]{4}}/getemailbycallid/{callid}
TextChat.getEmailByCallId = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/getemailbycallid/';
 uri += REST.Encoding.encodePathSegment(params.callid);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /textchat/{workno:[1-9][\d]{0,3}|1[\d]{4}}/getoriemail/{oriEmailId}
TextChat.getOriEmail = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/getoriemail/';
 uri += REST.Encoding.encodePathSegment(params.oriEmailId);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /textchat/{workno:[1-9][\d]{0,3}|1[\d]{4}}/getreplyemail/{oriEmailId}
TextChat.getRelpyEmail = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/getreplyemail/';
 uri += REST.Encoding.encodePathSegment(params.oriEmailId);
 if(params.type)
  request.addQueryParameter('type', params.type);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /textchat/{workno:[1-9][\d]{0,3}|1[\d]{4}}/queryemail
TextChat.queryEmailMessage = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/queryemail';
 if(params.agentno)
  request.addQueryParameter('agentno', params.agentno);
 if(params.startdate)
  request.addQueryParameter('startdate', params.startdate);
 if(params.enddate)
  request.addQueryParameter('enddate', params.enddate);
 if(params.cursor)
  request.addQueryParameter('cursor', params.cursor);
 if(params.count)
  request.addQueryParameter('count', params.count);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /textchat/{workno:[1-9][\d]{0,3}|1[\d]{4}}/queryreplyemailbyworkno
TextChat.queryReplyEmailByWorkNo = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/queryreplyemailbyworkno';
 if(params.agentno)
  request.addQueryParameter('agentno', params.agentno);
 if(params.startdate)
  request.addQueryParameter('startdate', params.startdate);
 if(params.enddate)
  request.addQueryParameter('enddate', params.enddate);
 if(params.cursor)
  request.addQueryParameter('cursor', params.cursor);
 if(params.count)
  request.addQueryParameter('count', params.count);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /textchat/{workno:[1-9][\d]{0,3}|1[\d]{4}}/queryreplyemaillistbyoriemailid
TextChat.queryReplyEmailListByOriEmailId = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/queryreplyemaillistbyoriemailid';
 if(params.oriemailid)
  request.addQueryParameter('oriemailid', params.oriemailid);
 if(params.cursor)
  request.addQueryParameter('cursor', params.cursor);
 if(params.count)
  request.addQueryParameter('count', params.count);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// PUT /textchat/{workno:[1-9][\d]{0,3}|1[\d]{4}}/savedelayhanleemail
TextChat.saveDelayHandleEmail = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('PUT');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/savedelayhanleemail';
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /textchat/{workno:[1-9][\d]{0,3}|1[\d]{4}}/querydelayhandleemail
TextChat.queryDelayHandleEmail = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/querydelayhandleemail';
 if(params.agentno)
  request.addQueryParameter('agentno', params.agentno);
 if(params.startdate)
  request.addQueryParameter('startdate', params.startdate);
 if(params.enddate)
  request.addQueryParameter('enddate', params.enddate);
 if(params.cursor)
  request.addQueryParameter('cursor', params.cursor);
 if(params.count)
  request.addQueryParameter('count', params.count);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// PUT /textchat/{workno:[1-9][\d]{0,3}|1[\d]{4}}/cancelreplydelayemail
TextChat.cancelReplyDelayEmail = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('PUT');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/cancelreplydelayemail';
 if(params.emailid)
  request.addQueryParameter('emailid', params.emailid);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// PUT /textchat/{workno:[1-9][\d]{0,3}|1[\d]{4}}/replyemail/{callid}
TextChat.replyEmail = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('PUT');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/replyemail/';
 uri += REST.Encoding.encodePathSegment(params.callid);
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// PUT /textchat/{workno:[1-9][\d]{0,3}|1[\d]{4}}/replyemailexwithoricontent/{callid}
TextChat.replyEmailExWithOriContent = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('PUT');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/replyemailexwithoricontent/';
 uri += REST.Encoding.encodePathSegment(params.callid);
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// PUT /textchat/{workno:[1-9][\d]{0,3}|1[\d]{4}}/replyemailwithoutcall
TextChat.replyEmailWithoutCall = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('PUT');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/replyemailwithoutcall';
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// PUT /textchat/{workno:[1-9][\d]{0,3}|1[\d]{4}}/replyemailwithoutcallex
TextChat.replyEmailWithoutCallEx = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('PUT');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/replyemailwithoutcallex';
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// PUT /textchat/{workno:[1-9][\d]{0,3}|1[\d]{4}}/replyemailEx/{callid}
TextChat.replyEmailEx = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('PUT');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/replyemailEx/';
 uri += REST.Encoding.encodePathSegment(params.callid);
 if(params.from)
  request.addQueryParameter('from', params.from);
 if(params.to)
  request.addQueryParameter('to', params.to);
 if(params.cc)
  request.addQueryParameter('cc', params.cc);
 if(params.bcc)
  request.addQueryParameter('bcc', params.bcc);
 if(params.subject)
  request.addQueryParameter('subject', params.subject);
 if(params.htmlcontent)
  request.addQueryParameter('htmlcontent', params.htmlcontent);
 if(params.origenMessageId)
  request.addQueryParameter('origenMessageId', params.origenMessageId);
 if(params.requester)
  request.addQueryParameter('requester', params.requester);
 if(params.attchids)
  request.addQueryParameter('attchids', params.attchids);
 if(params.attchnames)
  request.addQueryParameter('attchnames', params.attchnames);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /textchat/{workno:[1-9][\d]{0,3}|1[\d]{4}}/sendemailattach/{callid}
TextChat.sendEmailAttach = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/sendemailattach/';
 uri += REST.Encoding.encodePathSegment(params.callid);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('text/plain; charset=utf-8');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /textchat/{workno:[1-9][\d]{0,3}|1[\d]{4}}/sendemailattachex/{callid}
TextChat.sendEmailAttachEx = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/sendemailattachex/';
 uri += REST.Encoding.encodePathSegment(params.callid);
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /textchat/{workno:[1-9][\d]{0,3}|1[\d]{4}}/getweibo/{weiboId}
TextChat.getWeibo = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/getweibo/';
 uri += REST.Encoding.encodePathSegment(params.weiboId);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /textchat/{workno:[1-9][\d]{0,3}|1[\d]{4}}/getoriweibo/{weiboId}/{type}
TextChat.getOriWeibo = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/getoriweibo/';
 uri += REST.Encoding.encodePathSegment(params.weiboId);
 uri += '/';
 uri += REST.Encoding.encodePathSegment(params.type);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /textchat/{workno:[1-9][\d]{0,3}|1[\d]{4}}/getreplyweibo/{weiboId}/{type}
TextChat.getReplyWeibo = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/getreplyweibo/';
 uri += REST.Encoding.encodePathSegment(params.weiboId);
 uri += '/';
 uri += REST.Encoding.encodePathSegment(params.type);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /textchat/{workno:[1-9][\d]{0,3}|1[\d]{4}}/getweibobycallid/{callid}/{type}
TextChat.getWeiboByCallId = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/getweibobycallid/';
 uri += REST.Encoding.encodePathSegment(params.callid);
 uri += '/';
 uri += REST.Encoding.encodePathSegment(params.type);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// PUT /textchat/{workno:[1-9][\d]{0,3}|1[\d]{4}}/replyweibo/{callid}
TextChat.replyWeibo = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('PUT');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/replyweibo/';
 uri += REST.Encoding.encodePathSegment(params.callid);
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// PUT /textchat/{workno:[1-9][\d]{0,3}|1[\d]{4}}/replyqweibo/{callid}
TextChat.replyQWeibo = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('PUT');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/replyqweibo/';
 uri += REST.Encoding.encodePathSegment(params.callid);
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /textchat/{workno:[1-9][\d]{0,3}|1[\d]{4}}/queryweibo
TextChat.queryWeibo = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/queryweibo';
 if(params.agentno)
  request.addQueryParameter('agentno', params.agentno);
 if(params.startdate)
  request.addQueryParameter('startdate', params.startdate);
 if(params.enddate)
  request.addQueryParameter('enddate', params.enddate);
 if(params.type)
  request.addQueryParameter('type', params.type);
 if(params.cursor)
  request.addQueryParameter('cursor', params.cursor);
 if(params.count)
  request.addQueryParameter('count', params.count);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /textchat/{workno:[1-9][\d]{0,3}|1[\d]{4}}/getonlinemsg/{msgId}
TextChat.getOnlineMessage = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/getonlinemsg/';
 uri += REST.Encoding.encodePathSegment(params.msgId);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /textchat/{workno:[1-9][\d]{0,3}|1[\d]{4}}/getonlinemsgphoto/{picId}
TextChat.getOnlineMessagePhoto = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/getonlinemsgphoto/';
 uri += REST.Encoding.encodePathSegment(params.picId);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /textchat/{workno:[1-9][\d]{0,3}|1[\d]{4}}/getonlinemsgattach/{fileId}
TextChat.getOnlineMessageAttach = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/getonlinemsgattach/';
 uri += REST.Encoding.encodePathSegment(params.fileId);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /textchat/{workno:[1-9][\d]{0,3}|1[\d]{4}}/getonlinemsgex/{msgId}
TextChat.getOnlineMessageEx = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/getonlinemsgex/';
 uri += REST.Encoding.encodePathSegment(params.msgId);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /textchat/{workno:[1-9][\d]{0,3}|1[\d]{4}}/getonlinemsgbyonlinemsgid/{onlinemsgid}
TextChat.getOnlineMessageByOnlineMsgId = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/getonlinemsgbyonlinemsgid/';
 uri += REST.Encoding.encodePathSegment(params.onlinemsgid);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /textchat/{workno:[1-9][\d]{0,3}|1[\d]{4}}/getonlinemsgbycallid/{callid}
TextChat.getOnlineMessageByCallId = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/getonlinemsgbycallid/';
 uri += REST.Encoding.encodePathSegment(params.callid);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// PUT /textchat/{workno:[1-9][\d]{0,3}|1[\d]{4}}/replyonlinemessagebyemail/{callid}
TextChat.replyOnlineMessageByEmail = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('PUT');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/replyonlinemessagebyemail/';
 uri += REST.Encoding.encodePathSegment(params.callid);
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /textchat/{workno:[1-9][\d]{0,3}|1[\d]{4}}/queryonlinemsg
TextChat.queryOnlineMessage = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/queryonlinemsg';
 if(params.agentno)
  request.addQueryParameter('agentno', params.agentno);
 if(params.startdate)
  request.addQueryParameter('startdate', params.startdate);
 if(params.enddate)
  request.addQueryParameter('enddate', params.enddate);
 if(params.cursor)
  request.addQueryParameter('cursor', params.cursor);
 if(params.count)
  request.addQueryParameter('count', params.count);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /textchat/{workno:[1-9][\d]{0,3}|1[\d]{4}}/getemailphoto/{picId}
TextChat.getEmailPhoto = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/getemailphoto/';
 uri += REST.Encoding.encodePathSegment(params.picId);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /textchat/{workno:[1-9][\d]{0,3}|1[\d]{4}}/attach/request
TextChat.attachreq = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/attach/request';
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /textchat/{workno:[1-9][\d]{0,3}|1[\d]{4}}/attach/accept
TextChat.acceptAttach = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/attach/accept';
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /textchat/{workno:[1-9][\d]{0,3}|1[\d]{4}}/attach/reject
TextChat.rejectAttach = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/attach/reject';
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /textchat/{workno:[1-9][\d]{0,3}|1[\d]{4}}/attach/finish
TextChat.finishAttach = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/attach/finish';
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /textchat/{workno:[1-9][\d]{0,3}|1[\d]{4}}/attach/abort
TextChat.abortAttach = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/attach/abort';
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /textchat/{workno:[1-9][\d]{0,3}|1[\d]{4}}/attach/transfer
TextChat.transferAttach = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/attach/transfer';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('text/plain');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /textchat/{workno:[1-9][\d]{0,3}|1[\d]{4}}/queryonlinechatcall
TextChat.queryOnlineChatCall = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/queryonlinechatcall';
 if(params.agentno)
  request.addQueryParameter('agentno', params.agentno);
 if(params.type)
  request.addQueryParameter('type', params.type);
 if(params.cursor)
  request.addQueryParameter('cursor', params.cursor);
 if(params.count)
  request.addQueryParameter('count', params.count);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /textchat/{workno:[1-9][\d]{0,3}|1[\d]{4}}/queryonlinechatcallforcms
TextChat.queryOnlineChatCallForCms = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/queryonlinechatcallforcms';
 if(params.agentno)
  request.addQueryParameter('agentno', params.agentno);
 if(params.type)
  request.addQueryParameter('type', params.type);
 if(params.cursor)
  request.addQueryParameter('cursor', params.cursor);
 if(params.count)
  request.addQueryParameter('count', params.count);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /textchat/{workno:[1-9][\d]{0,3}|1[\d]{4}}/queryscore
TextChat.queryScore = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/queryscore';
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /textchat/{workno:[1-9][\d]{0,3}|1[\d]{4}}/getscorebycallid/{callid}
TextChat.getScoreByCallId = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/getscorebycallid/';
 uri += REST.Encoding.encodePathSegment(params.callid);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /textchat/{workno:[1-9][\d]{0,3}|1[\d]{4}}/screenshare/request
TextChat.screenShareRequest = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/screenshare/request';
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /textchat/{workno:[1-9][\d]{0,3}|1[\d]{4}}/screenshare/updatestatus
TextChat.screenShareOngoing = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/screenshare/updatestatus';
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /textchat/{workno:[1-9][\d]{0,3}|1[\d]{4}}/screenshare/accept
TextChat.screenShareAccept = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/screenshare/accept';
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /textchat/{workno:[1-9][\d]{0,3}|1[\d]{4}}/screenshare/abort
TextChat.screenShareAbort = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/screenshare/abort';
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /textchat/{workno:[1-9][\d]{0,3}|1[\d]{4}}/screenshare/reject
TextChat.screenShareReject = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/screenshare/reject';
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /textchat/{workno:[1-9][\d]{0,3}|1[\d]{4}}/screenshare/finish
TextChat.screenShareFinsih = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/screenshare/finish';
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// PUT /textchat/{workno:[1-9][\d]{0,3}|1[\d]{4}}/replyonlinemessagebyemailex/{callid}
TextChat.replyOnlineMessageByEmailEx = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('PUT');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/replyonlinemessagebyemailex/';
 uri += REST.Encoding.encodePathSegment(params.callid);
 if(params.from)
  request.addQueryParameter('from', params.from);
 if(params.to)
  request.addQueryParameter('to', params.to);
 if(params.subject)
  request.addQueryParameter('subject', params.subject);
 if(params.htmlcontent)
  request.addQueryParameter('htmlcontent', params.htmlcontent);
 if(params.requester)
  request.addQueryParameter('requester', params.requester);
 if(params.origenMessageId)
  request.addQueryParameter('origenMessageId', params.origenMessageId);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /textchat/{workno:[1-9][\d]{0,3}|1[\d]{4}}/getallemailaccount
TextChat.getAllEmailAccount = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/getallemailaccount';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// PUT /textchat/{workno:[1-9][\d]{0,3}|1[\d]{4}}/inviteagenttochatroom
TextChat.inviteAgentToChatRoom = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('PUT');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/inviteagenttochatroom';
 if(params.callid)
  request.addQueryParameter('callid', params.callid);
 if(params.agentno)
  request.addQueryParameter('agentno', params.agentno);
 if(params.clientscreenname)
  request.addQueryParameter('clientscreenname', params.clientscreenname);
 if(params.clientusername)
  request.addQueryParameter('clientusername', params.clientusername);
 if(params.clienttype)
  request.addQueryParameter('clienttype', params.clienttype);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// PUT /textchat/{workno:[1-9][\d]{0,3}|1[\d]{4}}/answerchatroom
TextChat.answerChatRoom = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('PUT');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/answerchatroom';
 if(params.callid)
  request.addQueryParameter('callid', params.callid);
 if(params.host)
  request.addQueryParameter('host', params.host);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// PUT /textchat/{workno:[1-9][\d]{0,3}|1[\d]{4}}/chatroommessage
TextChat.chatRoom = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('PUT');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/chatroommessage';
 if(params.host)
  request.addQueryParameter('host', params.host);
 if(params.otheragent)
  request.addQueryParameter('otheragent', params.otheragent);
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// PUT /textchat/{workno:[1-9][\d]{0,3}|1[\d]{4}}/dropchatroom
TextChat.dropChatRoom = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('PUT');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/dropchatroom';
 if(params.host)
  request.addQueryParameter('host', params.host);
 if(params.otheragent)
  request.addQueryParameter('otheragent', params.otheragent);
 if(params.callid)
  request.addQueryParameter('callid', params.callid);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /textchat/{workno:[1-9][\d]{0,3}|1[\d]{4}}/getfaxmessagebyfaxid
TextChat.getFaxMessageByFaxId = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/getfaxmessagebyfaxid';
 if(params.faxid)
  request.addQueryParameter('faxid', params.faxid);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /textchat/{workno:[1-9][\d]{0,3}|1[\d]{4}}/getfaxphoto
TextChat.getFaxPhoto = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/getfaxphoto';
 if(params.filepath)
  request.addQueryParameter('filepath', params.filepath);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /textchat/{workno:[1-9][\d]{0,3}|1[\d]{4}}/sendfaxattach/{callid}
TextChat.sendFaxAttach = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/sendfaxattach/';
 uri += REST.Encoding.encodePathSegment(params.callid);
 if(params.origenmessageid)
  request.addQueryParameter('origenmessageid', params.origenmessageid);
 if(params.faxnumber)
  request.addQueryParameter('faxnumber', params.faxnumber);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('text/plain; charset=utf-8');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /textchat/{workno:[1-9][\d]{0,3}|1[\d]{4}}/queryfax
TextChat.queryFaxMessage = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/queryfax';
 if(params.agentno)
  request.addQueryParameter('agentno', params.agentno);
 if(params.startdate)
  request.addQueryParameter('startdate', params.startdate);
 if(params.enddate)
  request.addQueryParameter('enddate', params.enddate);
 if(params.cursor)
  request.addQueryParameter('cursor', params.cursor);
 if(params.count)
  request.addQueryParameter('count', params.count);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /textchat/{workno:[1-9][\d]{0,3}|1[\d]{4}}/getreplyfax/{orifaxid}
TextChat.getRelpyFax = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/getreplyfax/';
 uri += REST.Encoding.encodePathSegment(params.orifaxid);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /textchat/{workno:[1-9][\d]{0,3}|1[\d]{4}}/getfaxbymsgid/{msgid}
TextChat.getFaxMessageByMsgId = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/getfaxbymsgid/';
 uri += REST.Encoding.encodePathSegment(params.msgid);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /textchat/{workno:[1-9][\d]{0,3}|1[\d]{4}}/getfaxbycallid/{callid}
TextChat.getFaxMessageByCallId = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/getfaxbycallid/';
 uri += REST.Encoding.encodePathSegment(params.callid);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /textchat/{workno:[1-9][\d]{0,3}|1[\d]{4}}/querytimeoutofemail
TextChat.queryTimeoutOfEmail = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/querytimeoutofemail';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /textchat/{workno:[1-9][\d]{0,3}|1[\d]{4}}/getwaitemailcount
TextChat.getWaitEmailCount = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/getwaitemailcount';
 if(params.condition)
  request.addQueryParameter('condition', params.condition);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /textchat/{workno:[1-9][\d]{0,3}|1[\d]{4}}/getvoicemessagebyvoiceId
TextChat.getVoiceMessageByVoiceId = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/getvoicemessagebyvoiceId';
 if(params.voiceid)
  request.addQueryParameter('voiceid', params.voiceid);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /textchat/{workno:[1-9][\d]{0,3}|1[\d]{4}}/getvoicebycallid/{callid}
TextChat.getVoiceMessageByCallId = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/getvoicebycallid/';
 uri += REST.Encoding.encodePathSegment(params.callid);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /textchat/{workno:[1-9][\d]{0,3}|1[\d]{4}}/queryvoicemessage
TextChat.queryVoiceMessage = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/queryvoicemessage';
 if(params.agentno)
  request.addQueryParameter('agentno', params.agentno);
 if(params.startdate)
  request.addQueryParameter('startdate', params.startdate);
 if(params.enddate)
  request.addQueryParameter('enddate', params.enddate);
 if(params.cursor)
  request.addQueryParameter('cursor', params.cursor);
 if(params.count)
  request.addQueryParameter('count', params.count);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /textchat/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/getquickrelpylist
TextChat.getQuickRelpyList = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/getquickrelpylist';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// PUT /textchat/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/insertquickrelpy
TextChat.insertQuickRelpy = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('PUT');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/insertquickrelpy';
 if(params.content)
  request.addQueryParameter('content', params.content);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /textchat/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/updatequickrelpy
TextChat.updateQuickRelpy = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/updatequickrelpy';
 if(params.content)
  request.addQueryParameter('content', params.content);
 if(params.id)
  request.addQueryParameter('id', params.id);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// DELETE /textchat/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/deletequickrelpy
TextChat.deleteQuickRelpy = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('DELETE');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/deletequickrelpy';
 if(params.id)
  request.addQueryParameter('id', params.id);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /textchat/{workno:[1-9][\d]{0,3}|1[\d]{4}}/agenttextchatstatus/{vdnid}
TextChat.getAgentTextChatStatus = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/agenttextchatstatus/';
 uri += REST.Encoding.encodePathSegment(params.vdnid);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// GET /textchat/{workno:[1-9][\d]{0,3}|1[\d]{4}}/assistantvoice/{callid}
TextChat.getAssistantVoiceByTextCallId = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/assistantvoice/';
 uri += REST.Encoding.encodePathSegment(params.callid);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
// POST /textchat/{workno:[1-9][\d]{0,3}|1[\d]{4}}/querychatcallbycustomer
TextChat.queryChatCallHistoryByCustomer = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('POST');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/textchat/';
 uri += REST.Encoding.encodePathSegment(params.workno);
 uri += '/querychatcallbycustomer';
 if(params.$entity)
  request.setEntity(params.$entity);
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('application/json');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};
var ThirdpartyApp = {};
// GET /thirdpartyapp/{agentid:[1-9][\d]{0,3}|1[\d]{4}}/querythirdpartyappconfig
ThirdpartyApp.queryThirdpartyAppConfig = function(_params){
 var params = _params ? _params : {};
 var request = new REST.Request();
 request.setMethod('GET');
 var uri = params.$apiURL ? params.$apiURL : REST.apiURL;
 uri += '/thirdpartyapp/';
 uri += REST.Encoding.encodePathSegment(params.agentid);
 uri += '/querythirdpartyappconfig';
 request.setURI(uri);
 if(params.$username && params.$password)
  request.setCredentials(params.$username, params.$password);
 if(params.$accepts)
  request.setAccepts(params.$accepts);
 else
  request.setAccepts('application/json');
 if(params.$contentType)
  request.setContentType(params.$contentType);
 else
  request.setContentType('text/plain');
 if(params.$callback){
  request.execute(params.$callback);
 }else{
  var returnValue;
  request.setAsync(false);
  var callback = function(httpCode, xmlHttpRequest, value){ returnValue = value;};
  request.execute(callback);
  return returnValue;
 }
};

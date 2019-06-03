getUrlParamAsInt = function(parameter, defaultvalue) 
{
  var params = {};
  var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
    params[key] = value;
  });
  var urlparameter = defaultvalue;
  if(window.location.href.indexOf(parameter) > -1) {
    urlparameter = parseInt(params[parameter]);
  }
  return urlparameter;
}

getUrlParamAsString = function(parameter, defaultvalue) 
{
  var params = {};
  var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
    params[key] = value;
  });
  var urlparameter = defaultvalue;
  if(window.location.href.indexOf(parameter) > -1) {
    urlparameter = params[parameter];
  }
  return urlparameter;
}

getLanguage = function()
{
  var language = getUrlParamAsString("lang", "")
  if (language == "") {
    language = navigator.language || navigator.userLanguage;
  }
  console.log("Found language", language)
  if (language.startsWith("de")) {
    language = "de";
  }
  else {
    language = "en";
  }
  return language
}

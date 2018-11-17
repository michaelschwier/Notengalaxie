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

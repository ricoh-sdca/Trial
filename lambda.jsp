<%@ page language="java" pageEncoding="UTF-8"%>
<%@page import="org.apache.log4j.Logger"%>
<%@page import="java.util.ArrayList"%>
<%@page import="java.util.List"%>
<%@page import="org.apache.http.HttpResponse"%>
<%@page import="org.apache.http.NameValuePair"%>
<%@page import="org.apache.http.client.HttpClient"%>
<%@page import="org.apache.http.client.entity.UrlEncodedFormEntity"%>
<%@page import="org.apache.http.message.BasicNameValuePair"%>
<%@page import="org.apache.http.client.methods.HttpPost"%>
<%@page import="org.apache.http.impl.client.DefaultHttpClient"%>
<%@page import="net.sf.json.JSONObject"%>
<%@page import="ricoh.trial.utils.*"%>

<%
Logger LOGGER = Logger.getLogger(this.getClass());

final String url = "https://tpadwb65rk.execute-api.us-east-1.amazonaws.com/v1/rsi/trial/signup";

//Devu
final String appKey = "D959AAEEE9F271649D8685E96C4880DCA574F582C5584F59CA4D5BA5CE5B5A630FDB30004FF6CB88559253EF7ECA636808CD759CCD811E15336ACB0B8F834677FA8FCDDF94616AABFBD7B370E9D50D3F";
final String mode = "trial";
final String sku = "SKU-00001146";
final String ratePlanId = "8adce4216b26ca48016b41f85e107b7a";
final String chargeId = "8adc9dee6b26c21d016b41fbb18d2343";

/*
//Production
final String appKey = "27A6EE8085DCE981D3B2EB0192F2E556B5E9B699A07E3C892251D8889C6ED3CD30ABD7907FDDE4B0C1F5BC4B7329A60C302DE1782BD4C2A41C5E3D15DC904F6CD20150EFFBF52811";
final String mode = "trial";
final String sku = "SKU-00000072";
final String ratePlanId = "8a28a0056c0a3f30016c0be9c78f20d6";
final String chargeId = "8a28fd456c0a515e016c0beb957106a7";
*/

String result = "";
response.setContentType("application/x-json;charset=UTF-8");
//parameters
/*
String firstName = "Jack";
String lastName = "Smith";
String customerEmail = "aintest+22@gmail.com";
String companyName = "Ricoh";
String phoneNumber = null;
*/
String firstName = request.getParameter("firstName");
String lastName = request.getParameter("lastName");
String customerEmail = request.getParameter("customerEmail");
String companyName = request.getParameter("companyName");
String phoneNumber = request.getParameter("phoneNumber");

if(phoneNumber==null) {
	phoneNumber="";
}


HttpPost httpPost = new HttpPost(url);
HttpClient client = new DefaultHttpClient();

List<NameValuePair> parameters = new ArrayList<NameValuePair>();
parameters.add(new BasicNameValuePair("appkey", appKey));
parameters.add(new BasicNameValuePair("mode", mode));
parameters.add(new BasicNameValuePair("sku", sku));
parameters.add(new BasicNameValuePair("ratePlanId", ratePlanId));
parameters.add(new BasicNameValuePair("chargeId", chargeId));
//parameters.add(new BasicNameValuePair("payload", "false"));

parameters.add(new BasicNameValuePair("firstName", firstName));
parameters.add(new BasicNameValuePair("lastName", lastName));
parameters.add(new BasicNameValuePair("customerEmail", customerEmail));
parameters.add(new BasicNameValuePair("companyName", companyName));
parameters.add(new BasicNameValuePair("phoneNumber", phoneNumber));

UrlEncodedFormEntity entity = new UrlEncodedFormEntity(parameters);
httpPost.setEntity(entity);

HttpResponse resp = client.execute(httpPost);

if (resp != null && resp.getEntity() != null) {
	String jsonString = TrialUtil.convertInputStreamToString(resp.getEntity().getContent());
	//LOGGER.info("**********response:" + jsonString);
	
	JSONObject jsonObject = JSONObject.fromObject(jsonString);
	String status = jsonObject.optString("status");
	//if success
	if(status!=null && status.equalsIgnoreCase("ok")) {
		result = "{\"result\":\"success\"}";
	//if failure
	}else{	
		JSONObject error = jsonObject.optJSONObject("error");
		if (error != null) {
			String errMsg = error.optString("description");
			String extraMsg = "";
			if(jsonObject.optJSONObject("detail")!=null){
				extraMsg = jsonObject.optJSONObject("detail").optString("extramessage");
				if(extraMsg==null) {
					extraMsg = "";
				}
			}
			result = "{\"result\":\"error\", \"errorDetail\":\"" + errMsg+ "\", \"extraMsg\":\"" + extraMsg+ "\"}";
		}else{
			String errMsg = jsonObject.optString("message");
			if(errMsg==null || errMsg.length()==0){
				errMsg = "unknow error";
			}
			result = "{\"result\":\"error\", \"errorDetail\":\"" + errMsg+ "\", \"extraMsg\":\"\"}";
		}
	}
}

//System.out.println("**********result=" + result);
out.print(result);
%>
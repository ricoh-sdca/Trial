

var states = new Array();
var countries = new Array();

var industries = new Array();
var departments = new Array();
var companyEmps = new Array();
var companyEmpValues = new Array();
var departmentEmps = new Array();
var departmentEmpValues = new Array();


states['Canada'] = new Array('','Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'NewFoundland and Labrador', 'Northwest Territories', 'Nova Scotia', 'Nunavut','Ontario', 'Prince Edward Island', 'Quebec', 'Saskatchewan','Yukon');
states['USA'] = new Array('','Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'District of Columbia', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming');

countries['ALL'] = new Array('','USA','Afghanistan','Albania','Algeria','Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia','Australia', 'Austria', 'Azerbaijan', 'Bahamas','Bahrain', 'Bangladesh', 'Barbados','Belarus','Belgium','Belize','Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Bulgaria', 'Burkina Faso', 'Burundi','Cambodia','Cameroon','Canada', 'Cape Verde','Central African Republic', 'Chad', 'Chile','China', 'Colombi','Comoros', 'Congo (Brazzaville)', 'Congo', 'Costa Rica', 
'Cote d\'Ivoire', 'Croatia','Cuba','Cyprus','Czech Republic', 'Denmark', 'Djibouti', 'Dominica','Dominican Republic', 'East Timor (Timor Timur)', 'Ecuador', 'Egypt','El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia','Ethiopia', 'Fiji', 'Finland', 'France', 'Gabon', 'Gambia, The', 'Georgia','Germany','Ghana','Greece', 'Grenada','Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana', 'Haiti', 'Honduras', 'Hungary','Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Jamaica', 'Japan', 'Jordan','Kazakhstan', 'Kenya', 'Kiribati', 'Korea, North', 'Korea, South', 'Kuwait', 'Kyrgyzstan', 'Laos','Latvia', 'Lebanon', 'Lesotho', 'Liberia','Libya','Liechtenstein', 'Lithuania', 'Luxembourg', 'Macedonia', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Morocco', 'Mozambique', 'Myanmar', 
'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'Norway', 'Oman', 'Pakistan', 'Palau', 'Panama', 'Papua New Guinea', 'Paraguay','Peru','Philippines', 'Poland', 'Portugal', 'Qatar','Romania', 'Russia', 'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia','Saint Vincent', 'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia', 'Senegal', 'Serbia and Montenegro', 'Seychelles', 'Sierra Leone', 'Singapore','Slovakia', 'Slovenia', 'Solomon Islands','Somalia', 'South Africa', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Swaziland', 'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Togo', 'Tonga','Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates','United Kingdom', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe');



industries['ALL'] = new Array('','Automotive','Finance/Insurance','Education','Energy','Food & Beverage','Government','Healthcare','Manufacture','Media','Real Estate','Retail','Technology','Telecom','Transportation','Other'); 
departments['ALL'] = new Array('','Accounting','HR','IT','Legal','Marketing','Procurement','R & D','Sales','Other');

companyEmps['ALL'] = new Array('','1-10','11-50','51-100','101-250','251-500','501-1000','1001-10000','10000+');
companyEmpValues['ALL'] = new Array('','1','2','3','4','5','6','7','8');

departmentEmps['ALL'] = new Array('','1-10','11-25','26-50','50+');
departmentEmpValues['ALL'] = new Array('','1','2','3','4');

function trimAll(str)
{
	/*************************************************************
	Input Parameter :str
	Purpose         : remove all white spaces in front and back of string
	Return          : str without white spaces    
	***************************************************************/

	//check for all spaces
	var objRegExp =/^(\s*)$/;
	if (objRegExp.test(str))
	{
		str = str.replace(objRegExp,''); 
		if (str.length == 0)
		return str; 
	} 

	// check for leading and trailling spaces
	objRegExp = /^(\s*)([\W\w]*)(\b\s*$)/;
	if(objRegExp.test(str))
	{
		str = str.replace(objRegExp, '$2');
	}
	return str;
}

function setStates() {
  cntrySel = document.getElementById('country');
  if(cntrySel.value == 'Canada')
  {
  //hide state label,show province label   
  document.getElementById("canadalabel").style.display = 'block';
  document.getElementById("stateprovince").style.display = 'block'; 
  
  document.getElementById("otherlabel").style.display = 'none'; 
  document.getElementById("uslabel").style.display = 'none';
  document.getElementById("anystateedit").style.display = 'none'; 
  
  stateList = states[cntrySel.value];
  changeSelect('state', stateList, stateList);  
  //set the otherstates value to blank
  document.getElementById("editstates").value = '';
  }
  else if(cntrySel.value == 'USA')
  {
  //hide canada,show usstate label
  document.getElementById("uslabel").style.display = 'block';
  document.getElementById("stateprovince").style.display = 'block'; 
  
  document.getElementById("canadalabel").style.display = 'none';  
  document.getElementById("otherlabel").style.display = 'none'; 
  document.getElementById("anystateedit").style.display = 'none'; 
  stateList = states[cntrySel.value];
  changeSelect('state', stateList, stateList);  
  //set the otherstates value to blank
   document.getElementById("editstates").value = '';
  }
  else
  {
  //hide province label,show other countries label and editbox
  document.getElementById("uslabel").style.display = 'none';
  document.getElementById("canadalabel").style.display = 'none';
  document.getElementById("stateprovince").style.display = 'none';
  
  document.getElementById("otherlabel").style.display = 'block'; 
  document.getElementById("anystateedit").style.display = 'block'; 
  }
}

function setCountry() {
changeSelect('country', countries['ALL'], countries['ALL']);
}

function setIndustry() {
changeSelect('industryOption', industries['ALL'], industries['ALL']);
}
function setDepartment() {
changeSelect('departmentOption', departments['ALL'], departments['ALL']);
}
function setcompanyEmpOption() {
changeSelect('companyEmpOption', companyEmps['ALL'], companyEmpValues['ALL']);
}
function setdepartmentEmpOption() {
changeSelect('departmentEmpOption', departmentEmps['ALL'], departmentEmpValues['ALL']);
}



function changeSelect(fieldID, newOptions, newValues) {
  selectField = document.getElementById(fieldID);
  selectField.options.length = 0;
  for (i=0; i<newOptions.length; i++) {
    selectField.options[selectField.length] = new Option(newOptions[i], newValues[i]);
  }
}

function showOther() {
  industrySel = document.getElementById('industryOption');
  if(industrySel.value == 'Other')  
  	document.getElementById("otherindustry").style.display = 'block';  
  else{
  	document.getElementById("otherindustry").style.display = 'none';  	  
  	document.getElementById("otherindustry")='';
  	}
}



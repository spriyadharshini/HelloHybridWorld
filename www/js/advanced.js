/*******************************************************************
 * 
 * Get DEVICE Contacts
 * 
 * Calls GET operation to collect all contacts on the device
 * and loads them into a listview.
 *  
 ********************************************************************/

 $("#btnDeviceContacts").on("click", function(e) {
	  console.log("button clicked, going to fetch local contacts");
	  $("#debug").html("finding...");
	  var options      = new ContactFindOptions();
	  options.multiple = true;
	  var fields       = ["displayName", "name"];
	  navigator.contacts.find(fields, app.onContactsSuccess, app.onContactsError, options);
});
 

 /*
 onContactsSuccess: function(contacts) {
 	$("#debug").html("Found: " + contacts.length);
 	$("#deviceContacts").empty();
 	var items = [];
 	for (var i = 0; i < contacts.length; i++) {
 		//console.log("displayName = '" + contacts[i].displayName + "'");
 		//console.log("name.formatted = '" + contacts[i].name.formatted + "'");
 		if (contacts[i].name.formatted) {
 			items.push("<li>" + contacts[i].name.formatted + "</li>");
 		}
 	}
 	$("#deviceContacts").append(items);
 	$("#deviceContacts").listview("refresh");	
	}
 
	onContactsError: function() {
	   $("#debug").html("error...");
}
 */
$.fn.serializeObject = function() {
        var o = {};
        var a = this.serializeArray();
        $.each(a, function() {
            if (o[this.name]) {
                if (!o[this.name].push) {
                    o[this.name] = [o[this.name]];
                }
                o[this.name].push(this.value || '');
            } else {
                o[this.name] = this.value || '';
            }
        });
        return o;
    };
    
var app = {
		
	/*******************************************************************
	 * 
	 * Application Constructor
	 * 
	 *******************************************************************/
    initialize: function() {
        this.bindEvents();
    },
    
    /*******************************************************************
     * 
     * Bind Event Listeners
     * 
     * Bind any events that are required on startup. Common events are:
     * 'load', 'deviceready', 'offline', and 'online'.
     * 
     *******************************************************************/
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
	
	/*******************************************************************
	 * 
	 * deviceready Event Handler
	 * 
	 *******************************************************************/
    onDeviceReady: function() {
    	
    	// Hide Status bar on hardware devices
    	StatusBar.hide();
    	
    	// List object used across contacts list & details pages 
    	var listObject = {
    		id				: null,
    	    firstName		: null,
    	    lastName		: null,
    	    city			: null,
    	    state			: null,
    	    email			: null,
    	    contactPhone	: null
    	}
		
    	// Load contact details from listObject data
    	$(document).on('pagebeforeshow', '#contact_details_page', function(){       
    		console.log("Just hit the contact_details_page");
    	    
    		var page = $("#contact_details_page");
    		page.find('img').attr('src', 'img/mugshots/' + listObject.id + '.jpg');
    		page.find( "span[name='firstName']" ).html(listObject.firstName);
    		page.find( "span[name='lastName']" ).html(listObject.lastName);
    		page.find( "span[name='city']" ).html(listObject.city);
    		page.find( "span[name='state']" ).html(listObject.state);
    		page.find( "span[name='email']" ).html(listObject.email);
    		page.find( "span[name='contactPhone']" ).html(listObject.contactPhone);
    		
    	});
    	
    	// Load Contacts Listview
    	// Load listObject from Listview-->Hidden Form
    	// When a contact list item is clicked on, load contact details page
    	$(document).on('pagebeforeshow', '#enterprise_contacts_list_page', function(){
    		
    		console.log("entering #enterprise_contacts_list_page");
    		
    		app.getContacts();
    		
    	    $('#enterprise_contacts_listview li a').each(function(){
    	        var elementID = $(this).attr('id');      
    	        var hForm = $("#" +elementID + "HiddenForm");
    	        
    	        $(document).on('click', '#'+elementID, function(event){  
    	            if(event.handled !== true) // This will prevent event triggering more then once
    	            {
    	                listObject.itemID = elementID;
    	                
    	                listObject.id = hForm.find( "input[name='id']" ).val();
    	                listObject.firstName = hForm.find( "input[name='firstName']" ).val();
    	                listObject.lastName = hForm.find( "input[name='lastName']" ).val();
    	                listObject.city = hForm.find( "input[name='city']" ).val(); 
    	                listObject.state = hForm.find( "input[name='state']" ).val(); 
    	                listObject.email = hForm.find( "input[name='email']" ).val();
    	                listObject.contactPhone = hForm.find( "input[name='contactPhone']" ).val(); 
    	                
    	                $.mobile.changePage( "#contact_details_page", { transition: "slide"} );
    	                event.handled = true;
    	            }              
    	        });
    	    });
    	    
    	}); 
    	
    	
    	//Register an event listener on the postForm submit action
        $('#postForm').submit(function(event) {
        	event.preventDefault();

            var contactForm = $(this).serializeObject();
            //console.log("contactForm = '" + contactForm + "'");
             
        	app.postContact(contactForm);
        });
        
        // Preload all contacts so they're immediately available when
        // the user navigates to the contacts list view page
        app.getContacts();
    },
    
    
    /*******************************************************************
     * 
     * Get Enterprise Contacts
     * 
     * Calls GET operation to collect all contacts from REST backend
     * and loads them into a listview.
     * 
     *******************************************************************/
    getContacts: function() {
    	
    	// Get ENTERPRISE Contacts
    	$.getJSON("http://10.126.87.99:8080/ETAPP-REST-1/contacts", function(contacts) {
    	    $("#enterprise_contacts_listview").empty();
    	    var items = [];
    	    var contactItem = "";
    	    var contactImage = "";
    	    var contactForm = null;
    	    
    	    $.each(contacts, function(index, contact) {
    	       //console.log("item: " + index + " " + contact.firstName + " city: " + contact.city);
    	       
    	    	// Hidden Contact Form
    	       contactForm = '<form id="' + contact.id + 'HiddenForm" data-ajax="false">';
    	       $.each(contact, function(field, value) {
    	    	   contactForm += '<input type="hidden" name="' + field + '" value="' + value + '"/>';
    	    	   //console.log("field = '" + field + "' value = '" + value + "'");
    	       });
    	       contactForm += '</form>';
    	       
    	       // Contact Image
    	       contactImage = '<img id="mugshot" src="img/mugshots/' + contact.id + '.jpg" alt="CSS"/>';
    	   
    	       // Contact List Item: link, image, name & hidden form
    	       contactItem = '<li>';
    	       contactItem += '<a href="#" id="' + contact.id + '">';
    	       contactItem += contactImage + contact.firstName + '<br/>' + contact.lastName + contactForm;
    	       contactItem += '</a>';
    	       contactItem += '</li>'; 
    	       items.push(contactItem);
    	    
    	       //console.log("contactItem = '" + contactItem + "'"); 
    	    
    	    });
    	    items.push('<li data-role="list-divider">List Divider</li>');
    	    $("#enterprise_contacts_listview").append(items);
    	    $("#enterprise_contacts_listview").listview("refresh");
    	});
    },
    
    /*******************************************************************
     * 
     * Calls POST operation to add new contact to REST backend.
     * The callbacks refresh the contact listview, or process JAX-RS
     * response codes to update the validation errors.
     * 
     *******************************************************************/
    postContact: function(contactForm) {
        
    	//clear existing  msgs
        $('span.invalid').remove();
        $('span.success').remove();

        // Display the loader widget
        $.mobile.loading("show");

        // Convert Form Data to JSON object
        var contactData = JSON.stringify(contactForm);
    	
        $.ajax({
            url: 'http://10.126.87.99:8080/ETAPP-REST-1/contacts',
            contentType: 'application/json',
            dataType: 'text',
            type: 'post',
            async: 'true',
            data:  contactData,
            
            success: function(data) {
                console.log("Contact Added");

                //clear input fields
                $('#postForm')[0].reset();
 
                //mark success on the registration form
                $('#formMsgs').append($('<span class="success">Contact Added</span>'));

                app.getContacts();
                $.mobile.changePage( "#enterprise_contacts_list_page", { transition: "slide"} );
            },
            error: function(error) {
                if ((error.status == 409) || (error.status == 400)) {
                    //console.log("Validation error registering user!");

                    var errorMsg = $.parseJSON(error.responseText);

                    $.each(errorMsg, function(index, val) {
                        $('<span class="invalid">' + val + '</span>').insertAfter($('#' + index));
                    });
                } else {
                    //console.log("error: " + error.responseText + " - unknown server issue");
                    console.log("error: " + error.status + " - unknown server issue");
                    
                    $('#formMsgs').append($('<span class="invalid">'+ error.responseText + '</span>'));
                }
            },
            complete: function() {
                // Hide the loader widget
                $.mobile.loading("hide");
            }
            
        });
    }
};

/*******************************************************************
 * 
 * BOOTSTRAP
 * 
 *******************************************************************/
//app.initialize();
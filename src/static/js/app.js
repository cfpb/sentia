
// Count all features included in the test page.
$('.feature-list').append(
  '<section class="feature-list_item block block__padded-top block__border-top">' +
  '<div class="feature-header"><h1 class="feature-header_name">jQuery</h1></div>' +
  '<p>jQuery is working and counts a total of ' +
  '<strong>' + $('.feature-list_item').size() + '</strong> ' +
  'cf-components.</p>' +
  '</section>'
);

function getData(endpoint, params){
	return $.ajax({
            url: endpoint,
            data: params,
            traditional: true,
            success: console.log('AJAX query successful')
        }).fail( function( status ){
            console.log( 'no data was available at' + endpoint + '. Status: ' + status );
        });
}

function init(){
	$.when(  ).then(   ).done( function(  ){

	});
}


// Document.ready:
$(function(){

});

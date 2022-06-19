$(function(){
    $("#botao1").click(function( event ) {
        event.preventDefault();
        $.post('http://localhost:3002/addlike/' + dados._id)
        alert( "O link já não funciona..." );
    });
});
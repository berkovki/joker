$('.signup-button').click(function() {
    $.ajax({
        type: 'POST',
        url: '/api/watch',
        data: $('.signup-form').serialize(),
        success: function(data) {
            console.log(JSON.stringify(data));

            var errored = (data.status == 'error') ? true : false;
            var alertClass = errored ? 'alert alert-danger' : 'alert alert-success';

            $('.jumbotron').prepend('<div class=\'' + alertClass + '\'>' + data.message + '<a class="close" data-dismiss="alert" href="#" aria-hidden="true">&times;</a>');
        }
    });

    return false;
});
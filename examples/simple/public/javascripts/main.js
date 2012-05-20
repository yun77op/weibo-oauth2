(function(){
  var $result = $('.result');

  $('.api-excute-btn').click(function() {
    var type = $('.api-type').val()
      , path = $('.api-path').val()
      , $params = $('.params')
      , params = {};

    $params.children().each(function(i, el) {
      var $el = $(this)
        , key = $.trim($('.param-key', $el).val())
        , val = $.trim($('.param-value', $el).val());
        // , placeholder = '{{' + key + '}}';

      if (key && val) {
        // if (~path.indexOf(placeholder)) {
        //   path = path.replace(placeholder, val);
        // } else {
          params[key] = val;
        // }
      }
    });

    params.path = path;
    params.type = type;

    $.ajax('/api', {
      data: params,
      type: 'post'
    }).complete(function(xhr, status) {
      $result.val(xhr.responseText);
    });

  });
}());


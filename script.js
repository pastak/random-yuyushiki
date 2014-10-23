$(function() {
  var query = decodeURIComponent(location.search).substring(1);
  var params = {};
  query.split('&').forEach(function(param) {
    var p = param.split('=');
    params[p[0]] = p[1];
  });
  var rehash = function() {
    history.pushState(null, null, '?' + $.param(params));
  };
  var setImageParam = function(index, image) {
    var images = params.images ? params.images.split(',') : [];
    images[index] = image;
    params.images = images.join(',');
  };

  $.getJSON('yuyushiki/yuyushiki.json').done(function(data) {
    var usedData = _.filter(data, function(image) {
      return !image.useless && !image.reedit;
    });
    var randomImage = function() {
      var image = usedData[Math.floor(Math.random() * usedData.length)];
      return image.path;
    };
    var generateImages = function() {
      var images = [];
      for (var i = 0; i < 4; ++i) {
        var image = randomImage();
        images.push(image);
        setImageParam(i, image);
      }
      rehash();
      return images;
    };
    var images = params.images ? params.images.split(',') : generateImages();
    var base = params.base || '';
    $.fn.randomize = function(time) {
      var path = randomImage();
      var index = $(this).parent().children().index(this);

      // load image before slot end
      $('<img>').attr('src', base + path);

      // slot start
      var img = this;
      var i = 0;
      var images = params.images.split(',');
      time = time === undefined ? 10 : time;
      var timer = setInterval(function() {
        ++i;
        $(img).attr('src', base + images[i % images.length]);
        if (i > time) {
          clearInterval(timer);
          $(img).attr('src', base + path);
          setImageParam(index, path);
          rehash();
        }
      }, 50);

      return this;
    };

    $('#images').empty();
    _.each(images, function(image) {
      var url = base + image;
      $('<img>').attr('src', url).click(function() {
        $(this).randomize();
      }).appendTo('#images');
    });
    $('#random-images').click(function() {
      $('#images img').each(function(i) {
        $(this).randomize((i + 1) * 10);
      });
      return false;
    });
    function getDataUrl() {
      var top = 0;
      var cWidth = 0;
      var cHeight = 0;
      var imgs = [];
      $('#images img').each(function(index, item) {
        imgs.push({
          elm: item,
          top: cHeight
        });
        cHeight += item.naturalHeight + 10;
        cWidth = Math.max(cWidth, item.naturalWidth);
      });
      var canvas = $('<canvas>').attr({width: cWidth + 4, height: cHeight});
      var ctx = canvas[0].getContext('2d');
      $.each(imgs, function(index, item) {
        ctx.drawImage(item.elm, 2, item.top);
      });
      return canvas[0].toDataURL();
    }
    $('#open-gyazo').click(function() {
      $.ajax('https://upload.gyazo.com/api/upload/easy_auth',{
        method: 'POST',
        dataType: 'json',
        data: {
          'client_id': '5f9b5db7f68e126f67f80da4c473ae48dea77ff0de3f82f7f94e95163b0f0f7f',
          'image_url': getDataUrl()
        }
      }).done(function(data) {
        window.open(data.get_image_url);
      });
    });
    $('#generate-data-url').click(function() {
      window.open(getDataUrl());
    });
  });
});

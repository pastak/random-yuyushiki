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
    $('#generate-data-url').click(function() {
      var top = 0;
      var cWidth = 0;
      var cHeight = 0;
      var imgs = [];
      $('#images img').each(function(index, item) {
        cHeight += item.naturalHeight + 10;
        cWidth = Math.max(cWidth, item.naturalWidth);
        imgs.push({
          elm: item,
          top: cHeight
        });
      });
      var canvas = $('<canvas>').attr({width: cWidth, height: cHeight});
      var ctx = canvas[0].getContext('2d');
      $.each(imgs, function(index, item) {
        ctx.drawImage(item.elm, 0, item.top);
      });
      window.open(canvas[0].toDataURL());
    });
  });
});

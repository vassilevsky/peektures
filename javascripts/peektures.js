(function() {
  var $, all_friends, all_photos, all_users, auth_handler, authorize, current_photo_id, next_keys, next_photo, previous_keys, previous_photo, show_photos, ts2date, update_main_photo, users,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  current_photo_id = -1;

  all_friends = [];

  all_photos = [];

  all_users = [];

  users = {};

  next_keys = [32, 39, 40, 74, 34];

  previous_keys = [75, 37, 33, 38];

  $ = function(id) {
    return document.getElementById(id);
  };

  auth_handler = function(response) {
    if (response.status === "connected") {
      return show_photos();
    } else {
      return authorize();
    }
  };

  authorize = function() {
    $("login_button").style.display = "";
    return $("photos").style.display = "none";
  };

  show_photos = function() {
    $("login_button").style.display = "none";
    $("photos").style.display = "";
    return FB.api("/fql", {
      q: {
        "friends": "SELECT uid2 FROM friend WHERE uid1 = me()",
        "photos": "SELECT owner, src_big, src_big_width, src_big_height, link, caption, created FROM photo WHERE aid IN (                    SELECT aid FROM album WHERE owner IN (SELECT uid2 FROM #friends)                  ) ORDER BY created DESC",
        "users": "SELECT uid, name, profile_url FROM user WHERE uid IN(SELECT owner FROM #photos)"
      }
    }, function(response) {
      var user, _i, _len;
      if (response.data && response.data.length) {
        all_friends = response.data[0].fql_result_set;
        all_photos = response.data[1].fql_result_set;
        all_users = response.data[2].fql_result_set;
        for (_i = 0, _len = all_users.length; _i < _len; _i++) {
          user = all_users[_i];
          users[user.uid] = user;
        }
        $("main_photo").onclick = next_photo;
        window.onkeydown = function(event) {
          var _ref, _ref1;
          if (_ref = event.keyCode, __indexOf.call(next_keys, _ref) >= 0) {
            return next_photo();
          } else if (_ref1 = event.keyCode, __indexOf.call(previous_keys, _ref1) >= 0) {
            return previous_photo();
          }
        };
        return next_photo();
      } else {
        return $("main_caption").innerHTML = "При загрузке списка фотографий возникла какая-то ошибка :(                                       Пожалуйста, попробуйте перезагрузить страницу.";
      }
    });
  };

  next_photo = function() {
    current_photo_id++;
    return update_main_photo();
  };

  previous_photo = function() {
    current_photo_id--;
    return update_main_photo();
  };

  update_main_photo = function() {
    var caption, i, main_photo, max_w, photo, target_h, user, _i, _results;
    photo = all_photos[current_photo_id];
    user = users[photo.owner];
    main_photo = $("main_photo");
    main_photo.src = photo.src_big;
    max_w = window.innerWidth;
    if (photo.src_big_width > max_w) {
      target_h = Math.round(max_w * photo.src_big_height / photo.src_big_width);
      main_photo.width = max_w;
      main_photo.height = target_h;
    } else {
      main_photo.width = photo.width;
      main_photo.height = photo.height;
    }
    caption = photo.caption;
    if (caption.length) {
      caption += " &mdash; ";
    }
    caption += "<i><a target='_blank' title='Открыть профиль в новой вкладке'              href='" + user.profile_url + "'>" + user.name + "</a>, " + (ts2date(photo.created)) + "</i>";
    caption += " <a target='_blank'                  title='Открыть в новой вкладке, чтобы поставить лайк или написать комментарий'                  href='" + photo.link + "'>&#9998;</a>";
    $("main_caption").innerHTML = caption;
    _results = [];
    for (i = _i = 1; _i <= 10; i = ++_i) {
      _results.push($("preload_" + i).src = all_photos[current_photo_id + i].src_big);
    }
    return _results;
  };

  ts2date = function(ts) {
    var d, ds;
    d = new Date(ts * 1000);
    ds = "" + (d.getMonth() + 1) + "/" + (d.getDate());
    if (d.getFullYear() < (new Date()).getFullYear()) {
      ds = "" + ds + "/" + (d.getFullYear());
    }
    return ds;
  };

  FB.init({
    appId: "138578366272412",
    status: true,
    cookie: true,
    xfbml: true,
    channelUrl: "//peektures.ru/channel.html"
  });

  FB.Event.subscribe("auth.authResponseChange", auth_handler);

  FB.getLoginStatus(auth_handler);

}).call(this);

(function() {
  var $, all_friends, all_photos, all_users, auth_handler, authorize, current_pid, hash_by, hashed_users, next_keys, next_photo, previous_keys, previous_photo, show_photos, ts2date, update_main_photo,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  current_pid = -1;

  all_friends = [];

  all_photos = [];

  all_users = [];

  hashed_users = [];

  next_keys = [32, 39, 40, 74, 34];

  previous_keys = [75, 37, 33, 38];

  $ = function(id) {
    return document.getElementById(id);
  };

  auth_handler = function(response) {
    if (response.status === 'connected') {
      return show_photos();
    } else {
      return authorize();
    }
  };

  authorize = function() {
    $('login_button').style.display = '';
    return $('photos').style.display = 'none';
  };

  show_photos = function() {
    $('login_button').style.display = 'none';
    $('photos').style.display = '';
    return FB.api('/fql', {
      q: {
        'friends': 'SELECT uid2 FROM friend WHERE uid1 = me()',
        'users': 'SELECT uid, name, profile_url FROM user WHERE uid IN (\
                    SELECT uid2 FROM #friends\
                  )',
        'photos': 'SELECT owner,\
                         src_big, src_big_width, src_big_height,\
                         link,\
                         caption,\
                         created\
                  FROM photo WHERE aid IN (\
                    SELECT aid FROM album WHERE owner IN (\
                      SELECT uid2 FROM #friends\
                    )\
                  ) ORDER BY created DESC'
      }
    }, function(response) {
      if (response.data && response.data.length) {
        all_friends = response.data[0].fql_result_set;
        all_photos = response.data[1].fql_result_set;
        all_users = response.data[2].fql_result_set;
        hashed_users = hash_by(all_users, 'uid');
        $('main_photo').onclick = next_photo;
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
        return $('main_caption').innerHTML = "There's some problem loading photos :(";
      }
    });
  };

  next_photo = function() {
    current_pid = current_pid + 1;
    return update_main_photo();
  };

  previous_photo = function() {
    current_pid = current_pid - 1;
    return update_main_photo();
  };

  update_main_photo = function() {
    var caption, i, p, u, _i, _results;
    p = all_photos[current_pid];
    u = hashed_users[p.owner];
    $('main_photo').src = p.src_big;
    caption = p.caption;
    if (caption.length) {
      caption += ' &mdash; ';
    }
    caption += '<i><a target="_blank"\
                    title="View profile in a new tab"\
                    href="' + u.profile_url + '">' + u.name + '</a>, ' + ts2date(p.created) + '</i>';
    caption += ' <a target="_blank"\
                  title="Open on Facebook in a new tab to write a comment or like"\
                  href="' + p.link + '">&#9998;</a>';
    $('main_caption').innerHTML = caption;
    _results = [];
    for (i = _i = 1; _i <= 10; i = ++_i) {
      _results.push($("preload_" + i).src = all_photos[current_pid + i].src_big);
    }
    return _results;
  };

  hash_by = function(array, property) {
    var element, hsh, _i, _len;
    hsh = {};
    for (_i = 0, _len = array.length; _i < _len; _i++) {
      element = array[_i];
      hsh[element[property]] = element;
    }
    return hsh;
  };

  ts2date = function(ts) {
    var d, ds;
    d = new Date(ts * 1000);
    ds = "" + (d.getMonth() + 1) + "/" + d.getDate();
    if (d.getFullYear() < (new Date()).getFullYear()) {
      ds = ds + "/" + d.getFullYear();
    }
    return ds;
  };

  FB.init({
    appId: '138578366272412',
    status: true,
    cookie: true,
    xfbml: true
  });

  FB.Event.subscribe('auth.authResponseChange', auth_handler);

  FB.getLoginStatus(auth_handler);

}).call(this);
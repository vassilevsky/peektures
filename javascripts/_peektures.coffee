current_photo_id = -1

all_friends = []
all_photos  = []
all_users   = []

users = {}

next_keys     = [32, 39, 40, 74, 34]
previous_keys = [75, 37, 33, 38]


$ = (id) -> document.getElementById id


auth_handler = (response) ->
  if response.status is "connected" then show_photos() else authorize()


authorize = ->
  $("login_button").style.display = ""
  $("photos"      ).style.display = "none"


show_photos = ->
  $("login_button").style.display = "none"
  $("photos"      ).style.display = ""

  FB.api(
    "/fql"
    q:
      "friends": "SELECT uid2 FROM friend WHERE uid1 = me()"
      "photos" : "SELECT owner, src_big, src_big_width, src_big_height, link, caption, created
                  FROM photo WHERE aid IN (
                    SELECT aid FROM album WHERE owner IN (
                      SELECT uid2 FROM #friends
                    )
                  ) ORDER BY created DESC"
      "users"  : "SELECT uid, name, profile_url FROM standard_user_info WHERE uid IN(
                    SELECT owner FROM #photos
                  )"
    (response) ->
      if response.data and response.data.length
        all_friends = response.data[0].fql_result_set
        all_photos  = response.data[1].fql_result_set
        all_users   = response.data[2].fql_result_set

        for user in all_users
          users[user.uid] = user

        $("main_photo").onclick = next_photo

        window.onkeydown = (event) ->
          if event.keyCode in next_keys
            next_photo()
          else if event.keyCode in previous_keys
            previous_photo()

        next_photo()
      else
        $("main_caption").innerHTML = "При загрузке списка фотографий возникла какая-то ошибка :(
                                       Пожалуйста, попробуйте перезагрузить страницу."
  )


next_photo = ->
  current_photo_id++
  update_main_photo()


previous_photo = ->
  current_photo_id--
  update_main_photo()


update_main_photo = ->
  photo = all_photos[current_photo_id]
  user = users[photo.owner]
  main_photo = $("main_photo")
  main_photo.src = photo.src_big

  max_w = $("body").offsetWidth
  if photo.src_big_width > max_w
    target_h = Math.round(max_w * photo.src_big_height / photo.src_big_width)

    main_photo.width = max_w
    main_photo.height = target_h
  else
    main_photo.width = photo.width
    main_photo.height = photo.height

  caption = photo.caption
  caption += " &mdash; " if caption.length
  caption += "<i><a target='_blank' title='Открыть профиль в новой вкладке'
              href='#{user.profile_url}'>#{user.name}</a>, #{ts2date(photo.created)}</i>"
  caption += " <a target='_blank'
                  title='Открыть в новой вкладке, чтобы поставить лайк или написать комментарий'
                  href='#{photo.link}'>&#9998;</a>"
  $("main_caption").innerHTML = caption

  $("preload_#{i}").src = all_photos[current_photo_id + i].src_big for i in [1..10]


ts2date = (ts) ->
  d = new Date(ts * 1000)
  ds = "#{d.getMonth() + 1}/#{d.getDate()}"

  if d.getFullYear() < (new Date()).getFullYear()
    ds = "#{ds}/#{d.getFullYear()}"

  ds

######################################################################################################################

FB.init
  appId      : "138578366272412"
  status     : true # check login status
  cookie     : true # enable cookies to allow the server to access the session
  xfbml      : true # parse XFBML
  channelUrl : "//peektures.ru/channel.html"

FB.Event.subscribe "auth.authResponseChange", auth_handler
FB.getLoginStatus auth_handler

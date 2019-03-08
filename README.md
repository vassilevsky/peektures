# Peektures

A minimalistic viewer of Facebook friend photos.

## History

I've only used Facebook to see photos of my friends they uploaded there. This was the only use case for me.
But Facebook's interface has always been too noisy and inconvenient for that. So I wrote this simple web page.
I wrote this for myself, but in a way that it could be used by any Facebook user.

It gained access to the user's account via Facebook Login, executed FQL queries to get all photos of all friends
in a sorted list (most recent first), and rendered a primitive slideshow out of it, on a black background.

It was in 2012. It worked fine and I liked using it.

## Current status

It doesn't work anymore, because Facebook disabled the API features used. They even require review for accessing
the user's own photos via API now. Sad.

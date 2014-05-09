npm to mobstor processor
========================

This script is designed to run via a crontab or a screen session.

It supports sequential updates, so if it's killed it will start over where it left off.

TLDR; it mirrors the npm registry into flat files stored in Mobstor.

what it does
------------

It uses the `follow` npm module to track the `changes` feed from https://skimdb.npmjs.com/registry

When a change is detected:

  * it will fetch the full `package.json` file
  * fetch all the attachments from that module
  * upload them all to mobstor
  * patch the `package.json` to replace the URL's to the tarballs
  * upload the patched `package.json` to mobstor

why?
----

http://blog.npmjs.org/post/83774616862/deprecating-fullfatdb


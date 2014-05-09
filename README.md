npm registry follower
=====================

This module is an addon to the `follow` that tracks changes
from skimdb and returns a handler with the json modified.

This is to be used by other modules, for example [registry-static](https://github.com/davglass/registry-static)

changes feed
------------

Instead of using the "standard" feed, this pulls the feed and breaks up the data into usable bits:

    {
        json: {.. the full package.json ..},
        versions: [ .. version info split into parts ..],
        tarballs: [ .. all of the tarball data (shasum and url) .. ]
    }


why?
----

http://blog.npmjs.org/post/83774616862/deprecating-fullfatdb

build
-----
[![Build Status](https://travis-ci.org/davglass/follow-registry.svg?branch=master)](https://travis-ci.org/davglass/follow-registry)

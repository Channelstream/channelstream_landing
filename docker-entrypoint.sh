#!/bin/bash
set -e
cp /opt/application/development.ini /opt/rundir/config.ini
if ! [ -z "$CHANNELSTREAM_URL" ]
then
    sourceVar="\/"
    replacementVar="\/"
    sed -i "s/channelstream.url.*/channelstream.url = ${CHANNELSTREAM_URL//$sourceVar/$replacementVar}/" /opt/rundir/config.ini
fi
if ! [ -z "$DEMO_URL" ]
then
    sourceVar="\/"
    replacementVar="\/"
    sed -i "s/demo.url.*/demo.url = ${DEMO_URL//$sourceVar/$replacementVar}/" /opt/rundir/config.ini
fi
if ! [ -z "$CHANNELSTREAM_PUBLIC_URL" ]
then
    sourceVar="\/"
    replacementVar="\/"
    sed -i "s/channelstream.public_url.*/channelstream.public_url = ${CHANNELSTREAM_PUBLIC_URL//$sourceVar/$replacementVar}/" /opt/rundir/config.ini
fi
if ! [ -z "$CHANNELSTREAM_WS_URL" ]
then
    sourceVar="\/"
    replacementVar="\/"
    sed -i "s/channelstream.ws_url.*/channelstream.ws_url = ${CHANNELSTREAM_WS_URL//$sourceVar/$replacementVar}/" /opt/rundir/config.ini
fi
if ! [ -z "$CHANNELSTREAM_SECRET" ]
then
    sourceVar="\/"
    replacementVar="\/"
    sed -i "s/channelstream.secret.*/channelstream.secret = ${CHANNELSTREAM_SECRET//$sourceVar/$replacementVar}/" /opt/rundir/config.ini
fi

if [ ! -f /opt/rundir/static_build/openapi.json ]; then
    pushd /opt/rundir
    channelstream_landing_build_statics config.ini --with-main-assets=0 --with-jsdoc=0
    popd
fi;

exec "$@"

# Running application via docker for production

    docker-compose up
    
Or manually

    # start the main server
    docker run --rm -p 8000:8000 -e CHANNELSTREAM_ALLOW_POSTING_FROM=0.0.0.0 channelstream/channelstream:latest
    # build the image for landing page backend
    docker build . -t channelstream_landing
    # run the backend code
    docker run -ti --rm -p 6543:6543 USER_UID=`id -u` USER_GID=`id -g` -e CHANNELSTREAM_URL=http://172.17.0.2:8000 channelstream_landing

   
# Running application via docker for development

    USER_UID=`id -u` USER_GID=`id -g` docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

Or manually
   
    # start the main server
    docker run --rm -p 8000:8000 -e CHANNELSTREAM_ALLOW_POSTING_FROM=0.0.0.0 channelstream/channelstream:latest
    
    # build the image for landing page backend
    docker build . -t channelstream_landing
    
    # run the backend code with hot reload
    docker run -ti --rm -p 6543:6543 -e USER_UID=`id -u` -e USER_GID=`id -g` \
    -e CHANNELSTREAM_URL=http://172.17.0.2:8000 \
    --mount type=bind,source="$(pwd)"/backend,target=/opt/application \
    --mount type=bind,source="$(pwd)"/rundir,target=/opt/rundir \
    channelstream_landing
    
    # build frontend code builder image
    docker build . -f Dockerfile.static -t channelstream_landing_statics
    
    # run the frontend code with hot reload
    docker run -ti --rm  -e USER_UID=`id -u` -e USER_GID=`id -g` \
    -e FRONTEND_ASSSET_ROOT_DIR=/opt/rundir/static_build \
    --mount type=bind,source="$(pwd)"/frontend,target=/opt/frontend \
    --mount type=bind,source="$(pwd)"/rundir,target=/opt/rundir \
    channelstream_landing_statics

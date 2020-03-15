# Use an official Python runtime as a parent image
FROM node:13.8.0-buster-slim AS static
RUN apt-get update && apt-get install -y \
    python3 make build-essential gosu \
 && rm -rf /var/lib/apt/lists/*

ENV PATH $PATH:env/bin
ENV PYTHON python3
# we do not want node to run as id 1000
RUN groupmod -g 999 node && usermod -u 999 -g 999 node
RUN useradd --create-home application
USER application
COPY --chown=application frontend /opt/frontend
WORKDIR /opt/frontend
ENV FRONTEND_ASSSET_ROOT_DIR /opt/frontend/static_build
RUN yarn
RUN yarn jsdoc
RUN yarn build
# throw away the js container
# Use an official Python runtime as a parent image
FROM python:3.7.6-slim-stretch

RUN apt-get update && apt-get install -y \
    gosu \
 && rm -rf /var/lib/apt/lists/*

# Set the working directory to /opt/application
WORKDIR /opt/application

# create application user
RUN useradd --create-home application

RUN chown -R application /opt/application
RUN mkdir /opt/rundir
RUN chown -R application /opt/rundir
RUN mkdir /opt/venv
RUN chown -R application /opt/venv
RUN mkdir /opt/rundir/static_build
RUN chown -R application /opt/rundir/static_build
# Copy the current directory contents into the container at /opt/application
COPY backend/requirements.txt /tmp/requirements.txt

# change to non-root user
USER application

RUN python -m venv /opt/venv
# Install any needed packages specified in requirements.txt
RUN /opt/venv/bin/pip install --disable-pip-version-check --trusted-host pypi.python.org -r /tmp/requirements.txt --no-cache-dir
# make application scripts visible
ENV PATH $PATH:/opt/venv/bin
# Copy the current directory contents into the container at /opt/application
COPY docker-entrypoint.sh /opt/docker-entrypoint.sh
COPY --chown=application backend /opt/application
# install the app
RUN /opt/venv/bin/pip install --disable-pip-version-check --trusted-host pypi.python.org -e .

# copy pre-built js
COPY --from=static --chown=application /opt/frontend/static_build /opt/rundir/static_build
# Make port 6543 available to the world outside this container
EXPOSE 6543
VOLUME /opt/rundir
USER root
ENTRYPOINT ["/opt/docker-entrypoint.sh"]
# Run application when the container launches
CMD ["pserve", "/opt/rundir/config.ini"]

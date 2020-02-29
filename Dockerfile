# Use an official Python runtime as a parent image
FROM node:13.8.0-buster-slim AS static
# why do I need python to install nodejs reqs? python 2 at that :/
RUN apt update; apt install python3 make build-essential -y

ENV PATH $PATH:env/bin
ENV PYTHON python3
COPY frontend /opt/frontend
WORKDIR /opt/frontend
RUN yarn
RUN yarn jsdoc
RUN yarn build
# throw away the js container
# Use an official Python runtime as a parent image
FROM python:3.7.6-slim-stretch

# Set the working directory to /opt/application
WORKDIR /opt/application

# create application user
RUN useradd --create-home application

RUN chown -R application /opt/application
RUN mkdir /opt/rundir
RUN chown -R application /opt/rundir
RUN mkdir /opt/venv
RUN chown -R application /opt/venv
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
COPY backend /opt/application
# install the app
RUN /opt/venv/bin/pip install --disable-pip-version-check --trusted-host pypi.python.org -e .

# copy pre-built js
COPY --from=static /opt/static /opt/rundir/static
# Make port 6543 available to the world outside this container
EXPOSE 6543
VOLUME /opt/rundir
ENTRYPOINT ["/opt/docker-entrypoint.sh"]
# Run application when the container launches
CMD ["pserve", "/opt/rundir/config.ini"]

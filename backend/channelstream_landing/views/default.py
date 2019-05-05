import json
import random
import requests

from itsdangerous import TimestampSigner
from pyramid.view import view_config


@view_config(route_name="/", renderer="../templates/index.jinja2")
def index_view(request):
    return {
        "project": "channelstream_landing",
        "demo_username": f"Anon-{random.randint(1, 999)}",
    }


@view_config(route_name="demo_payload_relay", renderer="json")
def demo_payload_relay(request):
    server_url = request.registry.settings["channelstream.url"]
    endpoint = request.json_body["endpoint"]
    payload = request.json_body["payload"]
    method = request.json_body["method"]
    signer = TimestampSigner("secret")
    sig_for_server = signer.sign("channelstream")
    secret_headers = {
        "x-channelstream-secret": sig_for_server,
        "Content-Type": "application/json",
    }
    url = f"{server_url}{endpoint}"
    response = getattr(requests, method)(
        url, data=json.dumps(payload), headers=secret_headers
    )

    return response.json()

@view_config(route_name="connect", renderer="json")
def connect(request):
    server_url = request.registry.settings["channelstream.url"]
    endpoint = "/connect"
    signer = TimestampSigner("secret")
    sig_for_server = signer.sign("channelstream")
    secret_headers = {
        "x-channelstream-secret": sig_for_server,
        "Content-Type": "application/json",
    }
    # in production you should validate this
    payload = {
        "username": request.json_body.get("username") or f"Demo-user-{random.randint(1, 99999)}",
        "channels": request.json_body["channels"]
    }
    url = f"{server_url}{endpoint}"
    response = requests.post(
        url, data=json.dumps(payload), headers=secret_headers
    )
    return response.json()

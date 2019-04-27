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
    endpoint = request.json_body["url"]
    payload = request.json_body["payload"]
    method = request.json_body["method"]

    server_port = 8000
    signer = TimestampSigner("secret")
    sig_for_server = signer.sign("channelstream")
    secret_headers = {
        "x-channelstream-secret": sig_for_server,
        "Content-Type": "application/json",
    }
    url = "http://127.0.0.1:%s%s" % (server_port, endpoint)
    response = getattr(requests, method)(
        url, data=json.dumps(payload), headers=secret_headers
    )

    return response.json()

@view_config(route_name="connect", renderer="json")
def connect(request):
    endpoint = "/connect"
    server_port = 8000
    signer = TimestampSigner("secret")
    sig_for_server = signer.sign("channelstream")
    secret_headers = {
        "x-channelstream-secret": sig_for_server,
        "Content-Type": "application/json",
    }
    payload = {
        "username": f"Demo-user-{random.randint(1, 99999)}",
        # in production you should validate this
        "channels": request.json_body["channels"]
    }
    url = "http://127.0.0.1:%s%s" % (server_port, endpoint)
    response = requests.post(
        url, data=json.dumps(payload), headers=secret_headers
    )
    return response.json()

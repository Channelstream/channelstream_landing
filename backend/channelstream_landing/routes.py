import pathlib
from pyramid.security import NO_PERMISSION_REQUIRED


def includeme(config):
    config.add_static_view('static', 'static', cache_max_age=1,
                           permission=NO_PERMISSION_REQUIRED)
    # add bundled static support
    config.add_static_view(
        "static_bundled", "static_bundled", cache_max_age=1, permission=NO_PERMISSION_REQUIRED
    )
    path = pathlib.Path(config.registry.settings["statics.build_dir"])
    path.mkdir(exist_ok=True)
    config.override_asset(
        to_override="channelstream_landing:static_bundled/",
        override_with=config.registry.settings["statics.build_dir"],
    )

    config.add_route('/', '/')
    # relay used by the snippet tests
    config.add_route('demo_payload_relay', '/demo/demo_payload_relay')
    config.add_route('connect', '/connect')
    config.add_route('message', '/message')
    config.add_route('demo', '/demo/{view}')
    config.add_route('doc', '/doc/{page}')
    config.add_route('channelstream_demo', config.registry.settings["demo.url"])
    config.add_route('channelstream_public_url', config.registry.settings['channelstream.public_url'])
    config.add_route('channelstream_ws_url', config.registry.settings['channelstream.ws_url'])

import pathlib
from pyramid.security import NO_PERMISSION_REQUIRED


def includeme(config):
    config.add_static_view('static', 'static', cache_max_age=1,
                           permission=NO_PERMISSION_REQUIRED)
    # add bundled static support
    config.add_static_view(
        "static_bundled", "static_bundled", cache_max_age=1, permission=NO_PERMISSION_REQUIRED
    )
    path = pathlib.Path(config.registry.settings["statics.dir"])
    path.mkdir(exist_ok=True)
    config.override_asset(
        to_override="channelstream_landing:static_bundled/",
        override_with=config.registry.settings["statics.dir"],
    )

    config.add_route('/', '/')
    config.add_route('demo', '/demo/{view}')
    config.add_route('tutorials', '/tutorials/{view}')

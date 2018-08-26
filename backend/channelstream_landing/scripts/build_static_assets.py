import argparse
import logging
import os
import shutil
import subprocess
import sys

import pkg_resources
from pyramid.paster import bootstrap, setup_logging

log = logging.getLogger(__name__)


def build_assets(registry, *cmd_args, **cmd_kwargs):
    settings = registry.settings
    build_dir = settings["statics.build_dir"]
    try:
        shutil.rmtree(build_dir)
    except FileNotFoundError as exc:
        log.warning(exc)
    assets_path = os.path.abspath(
        pkg_resources.resource_filename("channelstream_landing", "../../frontend")
    )
    # copy package static sources to temporary build dir
    shutil.copytree(
        assets_path,
        build_dir,
        ignore=shutil.ignore_patterns(
            "node_modules", "bower_components", "__pycache__"
        ),
    )
    # can be picked up by webpack/rollup/gulp config for configuration information
    os.environ["FRONTEND_ASSSET_ROOT_DIR"] = settings["statics.dir"]
    # your commands to execute
    subprocess.run(["yarn"], env=os.environ, cwd=build_dir, check=True)
    subprocess.run(["yarn", "build"], env=os.environ, cwd=build_dir, check=True)


def parse_args(argv):
    parser = argparse.ArgumentParser()
    parser.add_argument("config_uri", help="Configuration file, e.g., development.ini")
    return parser.parse_args(argv[1:])


def main(argv=sys.argv):
    args = parse_args(argv)
    setup_logging(args.config_uri)
    env = bootstrap(args.config_uri)
    request = env["request"]
    build_assets(request.registry)

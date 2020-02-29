import argparse
import io
import json
import logging
import os
import pathlib
import shutil
import subprocess
import sys
import itsdangerous
import requests

import pkg_resources
from pyramid.paster import bootstrap, setup_logging
from pyramid.settings import asbool

log = logging.getLogger(__name__)


def prepare_static_envs(registry, copy_tmp_statics=True):
    settings = registry.settings
    # destination directory for static files that will be used for serving
    build_dir = settings["statics.build_dir"]
    # will be used as a tmp dir to avoid read-only FS problems for systems like nix
    tmp_build_dir = settings["statics.dir"]
    pathlib.Path(build_dir).mkdir(exist_ok=True)
    if copy_tmp_statics:
        try:
            shutil.rmtree(tmp_build_dir)
        except FileNotFoundError as exc:
            log.warning(exc)
        # your application frontend source code and configuration directory
        # usually the containing main package.json
        assets_path = os.path.abspath(
            pkg_resources.resource_filename("channelstream_landing", "../../frontend")
        )
        assets_path = os.environ.get("CHANNELSTREAM_FRONTEND_REPO_DIR", assets_path)
        # copy package static sources to temporary build dir
        shutil.copytree(
            assets_path,
            tmp_build_dir,
            ignore=shutil.ignore_patterns(
                "node_modules", "bower_components", "__pycache__"
            ),
        )

    # configuration files/variables can be picked up by webpack/rollup/gulp
    os.environ["FRONTEND_ASSSET_ROOT_DIR"] = build_dir
    worker_config = {"frontendAssetRootDir": build_dir}
    with io.open(pathlib.Path(tmp_build_dir) / "pyramid_config.json", "w") as f:
        f.write(json.dumps(worker_config))
    return build_dir, tmp_build_dir


def build_assets(registry, *cmd_args, **cmd_kwargs):
    _, tmp_build_dir = prepare_static_envs(registry)
    # your actual build commands to execute:

    # download all requirements
    subprocess.run(["yarn"], env=os.environ, cwd=tmp_build_dir, check=True)
    subprocess.run(["yarn", "build"], env=os.environ, cwd=tmp_build_dir, check=True)


def build_static_api_explorer(registry, *cmd_args, **cmd_kwargs):
    settings = registry.settings
    build_dir = settings["statics.build_dir"]
    pathlib.Path(build_dir).mkdir(exist_ok=True)
    # grab api explorer
    signer = itsdangerous.TimestampSigner(settings["channelstream.secret"])
    sig_for_server = signer.sign("channelstream")

    result = requests.get(
        f"{settings['channelstream.url']}/api-explorer",
        headers={"x-channelstream-secret": sig_for_server},
    )
    # rewrite the location of channelstream lib
    to_write = result.text.replace(
        f"from '{settings['channelstream.url']}/static/channelstream/index.js'",
        f"from '/static_bundled/node_modules/@channelstream/channelstream/src/index.js'",
    ).replace(f"{settings['channelstream.url']}/openapi.json", "/static_bundled/openapi.json")
    with io.open(pathlib.Path(build_dir) / "api-explorer.html", "w") as f:
        f.write(to_write)
    result = requests.get(
        f"{settings['channelstream.url']}/openapi.json",
        headers={"x-channelstream-secret": sig_for_server},
    )
    with io.open(pathlib.Path(build_dir) / "openapi.json", "w") as f:
        f.write(result.text)


def build_js_doc(registry, *cmd_args, **cmd_kwargs):
    build_dir, tmp_build_dir = prepare_static_envs(registry)
    # download all requirements
    subprocess.run(["yarn"], env=os.environ, cwd=tmp_build_dir, check=True)
    # run build process for JS
    subprocess.run(["yarn", "jsdoc"], env=os.environ, cwd=tmp_build_dir, check=True)


def parse_args(argv):
    parser = argparse.ArgumentParser()
    parser.add_argument("config_uri", help="Configuration file, e.g., development.ini")
    parser.add_argument("--with-jsdoc", default=True, type=asbool, help="Build js doc")
    parser.add_argument("--with-api-explorer", default=True, type=asbool, help="Build api explorer")
    parser.add_argument("--with-main-assets", default=True, type=asbool, help="Build site statics")
    return parser.parse_args(argv[1:])


def main(argv=sys.argv):
    args = parse_args(argv)
    setup_logging(args.config_uri)
    env = bootstrap(args.config_uri)
    request = env["request"]
    print(vars(args))
    if args.with_jsdoc:
        print("Building JS DOC")
        build_js_doc(request.registry)
    if args.with_main_assets:
        print("Building assets")
        build_assets(request.registry)
    if args.with_api_explorer:
        print("Building API explorer")
        build_static_api_explorer(request.registry)

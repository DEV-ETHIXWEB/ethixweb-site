#!/bin/sh
# Runs npm without the misnamed cache setting Vercel's build image exports.
#
# Vercel sets npm_config_cache_dir. npm has no "cache-dir" option (the real
# one is "cache"), so npm 11 printed `Unknown env config "cache-dir"` on every
# build and then ignored the value; the cache stayed where it always was.
# Dropping the variable removes the warning and changes nothing npm does.
# Used by installCommand and buildCommand in vercel.json.
unset npm_config_cache_dir NPM_CONFIG_CACHE_DIR
exec npm "$@"

import pathlib
import getpass
import os

USERNAME = getpass.getuser()

DISCORD_PATH = f'/home/{USERNAME}/.config/discord/'

INDEX_PATH = '/modules/discord_desktop_core/index.js'

HUECORD_PATH = pathlib.Path(__file__).parent.absolute()

INJECTION_DIR = os.path.join(HUECORD_PATH,"mod")

INJECTION_PATH = os.path.join(INJECTION_DIR,"injection.js")


def detect_versions(discordpath, idxsubpath):
    for elem in os.listdir(discordpath):
        if len(elem.split('.')) == 3:
            result = discordpath + elem + idxsubpath
            if os.path.exists(result):
                return result
        
'''detect_versions = lambda discordpath,idxsubpath: [
        (discordpath+vsn+idxsubpath, vsn) for vsn in (os.listdir(discordpath) 
            if os.path.exists(discordpath) else []) 
            if os.path.isdir(discordpath+vsn) and len(vsn.split('.')) == 3 ]'''

DEFAULT_INDEX_PATH = detect_versions(DISCORD_PATH, INDEX_PATH)

if __name__ == "__main__":
    print("Installing huecord :)")
    with open(DEFAULT_INDEX_PATH, 'w') as f:
        f.write(f'''
process.env.injDir = '{INJECTION_DIR}';
require('{INJECTION_PATH}');
module.exports = require('./core.asar');
        ''')
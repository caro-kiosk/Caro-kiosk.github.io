from github import Github
import git
import os
# Interface

# Your key
TOKEN = "ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"  # Dein PAT
REPO_NAME = "caro-kiosk"  # Dein Repo-Name (z.B. caro-kiosk)
USERNAME = "caro-kiosk"   # Dein GitHub Username

g = Github(TOKEN)
repo = g.get_repo(f"{USERNAME}/{REPO_NAME}")

# 1. Creating the file locally
filename = "matrix_zeichen.txt"
content = """Matrix-Regen Zeichen:
0-9, A-Z, a-z
Halbbreite Katakana: ｱｲｳｴｵｶｷｸｹｺ..."""
with open(filename, "w", encoding="utf-8") as f:
    f.write(content)

# 2. upload to github (using the API no local git needed)
try:
    # Prüfen ob Datei existiert
    try:
        existing_file = repo.get_contents(filename)
        repo.update_file(
            path=filename,
            message="Update matrix_zeichen.txt",
            content=content.encode("utf-8"),
            sha=existing_file.sha
        )
        print(f"Datei {filename} aktualisiert.")
    except:
        # create the file
        repo.create_file(
            path=filename,
            message="Add matrix_zeichen.txt",
            content=content.encode("utf-8")
        )
        print(f"Datei {filename} erstellt.")
except Exception as e:
    print(f"Fehler: {e}")

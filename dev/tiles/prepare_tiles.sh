#!/usr/bin/env bash
set -euo pipefail

# prepare_tiles.sh
# Télécharge un extrait OSM (Madagascar) et génère un fichier MBTiles pour
# Antananarivo (bbox configurable) en utilisant tilemaker Docker.
# Puis lance le tileserver (docker-compose) pour servir les tuiles.

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DATA="$DIR/data"
MBT="$DATA/antananarivo.mbtiles"
PBF="$DATA/madagascar-latest.osm.pbf"
# bbox: lon_min,lat_min,lon_max,lat_max (valeurs approximatives pour Antananarivo)
BBOX="47.35,-19.10,47.70,-18.60"

mkdir -p "$DATA"

# 1) Téléchargement si nécessaire
if [ ! -f "$PBF" ]; then
  echo "➡️  Téléchargement de Madagascar OSM PBF (Geofabrik)..."
  wget -c -O "$PBF" "https://download.geofabrik.de/africa/madagascar-latest.osm.pbf"
else
  echo "ℹ️  Fichier PBF déjà présent: $PBF"
fi

# 2) Génération MBTiles
if [ -f "$MBT" ]; then
  echo "✅ MBTiles déjà existant: $MBT"
else
  echo "➡️  Génération de MBTiles pour Antananarivo (bbox=$BBOX) avec tilemaker..."
  docker run --rm -v "$DATA":/data systemed/tilemaker --input /data/$(basename "$PBF") --output /data/antananarivo.mbtiles --bbox "$BBOX"
  echo "✅ MBTiles généré: $MBT"
fi

# 3) Démarrer le tileserver via docker-compose
echo "➡️  Démarrage de tileserver (docker compose up -d)..."
(cd "$DIR" && docker compose up -d)

echo "✅ Tileserver démarré. Ouvrez http://localhost:8081/ pour voir les styles et endpoints."

echo "
Conseils d'utilisation dans Leaflet:
  - Vérifiez le style disponible sur http://localhost:8081/
  - Exemple (si style s'appelle 'antananarivo'):
      L.tileLayer('http://localhost:8081/styles/antananarivo/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(map);
  - Si l'endpoint direct PNG n'existe pas, utilisez les tuiles vector /styles/{style}/style.json ou rasterisez via tileserver.
"

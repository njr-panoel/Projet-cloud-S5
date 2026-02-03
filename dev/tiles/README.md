# Serveur de tuiles (offline) pour Antananarivo

But: Ce dossier contient des scripts pour générer un MBTiles local pour la ville d'Antananarivo
et lancer un `tileserver-gl` pour servir les tuiles localement.

Prérequis
- Docker et Docker Compose installés
- Connexion internet pour télécharger l'extrait OSM (uniquement la première fois)

Étapes rapides
1. Construire les tuiles et démarrer le serveur:
   ./prepare_tiles.sh

2. Vérifier l'interface: http://localhost:8081/

3. Exemple pour Leaflet (à adapter selon le style exposé par tileserver):

```js
// si le style s'appelle 'antananarivo' (vérifier sur l'interface)
L.tileLayer('http://localhost:8081/styles/antananarivo/{z}/{x}/{y}.png', {
  maxZoom: 18,
  attribution: '© OpenStreetMap contributors'
}).addTo(map)
```

Remarques
- Le script télécharge "madagascar-latest.osm.pbf" depuis Geofabrik puis génère
  `antananarivo.mbtiles` en utilisant `tilemaker` (Docker image officielle).
- Le bbox utilisé est approximatif. Si vous souhaitez un extrait plus large/plus précis,
  modifiez la variable `BBOX` dans `prepare_tiles.sh`.

Dépannage
- Si la génération échoue faute de mémoire, réduisez le bbox ou générez la zone via Overpass.
- Pour obtenir une zone encore plus petite et propre (juste la ville) envisagez d'extraire
  via osmium/osmconvert avant d'exécuter tilemaker.

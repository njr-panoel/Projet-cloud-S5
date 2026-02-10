-- SQL pour ajouter des photos de test aux signalements
-- Utilise des images de routes/nids de poule depuis Unsplash

-- Mettre à jour les signalements avec des photos de test
UPDATE signalements 
SET photos = 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800'
WHERE id = 1;

UPDATE signalements 
SET photos = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800'
WHERE id = 2;

UPDATE signalements 
SET photos = 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=800,https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800'
WHERE id = 3;

-- Ou mettre à jour TOUS les signalements sans photo avec une image par défaut
UPDATE signalements 
SET photos = 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800'
WHERE photos IS NULL OR photos = '';

-- Vérifier :
SELECT id, titre, photos FROM signalements;
